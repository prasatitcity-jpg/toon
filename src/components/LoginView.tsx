import React, { useState } from 'react';
import {
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  MapPin,
  Database,
  HelpCircle,
  Shield,
  Briefcase,
} from 'lucide-react';
import { User } from '../types';
import { PRASAT_SUB_DISTRICTS } from '../data/prasatLocations';
import {
  ElephantMascot,
  PrasatIcon,
  SurinSilkRibbon,
  SurinCommunityBadge,
} from './SurinMotifs';
import {
  registerCitizen,
  signIn,
} from '../services/supabaseService';

interface LoginViewProps {
  onLoginSuccess: (user: User, roleOrRemember?: any, rememberMe?: boolean) => void;
  onRegisterSuccess?: (user: User, rememberMe?: boolean) => void;
  onNavigateToAdmin?: () => void;
  isDbConnected?: boolean;
  users?: User[];
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  onRegisterSuccess,
  onNavigateToAdmin,
  isDbConnected = true,
}) => {
  // Mode: 'login' | 'register_citizen'
  const [activeMode, setActiveMode] = useState<'login' | 'register_citizen'>('login');

  // Login form state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Citizen Registration state (Strictly citizens only)
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regSubDistrict, setRegSubDistrict] = useState(PRASAT_SUB_DISTRICTS[0].name);
  const [regVillage, setRegVillage] = useState(
    `หมู่ ${PRASAT_SUB_DISTRICTS[0].villages[0].moo} ${PRASAT_SUB_DISTRICTS[0].villages[0].name}`
  );
  const [regError, setRegError] = useState('');

  // Available villages for selected sub-district
  const currentSubDistrictData = PRASAT_SUB_DISTRICTS.find(
    (sd) => sd.name === regSubDistrict
  );
  const availableVillages = currentSubDistrictData ? currentSubDistrictData.villages : [];

  const handleSubDistrictChange = (subDistrictName: string) => {
    setRegSubDistrict(subDistrictName);
    const target = PRASAT_SUB_DISTRICTS.find((sd) => sd.name === subDistrictName);
    if (target && target.villages.length > 0) {
      setRegVillage(`หมู่ ${target.villages[0].moo} ${target.villages[0].name}`);
    }
  };

  // Handle Citizen Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!identifier.trim()) {
      setLoginError('กรุณากรอกอีเมลหรือเบอร์โทรศัพท์');
      return;
    }

    if (!password) {
      setLoginError('กรุณากรอกรหัสผ่าน');
      return;
    }

    setIsSubmitting(true);
    try {
      // Citizen portal sign-in
      const session = await signIn(identifier.trim(), password, 'citizen', rememberMe);
      const user = session.user;

      // Ensure user logs in as citizen
      onLoginSuccess(user, 'citizen', rememberMe);
    } catch (err: any) {
      setLoginError(err.message || 'การเข้าสู่ระบบล้มเหลว กรุณาตรวจสอบข้อมูล');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Citizen Registration Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regName.trim()) {
      setRegError('กรุณาระบุชื่อ-นามสกุล');
      return;
    }
    if (!regPhone.trim()) {
      setRegError('กรุณาระบุเบอร์โทรศัพท์');
      return;
    }
    if (!regPassword) {
      setRegError('กรุณากำหนดรหัสผ่าน');
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
      const newUser = await registerCitizen({
        name: regName.trim(),
        email: regEmail.trim(),
        phone: regPhone.trim(),
        password: regPassword,
        subDistrict: regSubDistrict,
        village: regVillage,
      });

      if (onRegisterSuccess) {
        onRegisterSuccess(newUser, rememberMe);
      } else {
        onLoginSuccess(newUser, 'citizen', rememberMe);
      }
    } catch (err: any) {
      setRegError(err.message || 'เกิดข้อผิดพลาดในการลงทะเบียน');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Surin Identity Silk Background Pattern */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#10b981 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 border border-emerald-800/30 relative z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Left Side: Citizen Brand Banner */}
        <div className="lg:col-span-5 bg-gradient-to-br from-emerald-900 via-teal-950 to-slate-950 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-300/30 flex items-center justify-center text-amber-300 shadow-inner">
                <PrasatIcon className="w-8 h-8 text-amber-300" />
              </div>
              <div>
                <span className="text-[11px] font-bold tracking-widest text-amber-300 uppercase block">
                  Surin Province
                </span>
                <span className="text-sm font-extrabold text-white tracking-wide">
                  PRASAT CARE
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                ระบบดูแลชุมชน<br />อำเภอปราสาท
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
                ศูนย์รับแจ้งเรื่องร้องทุกข์ ปัญหาโครงสร้างพื้นฐาน ไฟฟ้า ประปา และสาธารณภัย ครอบคลุม 18 ตำบล ในอำเภอปราสาท จังหวัดสุรินทร์
              </p>
            </div>

            <div className="pt-2">
              <SurinSilkRibbon />
            </div>

            {/* Sub-districts badge */}
            <div className="p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-600/30 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                <MapPin size={15} />
                <span>ครอบคลุม 18 ตำบล 241 หมู่บ้าน</span>
              </div>
              <p className="text-[11px] text-emerald-200/80 leading-relaxed">
                เทศบาลตำบลกังแอน • ต.ตานี • ต.พลับพลา • ต.เชื้อเพลิง • ต.ปราสาททนง • ต.บ้านพลวง • ต.ตาเบา • ต.สมุด และทุกตำบล
              </p>
            </div>
          </div>

          <div className="relative z-10 pt-6 mt-6 border-t border-emerald-800/60 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-emerald-200">
              <span>ศูนย์ประสานงาน อ.ปราสาท</span>
              <span>สายด่วน 044-551-297</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-amber-200 bg-emerald-950/60 px-3 py-2 rounded-xl border border-emerald-600/40">
              <Database size={14} className="text-amber-300 shrink-0" />
              <span className="font-semibold text-[11px]">
                {isDbConnected
                  ? 'ระบบฐานข้อมูลกลาง อ.ปราสาท: ออนไลน์พร้อมใช้งาน'
                  : 'โหมดเชื่อมต่อสำรอง'}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-auto"></span>
            </div>
          </div>
        </div>

        {/* Right Side: Citizen Auth Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
          
          {/* Top Switcher: Strictly [เข้าสู่ระบบประชาชน] and [สมัครสมาชิกประชาชน] (User Requirement 1) */}
          <div className="mb-6">
            <div className="grid grid-cols-2 bg-slate-100 p-1.5 rounded-2xl gap-1">
              <button
                id="btn-tab-citizen-login"
                type="button"
                onClick={() => {
                  setActiveMode('login');
                  setLoginError('');
                  setRegError('');
                }}
                className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 font-bold text-xs sm:text-sm cursor-pointer ${
                  activeMode === 'login'
                    ? 'bg-white text-emerald-900 shadow-xs ring-1 ring-black/5'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <UserIcon size={16} className={activeMode === 'login' ? 'text-emerald-700' : 'text-slate-400'} />
                <span>เข้าสู่ระบบประชาชน</span>
              </button>

              <button
                id="btn-tab-citizen-register"
                type="button"
                onClick={() => {
                  setActiveMode('register_citizen');
                  setLoginError('');
                  setRegError('');
                }}
                className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 font-bold text-xs sm:text-sm cursor-pointer ${
                  activeMode === 'register_citizen'
                    ? 'bg-white text-emerald-900 shadow-xs ring-1 ring-black/5'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <UserIcon size={16} className={activeMode === 'register_citizen' ? 'text-emerald-700' : 'text-slate-400'} />
                <span>สมัครสมาชิกประชาชน</span>
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* VIEW: CITIZEN REGISTRATION FORM */}
          {/* ========================================================================= */}
          {activeMode === 'register_citizen' ? (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                    สมัครสมาชิกสำหรับประชาชน
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    ลงทะเบียนประชาชนในเขต อ.ปราสาท เพื่อส่งเรื่องร้องเรียนและติดตามผล
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActiveMode('login');
                    setRegError('');
                  }}
                  className="text-xs font-bold text-emerald-800 hover:text-emerald-950 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 transition-colors"
                >
                  เข้าสู่ระบบ
                </button>
              </div>

              {regError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-3">
                {/* Full Name */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    ชื่อ - นามสกุล <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <UserIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="citizen-reg-name"
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="เช่น นายสมศักดิ์ สุรินทร์สุข"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>

                {/* Phone & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      เบอร์โทรศัพท์ <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        id="citizen-reg-phone"
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="081-xxx-xxxx"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      อีเมล (ถ้ามี)
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        id="citizen-reg-email"
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="somsak@email.com"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Sub-district & Village Dropdowns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      ตำบล (ในอำเภอปราสาท) <span className="text-rose-500">*</span>
                    </label>
                    <select
                      id="citizen-reg-subdistrict"
                      value={regSubDistrict}
                      onChange={(e) => handleSubDistrictChange(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    >
                      {PRASAT_SUB_DISTRICTS.map((sd) => (
                        <option key={sd.name} value={sd.name}>
                          ต.{sd.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      หมู่บ้าน <span className="text-rose-500">*</span>
                    </label>
                    <select
                      id="citizen-reg-village"
                      value={regVillage}
                      onChange={(e) => setRegVillage(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    >
                      {availableVillages.map((v) => (
                        <option key={v.moo} value={`หมู่ ${v.moo} ${v.name}`}>
                          หมู่ {v.moo} {v.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      รหัสผ่าน <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="citizen-reg-password"
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="อย่างน้อย 6 ตัวอักษร"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      ยืนยันรหัสผ่าน <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="citizen-reg-confirm-password"
                      type="password"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="กรอกรหัสผ่านอีกครั้ง"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    id="btn-submit-citizen-register"
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-sm font-bold shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    <span>{isSubmitting ? 'กำลังบันทึกข้อมูล...' : 'ลงทะเบียนประชาชน'}</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* ========================================================================= */
            /* VIEW: CITIZEN LOGIN FORM */
            /* ========================================================================= */
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                    เข้าสู่ระบบสำหรับประชาชน
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    เข้าสู่ระบบเพื่อแจ้งปัญหา ติดตามความคืบหน้า และดูประวัติ
                  </p>
                </div>

                <button
                  id="btn-switch-to-citizen-register"
                  type="button"
                  onClick={() => {
                    setActiveMode('register_citizen');
                    setRegError('');
                  }}
                  className="text-xs font-bold text-emerald-800 hover:text-emerald-950 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 transition-colors cursor-pointer"
                >
                  สมัครสมาชิกประชาชน
                </button>
              </div>

              {loginError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    อีเมล หรือ เบอร์โทรศัพท์
                  </label>
                  <div className="relative">
                    <UserIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="login-identifier"
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="เช่น somsak@email.com หรือ 081-xxx-xxxx"
                      className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
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
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="กรอกรหัสผ่านของคุณ"
                      className="w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
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
                      className="rounded border-slate-300 text-emerald-700 focus:ring-emerald-500"
                    />
                    <span>จดจำการเข้าสู่ระบบ</span>
                  </label>
                </div>

                <button
                  id="btn-submit-citizen-login"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <span>{isSubmitting ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบประชาชน'}</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            </div>
          )}

          {/* Discreet Footer link for Admin Portal (User Requirement 9: Clean citizen UI, admin accessed via separate URL route) */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>ศูนย์บริการประชาชน อ.ปราสาท</span>
            {onNavigateToAdmin && (
              <button
                type="button"
                onClick={onNavigateToAdmin}
                className="text-slate-400 hover:text-slate-600 hover:underline transition-colors"
              >
                ระบบเจ้าหน้าที่
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default LoginView;
