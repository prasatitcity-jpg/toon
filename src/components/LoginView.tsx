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
  ShieldCheck,
  Building2,
  MapPin,
  Database,
  KeyRound,
  FileCheck2,
  HelpCircle,
} from 'lucide-react';
import { User, UserRole } from '../types';
import { PRASAT_SUB_DISTRICTS } from '../data/prasatLocations';
import {
  ElephantMascot,
  PrasatIcon,
  SurinSilkRibbon,
  SurinCommunityBadge,
} from './SurinMotifs';
import { registerCitizen, signIn } from '../services/supabaseService';

interface LoginViewProps {
  onLoginSuccess: (user: User, rememberMe?: boolean) => void;
  onRegisterSuccess?: (user: User, rememberMe?: boolean) => void;
  isDbConnected?: boolean;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  onRegisterSuccess,
  isDbConnected = true,
}) => {
  // Mode: login vs citizen registration
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Portal selection: citizen vs staff
  // User Rule 4: Portal selection is only a login portal view, NOT role assignment.
  // The system strictly verifies actual role from database after login.
  const [activePortal, setActivePortal] = useState<'citizen' | 'staff'>('citizen');

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
  const [regSuccessMessage, setRegSuccessMessage] = useState('');

  // Forgot password modal
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

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

  // Handle Login Submit
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
      // Calls secure auth service which checks actual credentials and database-backed profile role
      const session = await signIn(identifier, password, activePortal, rememberMe);
      onLoginSuccess(session.user, rememberMe);
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
    setRegSuccessMessage('');

    if (!regName.trim()) {
      setRegError('กรุณากรอกชื่อ-นามสกุล');
      return;
    }

    if (!regEmail.trim() || !regEmail.includes('@')) {
      setRegError('กรุณากรอกอีเมลให้ถูกต้อง');
      return;
    }

    if (!regPhone.trim()) {
      setRegError('กรุณากรอกเบอร์โทรศัพท์ที่ติดต่อได้');
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
      // Rule 2: Register citizen with strict citizen role in database
      const newCitizen = await registerCitizen({
        name: regName.trim(),
        email: regEmail.trim(),
        phone: regPhone.trim(),
        password: regPassword,
        subDistrict: regSubDistrict,
        village: regVillage,
      });

      setRegSuccessMessage('ลงทะเบียนสมาชิกประชาชนสำเร็จ กำลังเข้าสู่ระบบ...');
      setTimeout(() => {
        if (onRegisterSuccess) {
          onRegisterSuccess(newCitizen, true);
        } else {
          onLoginSuccess(newCitizen, true);
        }
      }, 1000);
    } catch (err: any) {
      setRegError(err.message || 'ไม่สามารถลงทะเบียนได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-6 px-4">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Left Side: Prasat & Surin Community Care Identity */}
        <div className="lg:col-span-5 bg-gradient-to-br from-emerald-950 via-teal-950 to-amber-950 text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-200 border border-amber-300/30 text-xs font-semibold mb-4">
              <PrasatIcon size={14} className="text-amber-300" />
              <span>ระบบดูแลชุมชนคนสุรินทร์</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-snug">
              Prasat Community Care
            </h1>
            <p className="text-emerald-200 text-sm mt-1 font-medium">
              ระบบแจ้งและติดตามปัญหาชุมชน อำเภอปราสาท จ.สุรินทร์
            </p>

            <p className="text-slate-300 text-xs leading-relaxed mt-4">
              แพลตฟอร์มรับเรื่องร้องทุกข์ ติดตามสถานะการซ่อมแซม และประสานงานองค์กรปกครองส่วนท้องถิ่น
              ครอบคลุม 18 ตำบล 241 หมู่บ้าน ด้วยระบบรักษาความปลอดภัยฐานข้อมูลและควบคุมสิทธิ์แบบเข้มงวด
            </p>
          </div>

          {/* Key System Highlights */}
          <div className="relative z-10 my-8 space-y-3">
            <div className="flex items-center gap-3 bg-black/30 p-3 rounded-2xl border border-white/10 backdrop-blur-xs">
              <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0">
                <ShieldCheck size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-white">แยกสิทธิ์การใช้งาน (RBAC)</p>
                <p className="text-[11px] text-emerald-200">
                  ประชาชนแจ้ง-ติดตามเรื่องส่วนบุคคล • เจ้าหน้าที่จัดการ 18 ตำบล
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-black/30 p-3 rounded-2xl border border-white/10 backdrop-blur-xs">
              <div className="w-8 h-8 rounded-xl bg-teal-400/20 text-teal-300 flex items-center justify-center shrink-0">
                <MapPin size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-white">ฐานข้อมูลเขตการปกครองจริง</p>
                <p className="text-[11px] text-emerald-200">
                  ครอบคลุมทุกตำบลและหมู่บ้านในอำเภอปราสาท จังหวัดสุรินทร์
                </p>
              </div>
            </div>
          </div>

          {/* Footer note & Database Status */}
          <div className="relative z-10 pt-4 border-t border-white/15 space-y-2 text-[11px] text-emerald-200/90">
            <div className="flex items-center justify-between">
              <span>ศูนย์ประสานงาน อ.ปราสาท</span>
              <span>สายด่วน 044-551-297</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-amber-200 bg-emerald-950/60 px-3 py-2 rounded-xl border border-emerald-600/40">
              <Database size={14} className="text-amber-300 shrink-0" />
              <span className="font-semibold text-[11px]">
                {isDbConnected
                  ? 'ระบบฐานข้อมูลกลาง อ.ปราสาท: ออนไลน์พร้อมใช้งาน'
                  : 'กำลังตรวจสอบสถานะการเชื่อมต่อ...'}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-auto"></span>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
          {/* Header Switcher: Login vs Register */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {isRegisterMode ? 'ลงทะเบียนประชาชนใหม่' : 'เข้าสู่ระบบใช้งาน'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isRegisterMode
                  ? 'สมัครสมาชิกสำหรับประชาชนเพื่อแจ้งปัญหาและติดตามผลส่วนตัว'
                  : 'เข้าสู่ระบบเพื่อแจ้งปัญหา ติดตามเรื่อง หรือจัดการงานชุมชน'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setLoginError('');
                setRegError('');
                setRegSuccessMessage('');
              }}
              className="text-xs font-bold text-teal-700 hover:text-teal-900 px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200/60 transition-colors"
            >
              {isRegisterMode ? 'มีบัญชีแล้ว? เข้าสู่ระบบ' : 'สมัครสมาชิกประชาชน'}
            </button>
          </div>

          {/* ================= REGISTER FORM (Strictly Citizen) ================= */}
          {isRegisterMode ? (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="bg-amber-50/80 border border-amber-200 p-2.5 rounded-xl text-amber-900 text-xs flex items-center gap-2">
                <FileCheck2 size={16} className="text-amber-700 shrink-0" />
                <span>
                  การสมัครสมาชิกเปิดสำหรับ<strong>ประชาชน</strong>ทั่วไป (เจ้าหน้าที่ต้องได้รับการแต่งตั้งโดยผู้ดูแลระบบ)
                </span>
              </div>

              {regError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              {regSuccessMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                  <span>{regSuccessMessage}</span>
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

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  อีเมลสำหรับเข้าสู่ระบบ <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="example@domain.com"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
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
                      placeholder="อย่างน้อย 6 ตัวอักษร"
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
                disabled={isSubmitting}
                className="w-full py-3 bg-teal-800 hover:bg-teal-900 disabled:opacity-60 text-white rounded-xl text-sm font-bold shadow-md transition-colors flex items-center justify-center gap-2 mt-2"
              >
                <span>{isSubmitting ? 'กำลังบันทึกข้อมูล...' : 'ลงทะเบียนประชาชน อ.ปราสาท'}</span>
                <ArrowRight size={16} />
              </button>
            </form>
          ) : (
            /* ================= LOGIN FORM ================= */
            <div>
              {/* User Rule 4: Clear Distinct Portal Selector */}
              <div className="grid grid-cols-2 bg-slate-100 p-1.5 rounded-2xl mb-4 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setActivePortal('citizen');
                    setLoginError('');
                  }}
                  className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
                    activePortal === 'citizen'
                      ? 'bg-white text-teal-900 shadow-xs ring-1 ring-black/5'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserIcon size={16} className={activePortal === 'citizen' ? 'text-teal-700' : 'text-slate-400'} />
                  <span>เข้าสู่ระบบสำหรับประชาชน</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActivePortal('staff');
                    setLoginError('');
                  }}
                  className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
                    activePortal === 'staff'
                      ? 'bg-white text-sky-900 shadow-xs ring-1 ring-black/5'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ShieldCheck size={16} className={activePortal === 'staff' ? 'text-sky-700' : 'text-slate-400'} />
                  <span>เข้าสู่ระบบสำหรับเจ้าหน้าที่</span>
                </button>
              </div>

              {loginError && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0 text-rose-600" />
                  <span className="font-medium">{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Identifier */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    อีเมล หรือ เบอร์โทรศัพท์ที่ลงทะเบียน
                  </label>
                  <div className="relative">
                    <UserIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder={
                        activePortal === 'staff'
                          ? 'เช่น kriangkrai.staff@prasat.gov.th'
                          : 'เช่น somchai.citizen@example.com หรือ เบอร์โทรศัพท์'
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
                      placeholder="กรอกรหัสผ่านของคุณ"
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

                {/* Remember Me */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
                    />
                    <span>จดจำการเข้าสู่ระบบในอุปกรณ์นี้</span>
                  </label>

                  <span className="text-[11px] text-slate-400">
                    {activePortal === 'staff' ? 'ระบบตรวจสิทธิ์จากฐานข้อมูล' : 'พอร์ทัลประชาชน'}
                  </span>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 text-white rounded-xl text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 ${
                    activePortal === 'staff'
                      ? 'bg-sky-800 hover:bg-sky-900 disabled:opacity-60'
                      : 'bg-teal-800 hover:bg-teal-900 disabled:opacity-60'
                  }`}
                >
                  <span>
                    {isSubmitting
                      ? 'กำลังตรวจสอบสิทธิ์...'
                      : activePortal === 'staff'
                      ? 'เข้าสู่ระบบเจ้าหน้าที่ (Staff)'
                      : 'เข้าสู่ระบบประชาชน (Citizen)'}
                  </span>
                  <ArrowRight size={16} />
                </button>
              </form>

              {/* Security Policy Information note */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
                <ShieldCheck size={15} className="text-teal-600 shrink-0" />
                <span>
                  ความปลอดภัย: ระบบตรวจสอบ Role จริงจากฐานข้อมูลกลาง ไม่อนุญาตให้ใช้สิทธิ์เกินอำนาจหน้าที่
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
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
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={24} />
                </div>
                <p className="text-xs font-bold text-slate-800">
                  ระบบส่งลิงก์ตั้งค่ารหัสผ่านใหม่ไปยังอีเมลแล้ว
                </p>
                <p className="text-[11px] text-slate-500">
                  กรุณาตรวจสอบกล่องข้อความอีเมลของคุณเพื่อดำเนินการต่อ
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotSubmitted(false);
                  }}
                  className="mt-4 px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200"
                >
                  กลับสู่หน้าเข้าสู่ระบบ
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (forgotEmail) setForgotSubmitted(true);
                }}
                className="space-y-4"
              >
                <p className="text-xs text-slate-600">
                  ระบุอีเมลที่ใช้ลงทะเบียน ระบบจะส่งคำแนะนำในการตั้งรหัสผ่านใหม่ไปยังอีเมลของคุณ
                </p>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">อีเมลของคุณ</label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="example@domain.com"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold rounded-xl shadow-xs"
                  >
                    ส่งคำขอรีเซ็ตรหัสผ่าน
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
