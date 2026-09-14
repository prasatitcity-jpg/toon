-- ====================================================================
-- Prasat Community Care (ระบบแจ้งและติดตามปัญหาชุมชน อำเภอปราสาท)
-- PostgreSQL & Supabase Database Schema with Seed Data
-- ====================================================================
-- สามารถนำไฟล์ SQL นี้ไปรันใน Supabase SQL Editor หรือ PostgreSQL ได้ทันที
-- ====================================================================

-- 1. เปิดการใช้งาน UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ฟังก์ชันอัปเดต timestamp อัตโนมัติ (Trigger Function)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ====================================================================
-- 3. ตารางผู้ใช้งาน (users)
-- ====================================================================
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

-- Trigger สำหรับ users
DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ====================================================================
-- 4. ตารางเรื่องร้องเรียน/ปัญหาชุมชน (issues)
-- ====================================================================
CREATE TABLE IF NOT EXISTS issues (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    ticket_code TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'road',
        'street_light',
        'garbage',
        'water_supply',
        'tree_blocking',
        'road_obstacle',
        'noise',
        'other'
    )),
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending',
        'acknowledged',
        'in_progress',
        'resolved',
        'closed'
    )),
    urgency TEXT NOT NULL DEFAULT 'medium' CHECK (urgency IN (
        'low',
        'medium',
        'high',
        'urgent'
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

-- Trigger สำหรับ issues
DROP TRIGGER IF EXISTS trg_issues_updated_at ON issues;
CREATE TRIGGER trg_issues_updated_at
    BEFORE UPDATE ON issues
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Indexes สำหรับเร่งความเร็วการค้นหาและฟิลเตอร์
CREATE INDEX IF NOT EXISTS idx_issues_ticket_code ON issues(ticket_code);
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
CREATE INDEX IF NOT EXISTS idx_issues_category ON issues(category);
CREATE INDEX IF NOT EXISTS idx_issues_sub_district ON issues(sub_district);
CREATE INDEX IF NOT EXISTS idx_issues_reporter_phone ON issues(reporter_phone);
CREATE INDEX IF NOT EXISTS idx_issues_created_at ON issues(created_at DESC);

-- ====================================================================
-- 5. ตารางการแจ้งเตือน (notifications)
-- ====================================================================
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
CREATE INDEX IF NOT EXISTS idx_notifications_updated_at ON notifications(updated_at DESC);

-- ====================================================================
-- 6. นโยบายความปลอดภัย Supabase Row Level Security (RLS)
-- ====================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- อนุญาตให้อ่านและเขียนข้อมูลสำหรับ Anonymous และ Authenticated ในช่วงพัฒนา/ใช้งานระบบ
CREATE POLICY "Allow public read users" ON users FOR SELECT USING (true);
CREATE POLICY "Allow public insert users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update users" ON users FOR UPDATE USING (true);

CREATE POLICY "Allow public read issues" ON issues FOR SELECT USING (true);
CREATE POLICY "Allow public insert issues" ON issues FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update issues" ON issues FOR UPDATE USING (true);

CREATE POLICY "Allow public read notifications" ON notifications FOR SELECT USING (true);
CREATE POLICY "Allow public insert notifications" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update notifications" ON notifications FOR UPDATE USING (true);

-- ====================================================================
-- 7. เปิดระบบ Realtime สำหรับ Supabase (ถ้ามี publication อยู่แล้ว)
-- ====================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE issues;
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
    ALTER PUBLICATION supabase_realtime ADD TABLE users;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ====================================================================
-- 8. ข้อมูลตัวอย่างเริ่มต้น (Seed Data)
-- ====================================================================

-- ข้อมูลผู้ใช้งานเริ่มต้น
INSERT INTO users (id, name, username, password, email, phone, role, sub_district, village, address, department, avatar, is_online)
VALUES
(
  'usr-1',
  'คุณสมชาย ใจดี',
  'somchai',
  'password123',
  'somchai.citizen@example.com',
  '081-234-5678',
  'citizen',
  'กังแอน',
  'หมู่ 1 บ้านปะอาว',
  'บ้านเลขที่ 45 หมู่ 1 ต.กังแอน อ.ปราสาท จ.สุรินทร์',
  NULL,
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  true
),
(
  'usr-2',
  'นายช่างเกรียงไกร สิทธิโชค',
  'kriangkrai',
  'password123',
  'kriangkrai.officer@communitycare.gov.th',
  '089-876-5432',
  'officer',
  'กังแอน',
  NULL,
  NULL,
  'กองช่าง เทศบาลตำบลกังแอน',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  true
),
(
  'usr-3',
  'นางสาวกานดา รักชุมชน',
  'kanda',
  'password123',
  'kanda.admin@communitycare.gov.th',
  '086-555-1234',
  'officer',
  'เชื้อเพลิง',
  NULL,
  NULL,
  'กองสาธารณสุขและสิ่งแวดล้อม อบต.เชื้อเพลิง',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  true
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  username = EXCLUDED.username,
  role = EXCLUDED.role;

-- ข้อมูลปัญหาชุมชนเริ่มต้น (Issues Seed)
INSERT INTO issues (
  id, ticket_code, title, category, description, status, urgency,
  province, district, sub_district, village, location_detail, location_name,
  latitude, longitude, reporter_name, reporter_phone, reporter_email,
  image_url, after_image_url, assigned_department, assigned_officer, officer_notes,
  created_at, updated_at, timeline
)
VALUES
(
  'issue-001',
  'CC-2026-001',
  'ถนนแอสฟัลต์ชำรุดเป็นหลุมลึกใกล้หน้าโรงเรียนปราสาทวิทยาคาร',
  'road',
  'ผิวจราจรทรุดตัวเป็นหลุมลึกประมาณ 15 ซม. กว้างเกือบ 1 เมตร รถจักรยานยนต์นักเรียนและรถรับส่งต้องหักหลบ เสี่ยงต่อการเกิดอุบัติเหตุอย่างมาก โดยเฉพาะช่วงค่ำและเวลาฝนตก',
  'in_progress',
  'urgent',
  'สุรินทร์',
  'อำเภอปราสาท',
  'กังแอน',
  'หมู่ 1 บ้านปะอาว',
  'ตรงข้ามประตู 2 โรงเรียนปราสาทวิทยาคาร ถนนโชคชัย-เดชอุดม',
  'หน้าโรงเรียนปราสาทวิทยาคาร ต.กังแอน อ.ปราสาท',
  14.643300,
  103.407200,
  'คุณสมชาย ใจดี',
  '081-234-5678',
  'somchai.citizen@example.com',
  'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
  NULL,
  'กองช่าง เทศบาลตำบลกังแอน',
  'นายช่างเกรียงไกร สิทธิโชค',
  'นำกรวยยางและป้ายสะท้อนแสงไปวางกั้นจุดอันตรายแล้ว ประสานรถบดแอสฟัลต์พร้อมยางมะตอยผสมเสร็จเข้าซ่อมแซมช่วงบ่ายวันนี้',
  '2026-09-02 08:30:00+00',
  '2026-09-03 10:15:00+00',
  '[
    {"id": "tl-101", "status": "pending", "title": "แจ้งปัญหาผ่านระบบออนไลน์", "note": "ประชาชนส่งเรื่องพร้อมรูปภาพและพิกัดแผนที่ ชุมชนตำบลกังแอน", "timestamp": "2026-09-02T08:30:00.000Z", "actor": "คุณสมชาย ใจดี", "actorRole": "citizen"},
    {"id": "tl-102", "status": "acknowledged", "title": "เจ้าหน้าที่รับเรื่องและตรวจสอบพิกัด", "note": "ส่งต่อเรื่องไปยังกองช่าง เทศบาลตำบลกังแอน เลขที่รับเรื่อง ยธ-6904", "timestamp": "2026-09-02T10:45:00.000Z", "actor": "เจ้าหน้าที่ศูนย์รับเรื่อง", "actorRole": "system"},
    {"id": "tl-103", "status": "in_progress", "title": "จัดส่งทีมช่างลงพื้นที่ตรวจสอบและเตรียมซ่อม", "note": "นำกรวยสะท้อนแสงติดตั้ง และนัดหมายเครื่องจักรเข้าบดอัดยางมะตอย", "timestamp": "2026-09-03T10:15:00.000Z", "actor": "นายช่างเกรียงไกร สิทธิโชค", "actorRole": "officer"}
  ]'::jsonb
),
(
  'issue-002',
  'CC-2026-002',
  'โคมไฟส่องสว่างโซลาร์เซลล์ดับมืด ทางเข้าปราสาทบ้านพลวง',
  'street_light',
  'หลอดไฟส่องทางดับติดต่อกัน 3 ต้น ทางเดินมืดสนิทในเวลากลางคืน ผู้สูงอายุและชาวบ้านสัญจรไปมาลำบาก เกรงว่าจะเกิดอันตรายต่อความปลอดภัย',
  'resolved',
  'high',
  'สุรินทร์',
  'อำเภอปราสาท',
  'บ้านพลวง',
  'หมู่ 1 บ้านพลวง',
  'ทางแยกเข้าโบราณสถานปราสาทบ้านพลวง ใกล้ศาลาประชาคม',
  'ซอยทางเข้าปราสาทบ้านพลวง ต.บ้านพลวง อ.ปราสาท',
  14.621500,
  103.419200,
  'คุณวารุณี เจริญสุข',
  '084-321-9988',
  'warunee.c@example.com',
  'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop&q=80',
  'งานไฟฟ้าและแสงสว่าง อบต.บ้านพลวง',
  'นายสมพร ช่างไฟ',
  'เปลี่ยนชุดแบตเตอรี่และแผงวงจรหลอด LED ประหยัดไฟตัวใหม่ทั้ง 3 ต้น ตรวจวัดระบบสวิตช์แสงเรียบร้อย สว่างปกติแล้ว',
  '2026-08-30 19:20:00+00',
  '2026-09-01 14:40:00+00',
  '[
    {"id": "tl-201", "status": "pending", "title": "แจ้งปัญหาไฟฟ้าส่องสว่าง", "timestamp": "2026-08-30T19:20:00.000Z", "actor": "คุณวารุณี เจริญสุข", "actorRole": "citizen"},
    {"id": "tl-202", "status": "acknowledged", "title": "รับเรื่องและมอบหมายหน่วยงาน", "timestamp": "2026-08-31T09:00:00.000Z", "actor": "ศูนย์บริการประชาชน อบต.บ้านพลวง", "actorRole": "system"},
    {"id": "tl-203", "status": "in_progress", "title": "รถกระเช้าไฟฟ้าเข้าตรวจสอบพื้นที่", "timestamp": "2026-09-01T11:00:00.000Z", "actor": "นายสมพร ช่างไฟ", "actorRole": "officer"},
    {"id": "tl-204", "status": "resolved", "title": "ซ่อมแซมและเปลี่ยนหลอดไฟเสร็จสิ้น", "note": "เปลี่ยนเป็นหลอด LED สว่างชัดเจน พร้อมทดสอบเปิดใช้งาน", "timestamp": "2026-09-01T14:40:00.000Z", "actor": "นายสมพร ช่างไฟ", "actorRole": "officer"}
  ]'::jsonb
),
(
  'issue-003',
  'CC-2026-003',
  'ขยะตกค้างและถังขยะล้น ใกล้จุดรอรถสองแถวบ้านเชื้อเพลิง',
  'garbage',
  'ขยะล้นถังขยะชุมชนมากว่า 3 วันแล้ว สุนัขจรจัดมารื้อคุ้ยเกลื่อนกลาด ส่งกลิ่นเหม็นรบกวนชาวบ้านและผู้สัญจรผ่านไปมา ขอความอนุเคราะห์รถเก็บขยะเข้าจัดเก็บด่วนครับ',
  'pending',
  'medium',
  'สุรินทร์',
  'อำเภอปราสาท',
  'เชื้อเพลิง',
  'หมู่ 1 บ้านเชื้อเพลิง',
  'ศาลาที่พักผู้โดยสารริมทางหลวง 214 ปากทางเข้าวัดบ้านเชื้อเพลิง',
  'ริมทางหลวง 214 บ้านเชื้อเพลิง ต.เชื้อเพลิง อ.ปราสาท',
  14.712500,
  103.298200,
  'คุณประดิษฐ์ รักษ์ถิ่น',
  '082-111-2233',
  NULL,
  'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&auto=format&fit=crop&q=80',
  NULL,
  'กองสาธารณสุขและสิ่งแวดล้อม อบต.เชื้อเพลิง',
  NULL,
  NULL,
  '2026-09-04 02:15:00+00',
  '2026-09-04 02:15:00+00',
  '[
    {"id": "tl-301", "status": "pending", "title": "แจ้งขยะตกค้างเข้าระบบ", "note": "ระบบส่งแจ้งเตือนไปยังกองสาธารณสุข อบต.เชื้อเพลิง เรียบร้อย", "timestamp": "2026-09-04T02:15:00.000Z", "actor": "คุณประดิษฐ์ รักษ์ถิ่น", "actorRole": "citizen"}
  ]'::jsonb
),
(
  'issue-004',
  'CC-2026-004',
  'ท่อเมนประปาหมู่บ้านแตก น้ำไหลเจิ่งนองท่วมลานวัดบ้านทมอ',
  'water_supply',
  'ท่อประปาส่วนต่อขยายรั่วซึม ดันน้ำพุ่งขึ้นมาบนพื้นดิน น้ำไหลทิ้งปริมาณมากและแรงดันน้ำประปาในหมู่บ้านลดลง ชาวบ้านไม่มีน้ำใช้หุงต้ม',
  'in_progress',
  'urgent',
  'สุรินทร์',
  'อำเภอปราสาท',
  'ทมอ',
  'หมู่ 3 บ้านทมอ (เหนือ)',
  'ตรงข้ามศาลาการเปรียญวัดบ้านทมอเหนือ',
  'ลานหน้าวัดบ้านทมอ ต.ทมอ อ.ปราสาท',
  14.731500,
  103.415500,
  'แม่ค้าอนงค์ ชาวทมอ',
  '085-987-6543',
  NULL,
  'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?w=800&auto=format&fit=crop&q=80',
  NULL,
  'กองการประปา อบต.ทมอ',
  'ช่างวิรัช ประปา',
  'ปิดวาล์วท่อน้ำย่อยเพื่อชะลอน้ำไหลทิ้งแล้ว กำลังขุดเปิดหน้าดินเพื่อตัดต่อข้อต่อท่อ PE ขนาด 3 นิ้วใหม่',
  '2026-09-03 14:10:00+00',
  '2026-09-04 01:20:00+00',
  '[
    {"id": "tl-401", "status": "pending", "title": "รับแจ้งท่อประปาแตกฉุกเฉิน", "timestamp": "2026-09-03T14:10:00.000Z", "actor": "แม่ค้าอนงค์ ชาวทมอ", "actorRole": "citizen"},
    {"id": "tl-402", "status": "acknowledged", "title": "เจ้าหน้าที่รับเรื่องด่วน", "timestamp": "2026-09-03T14:25:00.000Z", "actor": "ศูนย์บริการน้ำประปา อบต.ทมอ", "actorRole": "system"},
    {"id": "tl-403", "status": "in_progress", "title": "เข้าปิดวาล์วและเริ่มขุดซ่อมแซม", "timestamp": "2026-09-03T15:30:00.000Z", "actor": "ช่างวิรัช ประปา", "actorRole": "officer"}
  ]'::jsonb
),
(
  'issue-005',
  'CC-2026-005',
  'กิ่งต้นจามจุรีขนาดใหญ่พาดสายไฟแรงต่ำ เสี่ยงหักโค่นหน้าฝน',
  'tree_blocking',
  'กิ่งไม้ใหญ่ริมคันคลองส่งน้ำยื่นลงมาพาดสายไฟฟ้าแรงต่ำ ลมกระโชกแรงแล้วแกว่งเสียดสีสายไฟ อาจทำให้สายไฟขาดหรือเกิดไฟลัดวงจร ขอตัดแต่งเพื่อความปลอดภัย',
  'acknowledged',
  'high',
  'สุรินทร์',
  'อำเภอปราสาท',
  'โคกยาง',
  'หมู่ 1 บ้านโคกยาง',
  'คันคลองชลประทานด้านหลังโรงพยาบาลส่งเสริมสุขภาพตำบลโคกยาง',
  'ใกล้ รพ.สต.โคกยาง ต.โคกยาง อ.ปราสาท',
  14.568400,
  103.334500,
  'คุณกิตติศักดิ์ พลอยดี',
  '089-333-4455',
  NULL,
  'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=800&auto=format&fit=crop&q=80',
  NULL,
  'งานป้องกันและบรรเทาสาธารณภัย อบต.โคกยาง',
  'หัวหน้าทีม ปภ.โคกยาง',
  'ประสานการไฟฟ้าส่วนภูมิภาคสาขาปราสาท เพื่อร่วมตัดกระแสไฟชั่วคราวและนำรถเครนกระเช้าเข้าตัดแต่งกิ่งไม้ในวันพรุ่งนี้',
  '2026-09-03 18:00:00+00',
  '2026-09-04 00:30:00+00',
  '[
    {"id": "tl-501", "status": "pending", "title": "แจ้งกิ่งไม้พาดสายไฟ", "timestamp": "2026-09-03T18:00:00.000Z", "actor": "คุณกิตติศักดิ์ พลอยดี", "actorRole": "citizen"},
    {"id": "tl-502", "status": "acknowledged", "title": "งาน ปภ. อบต.โคกยาง รับเรื่องและนัดหมายการไฟฟ้า", "timestamp": "2026-09-04T00:30:00.000Z", "actor": "หัวหน้าทีม ปภ.โคกยาง", "actorRole": "officer"}
  ]'::jsonb
),
(
  'issue-006',
  'CC-2026-006',
  'กองหินคลุกและเศษดินถมทางปิดขวางทางน้ำไหลข้างแปลงนา',
  'road_obstacle',
  'มีการเทกองหินคลุกและดินถมล้ำเข้ามาในแนวทางสัญจรร่วมและขวางทางระบายน้ำลงสู่คลองธรรมชาติ รถไถและรถจักรยานยนต์ของเกษตรกรสัญจรลำบาก',
  'resolved',
  'medium',
  'สุรินทร์',
  'อำเภอปราสาท',
  'ไพล',
  'หมู่ 1 บ้านไพล',
  'ทางหลวงชนบท สร.3012 ใกล้โบราณสถานปราสาทบ้านไพล',
  'ทางแยกปราสาทบ้านไพล ต.ไพล อ.ปราสาท',
  14.698500,
  103.351400,
  'คุณสมชาย ใจดี',
  '081-234-5678',
  NULL,
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&auto=format&fit=crop&q=80',
  'กองช่าง อบต.ไพล',
  'นายช่างวัชระ',
  'ประสานเจ้าของที่ดินนำรถตักมาเกลี่ยกองดินและเปิดทางน้ำระบายเรียบร้อย พร้อมปรับระดับผิวทางให้สัญจรได้ปลอดภัยตามปกติ',
  '2026-08-25 11:00:00+00',
  '2026-08-26 16:00:00+00',
  '[
    {"id": "tl-601", "status": "pending", "title": "แจ้งสิ่งกีดขวางทางสัญจร", "timestamp": "2026-08-25T11:00:00.000Z", "actor": "คุณสมชาย ใจดี", "actorRole": "citizen"},
    {"id": "tl-602", "status": "acknowledged", "title": "ส่งต่อกองช่าง อบต.ไพล", "timestamp": "2026-08-25T13:00:00.000Z", "actor": "ศูนย์รับเรื่องราวร้องทุกข์ อบต.ไพล", "actorRole": "system"},
    {"id": "tl-603", "status": "in_progress", "title": "ช่างลงพื้นที่ตรวจสอบร่วมกับผู้นำชุมชน", "timestamp": "2026-08-26T10:00:00.000Z", "actor": "นายช่างวัชระ", "actorRole": "officer"},
    {"id": "tl-604", "status": "resolved", "title": "เกลี่ยกองดินเปิดทางน้ำเรียบร้อย", "timestamp": "2026-08-26 16:00:00.000Z", "actor": "นายช่างวัชระ", "actorRole": "officer"},
    {"id": "tl-605", "status": "closed", "title": "ปิดคำร้องเรียน", "timestamp": "2026-08-27T09:00:00.000Z", "actor": "ระบบอัตโนมัติ", "actorRole": "system"}
  ]'::jsonb
),
(
  'issue-007',
  'CC-2026-007',
  'น้ำท่วมขังผิวจราจรสูง 20 ซม. และทางระบายน้ำอุดตัน ปากทางเข้าบ้านตานี',
  'water_supply',
  'ฝนตกหนักแล้วน้ำระบายไม่ทัน เอ่อล้นท่วมผิวถนนเป็นระยะทางกว่า 50 เมตร รถเล็กสัญจรลำบากมาก น้ำเริ่มไหลเข้าบ้านเรือนริมถนน',
  'pending',
  'high',
  'สุรินทร์',
  'อำเภอปราสาท',
  'ตานี',
  'หมู่ 1 บ้านตานี',
  'ถนนสายเชื่อมระหว่างตำบลตานี-ปราสาท ใกล้สะพานข้ามห้วย',
  'ทางเข้าหมู่บ้านตานี ต.ตานี อ.ปราสาท',
  14.618000,
  103.312000,
  'คุณนภาวรรณ สินทรัพย์',
  '087-444-9900',
  NULL,
  'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=800&auto=format&fit=crop&q=80',
  NULL,
  'กองช่างและงาน ปภ. อบต.ตานี',
  NULL,
  NULL,
  '2026-09-04 00:45:00+00',
  '2026-09-04 00:45:00+00',
  '[
    {"id": "tl-701", "status": "pending", "title": "รับแจ้งเหตุน้ำท่วมขังผิวถนน", "timestamp": "2026-09-04T00:45:00.000Z", "actor": "คุณนภาวรรณ สินทรัพย์", "actorRole": "citizen"}
  ]'::jsonb
),
(
  'issue-008',
  'CC-2026-008',
  'ฝาท่อระบายน้ำคอนกรีตแตกหัก มีช่องลึกเสี่ยงคนเดินตกหน้าตลาดปราสาท',
  'road',
  'ฝาตะแกรงเหล็กท่อระบายน้ำผุกร่อนจนหักเป็นโพรงกว้าง คนเดินตลาดสดโดยเฉพาะช่วงเช้ามืดอาจก้าวตกลงไป ขาหักหรือได้รับบาดเจ็บรุนแรง',
  'closed',
  'urgent',
  'สุรินทร์',
  'อำเภอปราสาท',
  'กังแอน',
  'หมู่ 2 บ้านบุเจก',
  'หน้าตลาดสดเทศบาลตำบลกังแอน ถ.สุรินทร์-ช่องจอม',
  'หน้าตลาดสดเทศบาล ต.กังแอน อ.ปราสาท',
  14.645000,
  103.406500,
  'คุณธีรพงษ์ แก้ววิไล',
  '083-777-6655',
  NULL,
  'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1584467735815-f778f274e296?w=800&auto=format&fit=crop&q=80',
  'กองช่าง เทศบาลตำบลกังแอน',
  'นายช่างเกรียงไกร สิทธิโชค',
  'เปลี่ยนฝาเหล็กหล่อเหนียวอย่างหนารุ่นรับน้ำหนักพิเศษ และเชื่อมตัวยึดกันขโมยเรียบร้อย ปลอดภัย 100%',
  '2026-08-20 09:10:00+00',
  '2026-08-22 17:30:00+00',
  '[
    {"id": "tl-801", "status": "pending", "title": "แจ้งฝาท่อชำรุดอันตราย", "timestamp": "2026-08-20T09:10:00.000Z", "actor": "คุณธีรพงษ์ แก้ววิไล", "actorRole": "citizen"},
    {"id": "tl-802", "status": "acknowledged", "title": "รับเรื่องเร่งด่วนระดับฉุกเฉิน", "timestamp": "2026-08-20T09:30:00.000Z", "actor": "นายช่างเกรียงไกร สิทธิโชค", "actorRole": "officer"},
    {"id": "tl-803", "status": "in_progress", "title": "วางแผ่นเหล็กหนาปิดชั่วคราวและสั่งหล่อฝาใหม่", "timestamp": "2026-08-20T11:00:00.000Z", "actor": "ทีมช่างโยธา เทศบาลตำบลกังแอน", "actorRole": "officer"},
    {"id": "tl-804", "status": "resolved", "title": "ติดตั้งฝาครอบท่อระบายน้ำใหม่เสร็จสมบูรณ์", "timestamp": "2026-08-22T14:00:00.000Z", "actor": "นายช่างเกรียงไกร สิทธิโชค", "actorRole": "officer"},
    {"id": "tl-805", "status": "closed", "title": "ตรวจรับงานและปิดเรื่องเรียบร้อย", "timestamp": "2026-08-22T17:30:00.000Z", "actor": "หัวหน้างานโยธา", "actorRole": "system"}
  ]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  ticket_code = EXCLUDED.ticket_code,
  title = EXCLUDED.title,
  status = EXCLUDED.status,
  updated_at = EXCLUDED.updated_at;

-- ข้อมูลการแจ้งเตือนเริ่มต้น (Notifications Seed)
INSERT INTO notifications (
  id, ticket_id, ticket_code, issue_title, old_status, new_status,
  updated_at, officer_name, officer_notes, sub_district, is_read,
  reporter_name, reporter_phone
)
VALUES
(
  'notif-1',
  'issue-001',
  'CC-2026-001',
  'ถนนแอสฟัลต์ชำรุดเป็นหลุมลึกใกล้หน้าโรงเรียนปราสาทวิทยาคาร',
  'acknowledged',
  'in_progress',
  '2026-09-03 10:15:00+00',
  'นายช่างเกรียงไกร สิทธิโชค',
  'นำกรวยยางและป้ายสะท้อนแสงไปวางกั้นจุดอันตรายแล้ว ประสานรถบดแอสฟัลต์เข้าซ่อมแซมบ่ายวันนี้',
  'กังแอน',
  false,
  'คุณสมชาย ใจดี',
  '081-234-5678'
),
(
  'notif-2',
  'issue-002',
  'CC-2026-002',
  'โคมไฟส่องสว่างโซลาร์เซลล์ดับมืด ทางเข้าปราสาทบ้านพลวง',
  'in_progress',
  'resolved',
  '2026-09-01 14:40:00+00',
  'นายสมพร ช่างไฟ',
  'เปลี่ยนชุดแบตเตอรี่และแผงวงจรหลอด LED ประหยัดไฟตัวใหม่ทั้ง 3 ต้น สว่างปกติแล้ว',
  'บ้านพลวง',
  true,
  'คุณวารุณี เจริญสุข',
  '084-321-9988'
)
ON CONFLICT (id) DO NOTHING;
