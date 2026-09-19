import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  KeyRound,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Layers,
  ChevronRight,
  Home,
  LogOut,
  Info,
  Building2,
} from 'lucide-react';
import { User } from '../types';
import { ElephantMascot, PrasatIcon, SurinSilkRibbon } from './SurinMotifs';
import {
  checkSuperAdminSetupStatus,
  performInitialAdminSetup,
  getLocalDatabaseProfiles,
} from '../services/supabaseService';

interface InitialAdminSetupViewProps {
  onSetupSuccess: (user: User) => void;
  onGoBackToLogin: () => void;
  isDbConnected?: boolean;
}

export const InitialAdminSetupView: React.FC<InitialAdminSetupViewProps> = ({
  onSetupSuccess,
  onGoBackToLogin,
  isDbConnected = true,
}) => {
  const [email, setEmail] = useState('');
  const [secret, setSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [canSetup, setCanSetup] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successResult, setSuccessResult] = useState<User | null>(null);

  // Check setup availability on mount
  useEffect(() => {
    let isMounted = true;

    async function verifyStatus() {
      try {
        setIsCheckingStatus(true);
        const res = await checkSuperAdminSetupStatus();
        if (isMounted) {
          setCanSetup(res.canSetup);
          if (!res.canSetup) {
            setStatusMessage(res.message || 'ระบบมี Super Admin แล้ว การตั้งค่าเริ่มต้นถูกปิดใช้งาน');
          }
        }
      } catch (err: any) {
        console.warn('Check setup status error:', err);
      } finally {
        if (isMounted) setIsCheckingStatus(false);
      }
    }

    verifyStatus();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanSecret = secret.trim();

    if (!cleanEmail) {
      setErrorMessage('กรุณากรอกอีเมลของบัญชีที่สมัครไว้');
      return;
    }

    if (!cleanSecret) {
      setErrorMessage('กรุณากรอก Initial Setup Secret');
      return;
    }

    setIsLoading(true);
    try {
      // Find registered user in local database if available to pass for synchronization
      const profiles = getLocalDatabaseProfiles();
      const localMatch = profiles.find((p) => p.email.toLowerCase() === cleanEmail);

      const res = await performInitialAdminSetup(cleanEmail, cleanSecret, localMatch);

      if (res.success && res.user) {
        setSuccessResult(res.user);
        setCanSetup(false);
      } else {
        setErrorMessage(res.message || 'ไม่สามารถตั้งค่าผู้ดูแลระบบเริ่มต้นได้');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'เกิดข้อผิดพลาดในการตั้งค่า กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state while checking status
  if (isCheckingStatus) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center space-y-4 border border-slate-200 shadow-xl">
          <RefreshCw size={32} className="animate-spin text-emerald-700 mx-auto" />
          <p className="text-sm font-bold text-slate-700">กำลังตรวจสอบสถานะระบบ...</p>
        </div>
      </div>
    );
  }

  // Already has Super Admin state (Initial Setup Closed)
  if (!canSetup && !successResult) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6">
        <div className="bg-white rounded-3xl p-8 sm:p-10 max-w-lg w-full text-center space-y-6 border border-slate-200 shadow-xl animate-in fade-in duration-200">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
            <ShieldCheck size={36} />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 text-[11px] font-bold bg-slate-100 text-slate-700 rounded-full border border-slate-200">
              สถานะความปลอดภัย: ปิดการตั้งค่าเริ่มต้นแล้ว
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              ระบบมี Super Admin แล้ว
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {statusMessage ||
                'ระบบ Prasat Community Care มีผู้ดูแลระบบสูงสุด (Super Admin) ในฐานข้อมูลแล้ว จึงปิดหน้าการตั้งค่าเริ่มต้นนี้ถาวรเพื่อความปลอดภัยสูงสุดของระบบ'}
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs text-slate-600 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <Info size={14} className="text-emerald-700" />
              <span>ต้องการเข้าใช้งานระบบ?</span>
            </div>
            <p>
              หากคุณมีบัญชีผู้ดูแลระบบอยู่แล้ว กรุณาเข้าสู่ระบบผ่านพอร์ทัลแอดมิน / เจ้าหน้าที่
              หรือหากเป็นเจ้าหน้าที่ใหม่ กรุณาสมัครผ่านหน้าสมัครสมาชิกเจ้าหน้าที่และรอการอนุมัติ
            </p>
          </div>

          <button
            type="button"
            onClick={onGoBackToLogin}
            className="w-full py-3.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
          >
            <span>ไปที่หน้าเข้าสู่ระบบ</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  // Success State
  if (successResult) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6">
        <div className="bg-white rounded-3xl p-8 sm:p-10 max-w-lg w-full text-center space-y-6 border border-emerald-200 shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 size={36} />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 text-[11px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full">
              เสร็จสิ้นการตั้งค่าเริ่มต้น
            </span>
            <h2 className="text-2xl font-black text-slate-900">
              แต่งตั้ง Super Admin สำเร็จ!
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              บัญชีของคุณได้รับการแต่งตั้งเป็นผู้ดูแลระบบสูงสุดของ Prasat Community Care เรียบร้อยแล้ว
            </p>
          </div>

          {/* User Card */}
          <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50/50 rounded-2xl border border-emerald-200 text-left text-xs space-y-2.5 shadow-xs">
            <div className="flex justify-between items-center pb-2 border-b border-emerald-100">
              <span className="text-slate-500 font-medium">ชื่อผู้ใช้งาน:</span>
              <span className="font-bold text-slate-900 text-sm">{successResult.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">อีเมล:</span>
              <span className="font-semibold text-slate-800">{successResult.email}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">ระดับสิทธิ์ (Role):</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-600 text-white">
                super_admin (ผู้ดูแลระบบสูงสุด)
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">สถานะบัญชี (Status):</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                active (เปิดใช้งานแล้ว)
              </span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-emerald-100 text-[11px] text-slate-400">
              <span>อนุมัติโดย:</span>
              <span className="font-mono text-emerald-800 font-bold">system_initial_setup</span>
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 text-left">
            <p className="font-bold flex items-center gap-1.5 mb-0.5">
              <AlertTriangle size={13} className="text-amber-700 shrink-0" />
              <span>ความปลอดภัยของระบบ:</span>
            </p>
            <p>
              ระบบได้ทำการปิด Initial Setup ทันที บัญชีอื่นจะไม่สามารถใช้หน้านี้สร้าง Super Admin เพิ่มได้
            </p>
          </div>

          <button
            id="btn-login-with-new-super-admin"
            type="button"
            onClick={() => onSetupSuccess(successResult)}
            className="w-full py-4 px-4 bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-900 hover:to-teal-900 text-white font-extrabold text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
          >
            <span>เข้าสู่ระบบในฐานะ Super Admin ทันที</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  // Active Setup Form
  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in duration-200">
        <SurinSilkRibbon className="h-1.5" />

        <div className="p-6 sm:p-10 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-emerald-900 via-emerald-800 to-amber-600 text-white shadow-md shadow-emerald-900/20 mb-1">
              <ElephantMascot size={38} />
            </div>

            <div className="flex items-center justify-center gap-2">
              <span className="px-3 py-0.5 bg-amber-100 text-amber-900 text-[11px] font-bold rounded-full border border-amber-200">
                ติดตั้งระบบครั้งแรก (One-time Initial Setup)
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              ตั้งค่าผู้ดูแลระบบเริ่มต้น
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              แต่งตั้ง Super Admin คนแรกของ Prasat Community Care เพื่อเข้าใช้งานหลังบ้านและอนุมัติเจ้าหน้าที่
            </p>
          </div>

          {/* 5-Step Process Guide */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs space-y-2.5">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <Info size={14} className="text-emerald-700" />
              <span>ขั้นตอนการแต่งตั้งผู้ดูแลระบบคนแรก:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1 leading-relaxed">
              <li>
                <span className="font-medium text-slate-800">สมัครสมาชิก</span> ผ่านหน้าสมัครสมาชิกปกติก่อน
              </li>
              <li>
                <span className="font-medium text-slate-800">กรอกอีเมล</span> ของบัญชีที่สมัครไว้ในช่องด้านล่าง
              </li>
              <li>
                <span className="font-medium text-slate-800">กรอก Secret</span> รหัสความปลอดภัยจาก Server Environment
              </li>
              <li>
                ระบบจะตรวจสอบและปรับสิทธิ์บัญชีนี้เป็น <span className="text-emerald-800 font-bold">super_admin</span> สถานะ <span className="text-emerald-800 font-bold">active</span>
              </li>
              <li>
                เข้าสู่ระบบหลังบ้านเพื่ออนุมัติคำขอของเจ้าหน้าที่คนอื่น ๆ ได้ทันที
              </li>
            </ol>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in duration-150">
                <AlertTriangle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                <span className="font-semibold">{errorMessage}</span>
              </div>
            )}

            {/* Email Input */}
            <div className="space-y-1.5">
              <label htmlFor="input-initial-email" className="block text-xs font-bold text-slate-700">
                อีเมลของบัญชีที่สมัครไว้ <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={16} />
                </div>
                <input
                  id="input-initial-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="เช่น admin@prasat.go.th"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent transition-all"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                ต้องเป็นอีเมลของบัญชีที่ได้ทำการลงทะเบียนไว้ในระบบเรียบร้อยแล้ว
              </p>
            </div>

            {/* Initial Setup Secret Input */}
            <div className="space-y-1.5">
              <label htmlFor="input-initial-secret" className="block text-xs font-bold text-slate-700">
                Initial Setup Secret <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound size={16} />
                </div>
                <input
                  id="input-initial-secret"
                  type={showSecret ? 'text' : 'password'}
                  required
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="กรอกรหัสลับ Initial Admin Setup Secret"
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                รหัสผ่านลับจาก Environment Variable ของเซิร์ฟเวอร์ (INITIAL_ADMIN_SETUP_SECRET)
              </p>
            </div>

            {/* Submit Button */}
            <button
              id="btn-submit-initial-setup"
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>กำลังตรวจสอบและแต่งตั้ง Super Admin...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  <span>ยืนยันการตั้งค่าผู้ดูแลระบบเริ่มต้น</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Back Button */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <button
              type="button"
              onClick={onGoBackToLogin}
              className="font-semibold text-slate-600 hover:text-emerald-800 transition-colors cursor-pointer"
            >
              ← กลับไปหน้าเข้าสู่ระบบ
            </button>

            <span className="text-[11px] text-slate-400">
              Prasat Community Care • ปราสาท สุรินทร์
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
