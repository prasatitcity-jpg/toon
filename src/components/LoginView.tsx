import React, { useState } from 'react';
import {
  User as UserIcon,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Building,
  KeyRound,
  ArrowRight,
  HelpCircle,
  Check,
} from 'lucide-react';
import { User as UserType } from '../types';
import { INITIAL_USERS } from '../data/mockData';
import { PRASAT_SUB_DISTRICTS } from '../data/prasatLocations';
import { PrasatKhomArch, SurinElephantMotif, SilkPatternWatermark } from './SurinMotifs';

interface LoginViewProps {
  onLoginSuccess: (user: UserType, role: 'citizen' | 'officer', rememberMe: boolean) => void;
  onRegisterSuccess: (newUser: UserType, rememberMe: boolean) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  onRegisterSuccess,
}) => {
  const [activeRoleTab, setActiveRoleTab] = useState<'citizen' | 'officer'>('citizen');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Login Form States
  const [identifier, setIdentifier] = useState('somchai');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register Form States
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regSubDistrict, setRegSubDistrict] = useState('กังแอน');
  const [regVillage, setRegVillage] = useState('หมู่ 1 บ้านปะอาว');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regError, setRegError] = useState('');

  // Forgot Password States
  const [forgotInput, setForgotInput] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  // Villages for chosen subdistrict
  const currentSubDistrictData = PRASAT_SUB_DISTRICTS.find(
    (sd) => sd.name === regSubDistrict
  );
  const availableVillages = currentSubDistrictData ? currentSubDistrictData.villages : [];

  const handleSubDistrictChange = (subDistName: string) => {
    setRegSubDistrict(subDistName);
    const sd = PRASAT_SUB_DISTRICTS.find((s) => s.name === subDistName);
    if (sd && sd.villages.length > 0) {
      setRegVillage(`หมู่ ${sd.villages[0].moo} ${sd.villages[0].name}`);
    }
  };

  const handleRoleTabChange = (role: 'citizen' | 'officer') => {
    setActiveRoleTab(role);
    setLoginError('');
    if (role === 'citizen') {
      setIdentifier('somchai');
      setPassword('password123');
    } else {
      setIdentifier('kriangkrai');
      setPassword('password123');
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!identifier.trim() || !password) {
      setLoginError('กรุณากรอกชื่อผู้ใช้/อีเมล และรหัสผ่าน');
      return;
    }

    // Match against mock users or demo accounts
    const foundUser = INITIAL_USERS.find(
      (u) =>
        (u.username?.toLowerCase() === identifier.trim().toLowerCase() ||
          u.email.toLowerCase() === identifier.trim().toLowerCase() ||
          u.phone === identifier.trim()) &&
        (activeRoleTab === 'officer'
          ? u.role === 'officer' || u.role === 'admin'
          : u.role === 'citizen')
    );

    if (foundUser) {
      onLoginSuccess(foundUser, activeRoleTab, rememberMe);
    } else {
      // If user typed a custom credential
      const fallbackUser: UserType = {
        id: `usr-${Date.now()}`,
        name: identifier.includes('@') ? identifier.split('@')[0] : identifier,
        username: identifier,
        email: identifier.includes('@') ? identifier : `${identifier}@communitycare.th`,
        phone: '081-000-0000',
        role: activeRoleTab,
        department: activeRoleTab === 'officer' ? 'กองช่าง เทศบาลตำบลกังแอน' : undefined,
        subDistrict: 'กังแอน',
        village: 'หมู่ 1 บ้านปะอาว',
        avatar:
          activeRoleTab === 'officer'
            ? 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80'
            : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        isOnline: true,
      };
      onLoginSuccess(fallbackUser, activeRoleTab, rememberMe);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regName.trim() || !regPhone.trim() || !regPassword) {
      setRegError('กรุณากรอกชื่อ-นามสกุล, เบอร์โทรศัพท์ และรหัสผ่านให้ครบถ้วน');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegError('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    const newUser: UserType = {
      id: `usr-${Date.now()}`,
      name: regName.trim(),
      username: regUsername.trim() || regPhone.trim(),
      password: regPassword,
      phone: regPhone.trim(),
      email: regEmail.trim() || `${regPhone.trim()}@citizen.th`,
      role: 'citizen', // Public registration is strictly for citizen
      subDistrict: regSubDistrict,
      village: regVillage,
      address: `บ้านเลขที่... ${regVillage} ต.${regSubDistrict} อ.ปราสาท จ.สุรินทร์`,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      isOnline: true,
    };

    onRegisterSuccess(newUser, rememberMe);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-6 px-4">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Left Side: Surin Heritage Branding */}
        <div className="lg:col-span-5 bg-gradient-to-br from-emerald-900 via-teal-900 to-amber-950 text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <SilkPatternWatermark className="w-full h-full text-amber-300" />
          </div>
          <div className="absolute -right-12 -bottom-12 w-64 h-64 opacity-15 pointer-events-none">
            <SurinElephantMotif className="w-full h-full text-amber-200" />
          </div>

          {/* Top Brand */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-200 border border-amber-300/30 text-xs font-semibold mb-4">
              <PrasatKhomArch className="w-3.5 h-3.5 text-amber-300" />
              <span>ระบบดูแลชุมชนคนสุรินทร์</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-snug">
              Prasat Community Care
            </h1>
            <p className="text-emerald-200 text-sm mt-1 font-medium">
              “ชุมชนเล็ก ๆ ของสุรินทร์ที่ช่วยกันดูแลบ้านของเรา”
            </p>

            <p className="text-slate-200 text-xs leading-relaxed mt-4">
              แพลตฟอร์มรับแจ้งเรื่องร้องทุกข์ ติดตามสถานะการซ่อมแซม และประสานงานองค์กรปกครองส่วนท้องถิ่น
              ครอบคลุม 18 ตำบล 241 หมู่บ้าน ในอำเภอปราสาท จังหวัดสุรินทร์
            </p>
          </div>

          {/* Key System Highlights */}
          <div className="relative z-10 my-8 space-y-3">
            <div className="flex items-center gap-3 bg-black/25 p-3 rounded-2xl border border-white/10 backdrop-blur-xs">
              <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-white">แยกสิทธิ์การใช้งานชัดเจน</p>
                <p className="text-[11px] text-emerald-200">
                  ประชาชนแจ้ง-ติดตามส่วนตัว • เจ้าหน้าที่จัดการ 18 ตำบล
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-black/25 p-3 rounded-2xl border border-white/10 backdrop-blur-xs">
              <div className="w-8 h-8 rounded-xl bg-teal-400/20 text-teal-300 flex items-center justify-center shrink-0">
                <MapPin size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-white">ฐานข้อมูลเขตการปกครองจริง</p>
                <p className="text-[11px] text-emerald-200">
                  อ.ปราสาท จ.สุรินทร์ ละเอียดถึงระดับหมู่บ้านและจุดเกิดเหตุ
                </p>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between text-[11px] text-emerald-200/80">
            <span>ศูนย์บริการข้อมูล อ.ปราสาท</span>
            <span>สายด่วน 044-551-297</span>
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
          {/* Header Switcher: Login vs Register */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {isRegisterMode ? 'ลงทะเบียนสมาชิกใหม่ (ประชาชน)' : 'เข้าสู่ระบบใช้งาน'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isRegisterMode
                  ? 'กรอกข้อมูลส่วนตัวเพื่อแจ้งปัญหาและติดตามเรื่องในชุมชน'
                  : 'กรุณาเข้าสู่ระบบก่อนแจ้งปัญหา หรือติดตามข้อมูลส่วนตัว'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setLoginError('');
                setRegError('');
              }}
              className="text-xs font-bold text-teal-700 hover:text-teal-900 px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200/60"
            >
              {isRegisterMode ? 'มีบัญชีแล้ว? เข้าสู่ระบบ' : 'สมัครสมาชิกใหม่'}
            </button>
          </div>

          {/* ================= REGISTER FORM ================= */}
          {isRegisterMode ? (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {regError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    ชื่อ - นามสกุล <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <UserIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="เช่น สมชาย ใจดี"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    เบอร์โทรศัพท์ <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="08X-XXX-XXXX"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Geographic Cascading: Tambon & Village */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    ตำบลในอำเภอปราสาท (18 ตำบล) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={regSubDistrict}
                    onChange={(e) => handleSubDistrictChange(e.target.value)}
                    className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                  >
                    {PRASAT_SUB_DISTRICTS.map((sd) => (
                      <option key={sd.id} value={sd.name}>
                        ต.{sd.name} ({sd.villages.length} หมู่บ้าน)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    หมู่บ้าน <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={regVillage}
                    onChange={(e) => setRegVillage(e.target.value)}
                    className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                  >
                    {availableVillages.map((v) => {
                      const villageLabel = `หมู่ ${v.moo} ${v.name}`;
                      return (
                        <option key={v.moo} value={villageLabel}>
                          {villageLabel}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    ชื่อผู้ใช้ (Username)
                  </label>
                  <input
                    type="text"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="ใช้อีเมลหรือชื่อภาษาอังกฤษ"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    อีเมล (ถ้ามี)
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="example@domain.com"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    รหัสผ่าน <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="ตั้งรหัสผ่านอย่างน้อย 6 ตัวอักษร"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    ยืนยันรหัสผ่าน <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="กรอกรหัสผ่านอีกครั้ง"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-sm font-bold shadow-md transition-colors flex items-center justify-center gap-2 mt-2"
              >
                <span>สมัครสมาชิกชุมชนปราสาท</span>
                <ArrowRight size={16} />
              </button>
            </form>
          ) : (
            /* ================= LOGIN FORM ================= */
            <div>
              {/* Role Selector Tabs (Mandatory Role Separation) */}
              <div className="grid grid-cols-2 bg-slate-100 p-1.5 rounded-2xl mb-5 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => handleRoleTabChange('citizen')}
                  className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
                    activeRoleTab === 'citizen'
                      ? 'bg-white text-teal-800 shadow-xs ring-1 ring-black/5'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserIcon size={16} className={activeRoleTab === 'citizen' ? 'text-teal-600' : 'text-slate-400'} />
                  <span>ประชาชน (Citizen)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleTabChange('officer')}
                  className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
                    activeRoleTab === 'officer'
                      ? 'bg-white text-sky-800 shadow-xs ring-1 ring-black/5'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ShieldCheck size={16} className={activeRoleTab === 'officer' ? 'text-sky-600' : 'text-slate-400'} />
                  <span>เจ้าหน้าที่ (Officer)</span>
                </button>
              </div>

              {loginError && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Identifier */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    ชื่อผู้ใช้ / อีเมล / เบอร์โทรศัพท์
                  </label>
                  <div className="relative">
                    <UserIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder={
                        activeRoleTab === 'officer'
                          ? 'เช่น kriangkrai หรือ kriangkrai.officer@...'
                          : 'เช่น somchai หรือ 081-234-5678'
                      }
                      className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">รหัสผ่าน</label>
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-[11px] font-semibold text-teal-700 hover:text-teal-900 hover:underline"
                    >
                      ลืมรหัสผ่าน?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="กรอกรหัสผ่าน"
                      className="w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
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

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
                    />
                    <span>จำการเข้าสู่ระบบไว้ในอุปกรณ์นี้</span>
                  </label>

                  <span className="text-[11px] text-slate-400">
                    {activeRoleTab === 'officer' ? 'เข้าสู่แดชบอร์ดเจ้าหน้าที่' : 'เข้าสู่พอร์ทัลประชาชน'}
                  </span>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className={`w-full py-3 text-white rounded-xl text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 ${
                    activeRoleTab === 'officer'
                      ? 'bg-sky-700 hover:bg-sky-800'
                      : 'bg-teal-700 hover:bg-teal-800'
                  }`}
                >
                  <span>
                    เข้าสู่ระบบ ({activeRoleTab === 'officer' ? 'โหมดเจ้าหน้าที่' : 'โหมดประชาชน'})
                  </span>
                  <ArrowRight size={16} />
                </button>
              </form>

              {/* Quick Demo Accounts Selection */}
              <div className="mt-6 pt-5 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  บัญชีทดสอบระบบพร้อมใช้งาน (One-Click Demo):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveRoleTab('citizen');
                      setIdentifier('somchai');
                      setPassword('password123');
                    }}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      activeRoleTab === 'citizen' && identifier === 'somchai'
                        ? 'border-teal-500 bg-teal-50/60 ring-1 ring-teal-500'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-700 font-bold text-xs flex items-center justify-center">
                        ส
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">คุณสมชาย (ประชาชน)</p>
                        <p className="text-[10px] text-slate-500">ต.กังแอน อ.ปราสาท</p>
                      </div>
                    </div>
                    {activeRoleTab === 'citizen' && identifier === 'somchai' && (
                      <Check size={14} className="text-teal-600" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveRoleTab('officer');
                      setIdentifier('kriangkrai');
                      setPassword('password123');
                    }}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      activeRoleTab === 'officer' && identifier === 'kriangkrai'
                        ? 'border-sky-500 bg-sky-50/60 ring-1 ring-sky-500'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-sky-100 text-sky-700 font-bold text-xs flex items-center justify-center">
                        ช
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">นายช่างเกรียงไกร (จนท.)</p>
                        <p className="text-[10px] text-slate-500">กองช่าง เทศบาลกังแอน</p>
                      </div>
                    </div>
                    {activeRoleTab === 'officer' && identifier === 'kriangkrai' && (
                      <Check size={14} className="text-sky-600" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div
            className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <KeyRound size={18} />
                </div>
                <h3 className="text-base font-bold text-slate-900">รีเซ็ตรหัสผ่าน</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotSubmitted(false);
                }}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                ปิด
              </button>
            </div>

            {forgotSubmitted ? (
              <div className="space-y-4 text-center py-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                  <CheckCircle2 size={28} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">ส่งรหัสชั่วคราวเรียบร้อย</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    ระบบได้ส่งลิงก์รีเซ็ตรหัสผ่านไปยังเบอร์โทรศัพท์/อีเมล <b>{forgotInput}</b> เรียบร้อยแล้ว (รหัสทดสอบ: password123)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotSubmitted(false);
                  }}
                  className="w-full py-2.5 bg-teal-700 text-white rounded-xl text-xs font-bold"
                >
                  กลับไปหน้าเข้าสู่ระบบ
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-slate-600">
                  กรอกเบอร์โทรศัพท์หรืออีเมลที่ลงทะเบียนไว้ ระบบจะส่งรหัสผ่านชั่วคราวผ่าน SMS
                  หรืออีเมลของท่าน
                </p>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    เบอร์โทรศัพท์ หรือ อีเมล
                  </label>
                  <input
                    type="text"
                    value={forgotInput}
                    onChange={(e) => setForgotInput(e.target.value)}
                    placeholder="เช่น 081-234-5678"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (forgotInput.trim()) setForgotSubmitted(true);
                    }}
                    className="flex-1 py-2 bg-teal-700 text-white rounded-xl text-xs font-bold hover:bg-teal-800"
                  >
                    ส่งรหัสรีเซ็ต
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
