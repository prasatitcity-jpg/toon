import React, { useState } from 'react';
import {
  ShieldCheck,
  Building2,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  ArrowLeft,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  Database,
  Shield,
  Briefcase,
} from 'lucide-react';
import { User } from '../types';
import { signIn, registerStaffApplication } from '../services/supabaseService';

interface AdminLoginViewProps {
  onLoginSuccess: (user: User, role: 'officer' | 'citizen', rememberMe?: boolean) => void;
  onBackToCitizen: () => void;
  isDbConnected: boolean;
}

export default function AdminLoginView({
  onLoginSuccess,
  onBackToCitizen,
  isDbConnected,
}: AdminLoginViewProps) {
  // Tabs: 'login' | 'register'
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Admin register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regDepartment, setRegDepartment] = useState('องค์การบริหารส่วนตำบลกังแอน');
  const [regPosition, setRegPosition] = useState('เจ้าหน้าที่งานป้องกันและบรรเทาสาธารณภัย');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);

  // Submit Admin Login
  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail.trim()) {
      setLoginError('กรุณากรอกอีเมลเจ้าหน้าที่หรือผู้ดูแลระบบ');
      return;
    }
    if (!loginPassword) {
      setLoginError('กรุณากรอกรหัสผ่าน');
      return;
    }

    setIsSubmitting(true);
    try {
      // Validate via authentication service
      const cleanEmail = loginEmail.trim().toLowerCase();
      const isSuperAdminEmail = cleanEmail === '28970@pwk.ac.th';
      const requestedPortal = isSuperAdminEmail ? 'super_admin' : 'staff';

      const session = await signIn(cleanEmail, loginPassword, requestedPortal, rememberMe);
      const user = session.user;

      // Ensure citizens cannot log in on the admin page
      if (user.role === 'citizen') {
        throw new Error(
          'บัญชีนี้เป็นบัญชีประชาชน ไม่สามารถเข้าสู่ระบบแอดมินได้ กรุณาเข้าสู่ระบบผ่านหน้าเว็บไซต์ประชาชน'
        );
      }

      // Check approval status for staff
      if (user.role === 'staff_pending' || user.status === 'pending') {
        throw new Error('สมัครบัญชีแอดมินเรียบร้อยแล้ว กรุณารอผู้ดูแลระบบอนุมัติ');
      }

      if (user.status === 'rejected') {
        throw new Error('คำขอสมัครแอดมินของคุณไม่ได้รับการอนุมัติ กรุณาติดต่อศูนย์ประสานงาน อ.ปราสาท');
      }

      if (user.status === 'suspended') {
        throw new Error('บัญชีนี้ถูกระงับการเข้าถึงชั่วคราว กรุณาติดต่อผู้ดูแลระบบ');
      }

      const roleType: 'officer' | 'citizen' = 'officer';
      onLoginSuccess(user, roleType, rememberMe);
    } catch (err: any) {
      setLoginError(err.message || 'การเข้าสู่ระบบแอดมินล้มเหลว กรุณาตรวจสอบข้อมูล');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Admin Registration (User Requirement 4)
  const handleAdminRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regName.trim()) {
      setRegError('กรุณากรอกชื่อ-นามสกุล');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setRegError('กรุณากรอกอีเมลหน่วยงานให้ถูกต้อง');
      return;
    }
    if (!regPhone.trim()) {
      setRegError('กรุณากรอกเบอร์โทรศัพท์ติดต่อ');
      return;
    }
    if (regPassword.length < 6) {
      setRegError('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    setIsSubmitting(true);
    try {
      await registerStaffApplication({
        name: regName.trim(),
        email: regEmail.trim(),
        phone: regPhone.trim(),
        department: regDepartment,
        position: regPosition,
        password: regPassword,
        inviteCode: 'PRASAT-ADMIN',
      });

      setRegSuccess(true);
    } catch (err: any) {
      setRegError(err.message || 'เกิดข้อผิดพลาดในการลงทะเบียนแอดมิน');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background Decor */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#f59e0b 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
        }}
      />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 text-white p-6 sm:p-8 border-b border-amber-500/30">
          <div className="flex items-center justify-between gap-3 mb-3">
            <button
              type="button"
              onClick={onBackToCitizen}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl border border-white/10 transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>กลับสู่หน้าประชาชน</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                <ShieldCheck size={11} />
                <span>Admin Portal</span>
              </span>
              <span
                className={`w-2 h-2 rounded-full ${
                  isDbConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
                title={isDbConnected ? 'ฐานข้อมูลออนไลน์' : 'โหมดแคช'}
              />
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <Building2 size={24} className="text-amber-400" />
              <span>ระบบบริหารจัดการแอดมิน อปท.</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              ศูนย์ประสานงาน อ.ปราสาท จ.สุรินทร์ • สิทธิ์เฉพาะเจ้าหน้าที่และผู้ดูแลระบบ
            </p>
          </div>
        </div>

        {/* Tab Switcher: [เข้าสู่ระบบแอดมิน] vs [สมัครบัญชีแอดมิน] */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-2 p-1.5 bg-slate-100 rounded-2xl gap-1">
            <button
              id="btn-admin-tab-login"
              type="button"
              onClick={() => {
                setActiveTab('login');
                setLoginError('');
                setRegError('');
              }}
              className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-white text-slate-900 shadow-sm ring-1 ring-black/5'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Lock size={15} className={activeTab === 'login' ? 'text-amber-700' : 'text-slate-400'} />
              <span>เข้าสู่ระบบแอดมิน</span>
            </button>

            <button
              id="btn-admin-tab-register"
              type="button"
              onClick={() => {
                setActiveTab('register');
                setLoginError('');
                setRegError('');
                setRegSuccess(false);
              }}
              className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-white text-slate-900 shadow-sm ring-1 ring-black/5'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Shield size={15} className={activeTab === 'register' ? 'text-amber-700' : 'text-slate-400'} />
              <span>สมัครบัญชีแอดมิน</span>
            </button>
          </div>

          {/* ========================================================================= */}
          {/* VIEW: ADMIN LOGIN FORM */}
          {/* ========================================================================= */}
          {activeTab === 'login' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {loginError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                  <AlertCircle size={16} className="shrink-0 text-rose-600 mt-0.5" />
                  <span className="font-semibold leading-relaxed">{loginError}</span>
                </div>
              )}

              <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    อีเมลแอดมิน / เจ้าหน้าที่
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="เช่น admin@prasat.go.th"
                      className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    รหัสผ่าน
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="กรอกรหัสผ่านของคุณ"
                      className="w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                    />
                    <span>จดจำการเข้าสู่ระบบ</span>
                  </label>

                  <span className="text-[11px] text-slate-400">
                    ตรวจสิทธิ์จากฐานข้อมูลจริง
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 hover:from-black hover:to-amber-900 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <ShieldCheck size={18} />
                  <span>{isSubmitting ? 'กำลังตรวจสอบสิทธิ์...' : 'เข้าสู่ระบบแอดมิน'}</span>
                </button>
              </form>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW: ADMIN REGISTRATION FORM */}
          {/* ========================================================================= */}
          {activeTab === 'register' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {regSuccess ? (
                /* Success Screen as mandated by User Requirement 4 */
                <div className="p-6 bg-amber-50/90 border border-amber-300 rounded-2xl text-center space-y-3 animate-in fade-in duration-200">
                  <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto shadow-2xs">
                    <CheckCircle2 size={28} />
                  </div>
                  <h3 className="text-base font-extrabold text-amber-950">
                    สมัครบัญชีแอดมินเรียบร้อยแล้ว กรุณารอผู้ดูแลระบบอนุมัติ
                  </h3>
                  <p className="text-xs text-amber-900 leading-relaxed max-w-md mx-auto">
                    ข้อมูลของคุณถูกบันทึกในระบบกลางแล้ว โดยมีสถานะเป็น <strong>pending</strong> เจ้าหน้าที่จะสามารถเข้าสู่ระบบและใช้งานหลังบ้านได้หลังจากที่ผู้ดูแลระบบหลัก (Super Admin) พิจารณาอนุมัติคำขอ
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setRegSuccess(false);
                        setActiveTab('login');
                      }}
                      className="py-2.5 px-6 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      กลับไปหน้าเข้าสู่ระบบแอดมิน
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleAdminRegisterSubmit} className="space-y-3.5">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
                    แบบฟอร์มเฉพาะสำหรับเจ้าหน้าที่ อปท. และแอดมินหน่วยงานในเขตอำเภอปราสาท เมื่อสมัครแล้ว บัญชีจะได้รับสถานะ <strong>role: staff, status: pending</strong> และรอ Super Admin อนุมัติ
                  </div>

                  {regError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                      <AlertCircle size={16} className="shrink-0 text-rose-600 mt-0.5" />
                      <span className="font-semibold leading-relaxed">{regError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        ชื่อ-นามสกุล <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="เช่น นายพงศกร สุขเจริญ"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-600"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        อีเมลเจ้าหน้าที่ <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="เช่น pongsakorn@prasat.go.th"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        เบอร์โทรศัพท์ <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="เช่น 081-234-5678"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-600"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        สังกัด / หน่วยงาน อปท. <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={regDepartment}
                        onChange={(e) => setRegDepartment(e.target.value)}
                        placeholder="เช่น อบต.กังแอน หรือ เทศบาลตำบลปราสาท"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      ตำแหน่งหน้าที่ <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={regPosition}
                      onChange={(e) => setRegPosition(e.target.value)}
                      placeholder="เช่น เจ้าหน้าที่งานป้องกันฯ, นายช่างโยธา, นักวิเคราะห์นโยบาย"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-600"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        รหัสผ่าน <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="password"
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="อย่างน้อย 6 ตัวอักษร"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-600"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        ยืนยันรหัสผ่าน <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="password"
                        required
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="กรอกรหัสผ่านอีกครั้ง"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-600"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      <Shield size={18} />
                      <span>{isSubmitting ? 'กำลังส่งคำขอสมัคร...' : 'สมัครบัญชีแอดมิน'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Bottom footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span>ระบบฐานข้อมูลกลาง อปท. อำเภอปราสาท</span>
          <button
            type="button"
            onClick={onBackToCitizen}
            className="font-semibold text-slate-700 hover:text-slate-900 transition-colors"
          >
            ← กลับสู่เว็บไซต์หลักประชาชน
          </button>
        </div>
      </div>
    </div>
  );
}
