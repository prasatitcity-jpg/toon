-- ====================================================================
-- Prasat Community Care (ระบบแจ้งและติดตามปัญหาชุมชน อำเภอปราสาท)
-- PostgreSQL & Supabase Database Schema with Seed Data
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ฟังก์ชันอัปเดต timestamp อัตโนมัติ (Trigger Function)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. ตารางผู้ใช้งาน (users)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    username TEXT UNIQUE,
    password TEXT DEFAULT 'password123',
    email TEXT UNIQUE,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen', 'officer', 'admin')),
    sub_district TEXT,
    village TEXT,
    address TEXT,
    department TEXT,
    avatar TEXT,
    is_online BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 2. ตารางเรื่องร้องเรียน/ปัญหาชุมชน (issues)
CREATE TABLE IF NOT EXISTS issues (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    ticket_code TEXT UNIQUE NOT NULL,
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
    sub_district TEXT,
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

DROP TRIGGER IF EXISTS trg_issues_updated_at ON issues;
CREATE TRIGGER trg_issues_updated_at
    BEFORE UPDATE ON issues
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_issues_ticket_code ON issues(ticket_code);
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
CREATE INDEX IF NOT EXISTS idx_issues_category ON issues(category);
CREATE INDEX IF NOT EXISTS idx_issues_sub_district ON issues(sub_district);
CREATE INDEX IF NOT EXISTS idx_issues_reporter_phone ON issues(reporter_phone);
CREATE INDEX IF NOT EXISTS idx_issues_created_at ON issues(created_at DESC);

-- 3. ตารางการแจ้งเตือน (notifications)
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    ticket_id TEXT REFERENCES issues(id) ON DELETE CASCADE,
    ticket_code TEXT NOT NULL,
    issue_title TEXT NOT NULL,
    old_status TEXT NOT NULL,
    new_status TEXT NOT NULL,
    officer_name TEXT,
    officer_notes TEXT,
    after_image_url TEXT,
    sub_district TEXT,
    village TEXT,
    is_read BOOLEAN DEFAULT false,
    reporter_name TEXT,
    reporter_phone TEXT,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notifications_ticket_code ON notifications(ticket_code);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- 4. นโยบายความปลอดภัย Supabase Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read users" ON users FOR SELECT USING (true);
CREATE POLICY "Allow public insert users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update users" ON users FOR UPDATE USING (true);

CREATE POLICY "Allow public read issues" ON issues FOR SELECT USING (true);
CREATE POLICY "Allow public insert issues" ON issues FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update issues" ON issues FOR UPDATE USING (true);

CREATE POLICY "Allow public read notifications" ON notifications FOR SELECT USING (true);
CREATE POLICY "Allow public insert notifications" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update notifications" ON notifications FOR UPDATE USING (true);

-- 5. ข้อมูลตัวอย่างเริ่มต้น (Seed Data)
INSERT INTO users (id, name, username, password, email, phone, role, sub_district, village, address, department, avatar, is_online)
VALUES
(
  'usr-1', 'คุณสมชาย ใจดี', 'somchai', 'password123', 'somchai.citizen@example.com',
  '081-234-5678', 'citizen', 'กังแอน', 'หมู่ 1 บ้านปะอาว', 'บ้านเลขที่ 45 หมู่ 1 ต.กังแอน อ.ปราสาท จ.สุรินทร์',
  NULL, 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80', true
),
(
  'usr-2', 'นายช่างเกรียงไกร สิทธิโชค', 'kriangkrai', 'password123', 'kriangkrai.officer@communitycare.gov.th',
  '089-876-5432', 'officer', 'กังแอน', NULL, NULL,
  'กองช่าง เทศบาลตำบลกังแอน', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80', true
),
(
  'usr-3', 'นางสาวกานดา รักชุมชน', 'kanda', 'password123', 'kanda.admin@communitycare.gov.th',
  '086-555-1234', 'officer', 'เชื้อเพลิง', NULL, NULL,
  'กองสาธารณสุขและสิ่งแวดล้อม อบต.เชื้อเพลิง', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80', true
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO issues (
  id, ticket_code, title, category, description, status, urgency,
  province, district, sub_district, village, location_detail, location_name,
  latitude, longitude, reporter_name, reporter_phone, reporter_email,
  image_url, after_image_url, assigned_department, assigned_officer, officer_notes,
  created_at, updated_at, timeline
)
VALUES
(
  'issue-001', 'CC-2026-001', 'ถนนแอสฟัลต์ชำรุดเป็นหลุมลึกใกล้หน้าโรงเรียนปราสาทวิทยาคาร',
  'road', 'ผิวจราจรทรุดตัวเป็นหลุมลึกประมาณ 15 ซม. กว้างเกือบ 1 เมตร เสี่ยงอุบัติเหตุ',
  'in_progress', 'urgent', 'สุรินทร์', 'อำเภอปราสาท', 'กังแอน', 'หมู่ 1 บ้านปะอาว',
  'ตรงข้ามประตู 2 โรงเรียนปราสาทวิทยาคาร', 'หน้าโรงเรียนปราสาทวิทยาคาร ต.กังแอน อ.ปราสาท',
  14.643300, 103.407200, 'คุณสมชาย ใจดี', '081-234-5678', 'somchai.citizen@example.com',
  'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
  NULL, 'กองช่าง เทศบาลตำบลกังแอน', 'นายช่างเกรียงไกร สิทธิโชค',
  'นำกรวยยางและป้ายสะท้อนแสงไปวางกั้นแล้ว ประสานรถบดเข้าซ่อมแซมช่วงบ่าย',
  '2026-09-02 08:30:00+00', '2026-09-03 10:15:00+00',
  '[{"id": "tl-101", "status": "pending", "title": "แจ้งปัญหาผ่านระบบออนไลน์", "timestamp": "2026-09-02T08:30:00.000Z", "actor": "คุณสมชาย ใจดี", "actorRole": "citizen"}]'::jsonb
)
ON CONFLICT (id) DO NOTHING;