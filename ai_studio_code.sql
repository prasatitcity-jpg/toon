-- ====================================================================
-- Prasat Community Care (ระบบแจ้งและติดตามปัญหาชุมชน อำเภอปราสาท จ.สุรินทร์)
-- Database Architecture & Row Level Security (RLS) Specification
-- Roles: citizen (ประชาชน), staff (เจ้าหน้าที่)
-- ====================================================================

-- 0. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Helper Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. Profiles Table (Linked to auth.users)
-- Strict Role Control: citizen (ประชาชน) and staff (เจ้าหน้าที่) only
CREATE TABLE IF NOT EXISTS public.profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen', 'staff')),
    sub_district TEXT,
    village TEXT,
    address TEXT,
    department TEXT,
    avatar TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
    last_seen TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_sub_district ON public.profiles(sub_district);
CREATE INDEX IF NOT EXISTS idx_profiles_last_seen ON public.profiles(last_seen DESC);

-- 2. Reports / Issues Table
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'road', 'street_light', 'garbage', 'water_supply',
        'tree_blocking', 'road_obstacle', 'noise', 'other'
    )),
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'acknowledged', 'in_progress', 'resolved', 'closed'
    )),
    urgency TEXT NOT NULL DEFAULT 'medium' CHECK (urgency IN (
        'low', 'medium', 'high', 'urgent'
    )),
    location_name TEXT NOT NULL,
    province TEXT DEFAULT 'สุรินทร์',
    district TEXT DEFAULT 'อำเภอปราสาท',
    subdistrict TEXT,
    village TEXT,
    location_detail TEXT,
    latitude NUMERIC(10, 6) NOT NULL,
    longitude NUMERIC(10, 6) NOT NULL,
    reporter_name TEXT NOT NULL,
    reporter_phone TEXT NOT NULL,
    reporter_email TEXT,
    image_url TEXT,
    after_image_url TEXT,
    officer_notes TEXT,
    assigned_department TEXT,
    assigned_officer TEXT,
    contact_log JSONB DEFAULT '[]'::jsonb,
    timeline JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

DROP TRIGGER IF EXISTS trg_reports_updated_at ON public.reports;
CREATE TRIGGER trg_reports_updated_at
    BEFORE UPDATE ON public.reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_reports_ticket_number ON public.reports(ticket_number);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON public.reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_category ON public.reports(category);
CREATE INDEX IF NOT EXISTS idx_reports_subdistrict ON public.reports(subdistrict);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports(created_at DESC);

-- 3. Report Updates / Action Log
CREATE TABLE IF NOT EXISTS public.report_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL,
    note TEXT,
    photo_url TEXT,
    staff_id UUID REFERENCES auth.users(id),
    staff_name TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_report_updates_report_id ON public.report_updates(report_id);

-- 4. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    ticket_code TEXT NOT NULL,
    issue_title TEXT NOT NULL,
    old_status TEXT,
    new_status TEXT NOT NULL,
    officer_name TEXT,
    officer_notes TEXT,
    after_image_url TEXT,
    is_read BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- ====================================================================
-- Security Definer Functions (Role Checking & Privacy Protection)
-- ====================================================================

-- Check if current authenticated user is a verified staff member from the database
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE user_id = auth.uid()
          AND role = 'staff'
          AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Safe Online Members Aggregation (Never leaks citizen personal details)
CREATE OR REPLACE FUNCTION public.get_online_members_stats()
RETURNS TABLE (
    online_citizens BIGINT,
    online_staff BIGINT,
    total_active BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(CASE WHEN role = 'citizen' THEN 1 END) AS online_citizens,
        COUNT(CASE WHEN role = 'staff' THEN 1 END) AS online_staff,
        COUNT(1) AS total_active
    FROM public.profiles
    WHERE last_seen >= (timezone('utc'::text, now()) - INTERVAL '5 minutes')
      AND status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Automatic Profile Creation Trigger on Supabase Auth Sign Up
-- STRICT RULE: All self-registered users are ALWAYS assigned role = 'citizen'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        user_id,
        name,
        email,
        phone,
        role,
        sub_district,
        village,
        status,
        last_seen
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', 'ประชาชน อ.ปราสาท'),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        'citizen', -- Always citizen. Never staff.
        COALESCE(NEW.raw_user_meta_data->>'sub_district', 'กังแอน'),
        COALESCE(NEW.raw_user_meta_data->>'village', ''),
        'active',
        timezone('utc'::text, now())
    )
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ====================================================================
-- Row Level Security (RLS) Policies
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------------------
-- PROFILES POLICIES
-- --------------------------------------------------------------------
-- Citizen can only read their own profile; Staff can read profiles for duty
CREATE POLICY "profiles_select_policy"
    ON public.profiles FOR SELECT
    USING (
        auth.uid() = user_id
        OR public.is_staff()
    );

-- Citizen can only insert their own profile with role = 'citizen'
CREATE POLICY "profiles_insert_policy"
    ON public.profiles FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND role = 'citizen'
    );

-- Citizen can update their own personal info, but CANNOT alter their role
CREATE POLICY "profiles_update_own"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (
        auth.uid() = user_id
        -- Ensure role cannot be elevated to staff by user
        AND (role = (SELECT p.role FROM public.profiles p WHERE p.user_id = auth.uid()))
    );

-- --------------------------------------------------------------------
-- REPORTS POLICIES
-- --------------------------------------------------------------------
-- Citizen reads only their own reports; Staff reads all reports across 18 subdistricts
CREATE POLICY "reports_select_policy"
    ON public.reports FOR SELECT
    USING (
        auth.uid() = user_id
        OR public.is_staff()
    );

-- Citizen can insert reports linked to their own user_id
CREATE POLICY "reports_insert_policy"
    ON public.reports FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
    );

-- Staff can update any report (status, notes, after_image). Citizen can only update pending reports.
CREATE POLICY "reports_update_policy"
    ON public.reports FOR UPDATE
    USING (
        public.is_staff()
        OR (auth.uid() = user_id AND status = 'pending')
    );

-- Only staff can delete/archive reports
CREATE POLICY "reports_delete_policy"
    ON public.reports FOR DELETE
    USING (
        public.is_staff()
    );

-- --------------------------------------------------------------------
-- REPORT UPDATES POLICIES
-- --------------------------------------------------------------------
CREATE POLICY "report_updates_select_policy"
    ON public.report_updates FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.reports r
            WHERE r.id = report_updates.report_id
              AND (r.user_id = auth.uid() OR public.is_staff())
        )
    );

CREATE POLICY "report_updates_insert_policy"
    ON public.report_updates FOR INSERT
    WITH CHECK (
        public.is_staff()
    );

-- --------------------------------------------------------------------
-- NOTIFICATIONS POLICIES
-- --------------------------------------------------------------------
CREATE POLICY "notifications_select_policy"
    ON public.notifications FOR SELECT
    USING (
        auth.uid() = user_id
        OR public.is_staff()
    );

CREATE POLICY "notifications_update_policy"
    ON public.notifications FOR UPDATE
    USING (
        auth.uid() = user_id
    );
