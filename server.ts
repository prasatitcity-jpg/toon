import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Persistent profiles file path on server
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PROFILES_FILE = path.join(DATA_DIR, 'db_profiles.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial seed profiles (Pre-seeds default root super admin: 28970@pwk.ac.th with active status)
const DEFAULT_SEED_PROFILES = [
  {
    id: 'usr-super-admin-28970',
    name: 'ผู้ดูแลระบบหลัก อ.ปราสาท',
    email: '28970@pwk.ac.th',
    phone: '044-531-123',
    role: 'super_admin',
    department: 'ศูนย์ประสานงานกลางและเทคโนโลยีสารสนเทศ อ.ปราสาท',
    position: 'Super Administrator',
    subDistrict: 'กังแอน',
    village: 'หมู่ 1 บ้านปะอาว',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    isOnline: true,
    status: 'active',
    lastSeen: new Date().toISOString(),
    createdAt: '2026-08-01T08:00:00.000Z',
    approvedAt: '2026-08-01T08:00:00.000Z',
    approvedBy: 'system_root',
    notes: 'บัญชีผู้ดูแลระบบหลักของศูนย์บริการร่วม อ.ปราสาท (Super Administrator)',
  },
  {
    id: 'usr-staff-1',
    name: 'นายช่างเกรียงไกร สิทธิโชค',
    email: 'kriangkrai.staff@prasat.gov.th',
    phone: '089-876-5432',
    role: 'staff',
    department: 'กองช่าง เทศบาลตำบลกังแอน',
    position: 'หัวหน้าฝ่ายช่างโยธา',
    subDistrict: 'กังแอน',
    village: 'หมู่ 1 บ้านปะอาว',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    isOnline: true,
    status: 'active',
    lastSeen: new Date().toISOString(),
    createdAt: '2026-08-10T11:00:00.000Z',
    notes: 'หัวหน้าทีมช่างโยธา ซ่อมถนนและไฟสาธารณะ อ.ปราสาท',
  },
  {
    id: 'usr-staff-2',
    name: 'นางสาวกานดา รักชุมชน',
    email: 'kanda.staff@prasat.gov.th',
    phone: '086-555-1234',
    role: 'staff',
    department: 'กองสาธารณสุขและสิ่งแวดล้อม อบต.เชื้อเพลิง',
    position: 'นักวิชาการสาธารณสุขปฏิบัติการ',
    subDistrict: 'เชื้อเพลิง',
    village: 'หมู่ 3 บ้านโคกเพชร',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    isOnline: true,
    status: 'active',
    lastSeen: new Date().toISOString(),
    createdAt: '2026-08-12T14:20:00.000Z',
    notes: 'ดูแลการจัดการขยะ สิ่งแวดล้อม และสุขาภิบาลชุมชน',
  },
  {
    id: 'usr-pending-1',
    name: 'นายสมเกียรติ มั่นคง',
    email: 'somkiat.pending@prasat.gov.th',
    phone: '087-999-8877',
    role: 'staff_pending',
    department: 'กองช่าง อบต.บ้านพลวง',
    position: 'นายช่างไฟฟ้าปฏิบัติงาน',
    inviteCode: 'PRASAT-PLUANG-2026',
    subDistrict: 'บ้านพลวง',
    village: 'หมู่ 2 บ้านพลวง',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    status: 'pending',
    lastSeen: new Date().toISOString(),
    createdAt: '2026-09-01T09:15:00.000Z',
    notes: 'คำขอสมัครเจ้าหน้าที่ใหม่ รอการตรวจสอบและอนุมัติจาก Super Admin',
  },
  {
    id: 'usr-citizen-1',
    name: 'คุณสมชาย ใจดี',
    email: 'somchai.citizen@example.com',
    phone: '081-234-5678',
    role: 'citizen',
    subDistrict: 'กังแอน',
    village: 'หมู่ 1 บ้านปะอาว',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    lastSeen: new Date().toISOString(),
    createdAt: '2026-08-15T09:30:00.000Z',
    notes: 'ประชาชนผู้แจ้งเบาะแสประจำ ต.กังแอน',
  },
];

let testingModeNoSuperAdmin = false;

function loadProfiles(): any[] {
  let list: any[] = [];
  try {
    if (fs.existsSync(DB_PROFILES_FILE)) {
      const data = fs.readFileSync(DB_PROFILES_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) list = parsed;
    }
  } catch (e) {
    console.error('Failed to read db_profiles.json:', e);
  }
  if (list.length === 0) {
    list = [...DEFAULT_SEED_PROFILES];
  }

  if (testingModeNoSuperAdmin) {
    return list.filter((p) => p.role !== 'super_admin');
  }

  // Ensure root admin 28970@pwk.ac.th always has role = 'super_admin' and status = 'active'
  const rootIndex = list.findIndex(
    (p) => p.email && p.email.toLowerCase() === '28970@pwk.ac.th'
  );
  if (rootIndex >= 0) {
    list[rootIndex].role = 'super_admin';
    list[rootIndex].status = 'active';
  } else {
    list.unshift({
      id: 'usr-super-admin-28970',
      name: 'ผู้ดูแลระบบหลัก อ.ปราสาท',
      email: '28970@pwk.ac.th',
      phone: '044-531-123',
      role: 'super_admin',
      department: 'ศูนย์ประสานงานกลางและเทคโนโลยีสารสนเทศ อ.ปราสาท',
      position: 'Super Administrator',
      subDistrict: 'กังแอน',
      village: 'หมู่ 1 บ้านปะอาว',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isOnline: true,
      status: 'active',
      lastSeen: new Date().toISOString(),
      createdAt: '2026-08-01T08:00:00.000Z',
      approvedAt: '2026-08-01T08:00:00.000Z',
      approvedBy: 'system_root',
      notes: 'บัญชีผู้ดูแลระบบหลักของศูนย์บริการร่วม อ.ปราสาท (Super Administrator)',
    });
  }

  return list;
}

function saveProfiles(profiles: any[]): void {
  try {
    fs.writeFileSync(DB_PROFILES_FILE, JSON.stringify(profiles, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to write db_profiles.json:', e);
  }
}

// Ensure initial seed is saved if file doesn't exist
if (!fs.existsSync(DB_PROFILES_FILE)) {
  saveProfiles(DEFAULT_SEED_PROFILES);
}

// ====================================================================
// API ROUTES
// ====================================================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// GET /api/admin/setup-status
// Checks if Super Admin is already established in database
app.get('/api/admin/setup-status', (req, res) => {
  const profiles = loadProfiles();
  const hasActiveSuperAdmin = profiles.some(
    (p) => (p.role === 'super_admin' || p.role === 'admin') && p.status === 'active'
  );

  res.json({
    canSetup: !hasActiveSuperAdmin,
    hasSuperAdmin: hasActiveSuperAdmin,
    message: hasActiveSuperAdmin
      ? 'ระบบมีผู้ดูแลระบบหลักแล้ว กรุณาเข้าสู่ระบบหรือสมัครเป็นเจ้าหน้าที่'
      : 'ระบบพร้อมสำหรับการสร้างบัญชีผู้ดูแลระบบหลักคนแรก',
  });
});

// POST /api/admin/create-first-super-admin
// Creates the very first super admin. Prevents duplicate super admin registration.
app.post('/api/admin/create-first-super-admin', (req, res) => {
  const { name, email, phone, department, position } = req.body || {};

  if (!name || !email) {
    return res.status(400).json({
      success: false,
      message: 'กรุณากรอกข้อมูลชื่อ-นามสกุล และอีเมลให้ครบถ้วน',
    });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const profiles = loadProfiles();

  // Rule 5: Check if another active super_admin already exists in database
  const existingSuperAdmin = profiles.find(
    (p) => (p.role === 'super_admin' || p.role === 'admin') && p.status === 'active' && p.email?.toLowerCase() !== cleanEmail
  );

  if (existingSuperAdmin) {
    return res.status(403).json({
      success: false,
      hasSuperAdmin: true,
      message: 'ระบบมีผู้ดูแลระบบหลักแล้ว กรุณาเข้าสู่ระบบหรือสมัครเป็นเจ้าหน้าที่',
    });
  }

  // Create or promote super admin
  const now = new Date().toISOString();
  let target = profiles.find((p) => p.email && p.email.toLowerCase() === cleanEmail);

  if (!target) {
    target = {
      id: `usr-super-admin-${Date.now()}`,
      name: String(name).trim(),
      email: cleanEmail,
      phone: String(phone || '').trim() || '044-531-123',
      role: 'super_admin',
      status: 'active',
      department: String(department || '').trim() || 'ศูนย์ประสานงานกลางและเทคโนโลยีสารสนเทศ อ.ปราสาท',
      position: String(position || '').trim() || 'Super Administrator',
      subDistrict: 'กังแอน',
      village: 'หมู่ 1 บ้านปะอาว',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      createdAt: now,
      approvedAt: now,
      approvedBy: 'first_bootstrap',
      notes: 'ผู้ดูแลระบบหลักคนแรกของระบบ (First Super Administrator)',
    };
    profiles.unshift(target);
  } else {
    target.name = String(name).trim() || target.name;
    target.role = 'super_admin';
    target.status = 'active';
    target.approvedAt = now;
    target.approvedBy = 'first_bootstrap';
    target.department = String(department || '').trim() || target.department;
    target.position = String(position || '').trim() || target.position;
  }

  testingModeNoSuperAdmin = false;
  saveProfiles(profiles);

  res.json({
    success: true,
    message: 'สร้างบัญชีผู้ดูแลระบบหลักคนแรกสำเร็จแล้ว สามารถเข้าสู่ระบบได้ทันที',
    user: target,
  });
});

// POST /api/admin/reset-bootstrap-for-testing
// Allows resetting super admin so user can test the complete test scenario (Steps A to E)
app.post('/api/admin/reset-bootstrap-for-testing', (req, res) => {
  testingModeNoSuperAdmin = true;
  const nonAdminProfiles = DEFAULT_SEED_PROFILES.filter((p) => p.role !== 'super_admin');
  saveProfiles(nonAdminProfiles);
  res.json({ success: true, message: 'รีเซ็ตสถานะระบบเป็นเริ่มต้นสำเร็จ (ยังไม่มี Super Admin พร้อมทดสอบสร้างคนแรก)' });
});

// POST /api/admin/restore-root-admin
// Restores default root super admin: 28970@pwk.ac.th
app.post('/api/admin/restore-root-admin', (req, res) => {
  testingModeNoSuperAdmin = false;
  saveProfiles(DEFAULT_SEED_PROFILES);
  res.json({ success: true, message: 'คืนค่าบัญชีผู้ดูแลระบบหลัก 28970@pwk.ac.th สำเร็จแล้ว' });
});

// POST /api/admin/initial-setup
// Promotes registered user to super_admin using server-side secret
app.post('/api/admin/initial-setup', (req, res) => {
  const { email, secret, userProfile } = req.body || {};

  if (!email || !secret) {
    return res.status(400).json({
      success: false,
      message: 'กรุณาระบุอีเมลของบัญชีที่สมัครไว้ และ Initial Setup Secret ให้ครบถ้วน',
    });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const cleanSecret = String(secret).trim();

  // 1. Verify Secret against Server Environment Variable
  const configuredSecret = process.env.INITIAL_ADMIN_SETUP_SECRET?.trim() || 'PRASAT_ADMIN_SECRET_2026';
  if (cleanSecret !== configuredSecret) {
    return res.status(401).json({
      success: false,
      message: 'Initial Setup Secret ไม่ถูกต้อง กรุณาตรวจสอบรหัสผ่านลับจากเซิร์ฟเวอร์',
    });
  }

  // 2. Verify Email against INITIAL_ADMIN_EMAIL if configured
  const configuredAdminEmail = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
  if (configuredAdminEmail && cleanEmail !== configuredAdminEmail) {
    return res.status(403).json({
      success: false,
      message: `อีเมลที่ระบุไม่ตรงกับ INITIAL_ADMIN_EMAIL ที่กำหนดไว้ในระบบ (${configuredAdminEmail})`,
    });
  }

  // 3. Check if an active Super Admin already exists
  const profiles = loadProfiles();
  const hasActiveSuperAdmin = profiles.some(
    (p) => (p.role === 'super_admin' || p.role === 'admin') && p.status === 'active'
  );

  if (hasActiveSuperAdmin) {
    return res.status(403).json({
      success: false,
      message: 'ระบบมี Super Admin แล้ว การตั้งค่าเริ่มต้นถูกปิดใช้งานถาวรเพื่อความปลอดภัย',
    });
  }

  // 4. Find user profile or create/sync from client
  let targetUser = profiles.find((p) => p.email && p.email.toLowerCase() === cleanEmail);

  if (!targetUser && userProfile && userProfile.email && userProfile.email.toLowerCase() === cleanEmail) {
    targetUser = { ...userProfile };
    profiles.unshift(targetUser);
  }

  if (!targetUser) {
    return res.status(404).json({
      success: false,
      message: 'ไม่พบบัญชีนี้ในระบบ กรุณาสมัครสมาชิกผ่านหน้า "สมัครสมาชิก" ก่อนดำเนินการตั้งค่า Super Admin',
    });
  }

  // 5. Promote account to super_admin
  const now = new Date().toISOString();
  targetUser.role = 'super_admin';
  targetUser.status = 'active';
  targetUser.approved_at = now;
  targetUser.approved_by = 'system_initial_setup';
  targetUser.approvedAt = now;
  targetUser.approvedBy = 'system_initial_setup';
  targetUser.department = targetUser.department || 'ผู้ดูแลระบบสูงสุด (Super Admin)';
  targetUser.position = targetUser.position || 'Super Administrator';
  targetUser.notes = 'ผู้ดูแลระบบสูงสุดจากการตั้งค่าเริ่มต้น (Initial Admin Setup)';

  saveProfiles(profiles);

  res.json({
    success: true,
    message: 'แต่งตั้งผู้ดูแลระบบสูงสุด (Super Admin) สำเร็จแล้ว สามารถเข้าสู่ระบบได้ทันที',
    user: targetUser,
  });
});

// GET /api/admin/profiles - get all profiles for sync
app.get('/api/admin/profiles', (req, res) => {
  const profiles = loadProfiles();
  res.json({ profiles });
});

// POST /api/admin/sync-profiles - sync profiles
app.post('/api/admin/sync-profiles', (req, res) => {
  const { profiles } = req.body || {};
  if (Array.isArray(profiles)) {
    saveProfiles(profiles);
    res.json({ success: true, count: profiles.length });
  } else {
    res.status(400).json({ success: false, message: 'Invalid profiles format' });
  }
});

// POST /api/admin/approve-staff
app.post('/api/admin/approve-staff', (req, res) => {
  const { applicantId, adminName } = req.body || {};
  if (!applicantId) {
    return res.status(400).json({ success: false, message: 'applicantId is required' });
  }

  const profiles = loadProfiles();
  const target = profiles.find((p) => p.id === applicantId);
  if (!target) {
    return res.status(404).json({ success: false, message: 'Applicant not found' });
  }

  const now = new Date().toISOString();
  target.role = 'staff';
  target.status = 'active';
  target.approved_at = now;
  target.approved_by = adminName || 'Super Admin';
  target.approvedAt = now;
  target.approvedBy = adminName || 'Super Admin';
  target.notes = `ได้รับการอนุมัติเป็นเจ้าหน้าที่ โดย ${adminName || 'Super Admin'} เมื่อ ${new Date().toLocaleString('th-TH')}`;

  saveProfiles(profiles);
  res.json({ success: true, message: 'อนุมัติเจ้าหน้าที่สำเร็จ', user: target });
});

// POST /api/admin/reject-staff
app.post('/api/admin/reject-staff', (req, res) => {
  const { applicantId, reason, adminName } = req.body || {};
  if (!applicantId) {
    return res.status(400).json({ success: false, message: 'applicantId is required' });
  }

  const profiles = loadProfiles();
  const target = profiles.find((p) => p.id === applicantId);
  if (!target) {
    return res.status(404).json({ success: false, message: 'Applicant not found' });
  }

  const now = new Date().toISOString();
  target.role = 'staff_pending';
  target.status = 'rejected';
  target.approved_at = now;
  target.approved_by = adminName || 'Super Admin';
  target.approvedAt = now;
  target.approvedBy = adminName || 'Super Admin';
  target.notes = reason || 'คำขอไม่ผ่านเกณฑ์การตรวจสอบ';

  saveProfiles(profiles);
  res.json({ success: true, message: 'ปฏิเสธคำขอเรียบร้อยแล้ว', user: target });
});

// POST /api/admin/reset-bootstrap-for-testing
// Allows resetting super admin so users can test the 5-step bootstrap process anytime
app.post('/api/admin/reset-bootstrap-for-testing', (req, res) => {
  saveProfiles(DEFAULT_SEED_PROFILES);
  res.json({ success: true, message: 'รีเซ็ตสถานะระบบเป็นเริ่มต้นสำเร็จ (ไม่มี Super Admin)' });
});

// ====================================================================
// VITE MIDDLEWARE / PRODUCTION STATIC SERVING
// ====================================================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
