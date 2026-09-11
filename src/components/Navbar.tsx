import React, { useState } from 'react';
import {
  Menu,
  X,
  PlusCircle,
  Search,
  MapPin,
  BarChart3,
  Home,
  ShieldCheck,
  User as UserIcon,
  RotateCcw,
  Sparkles,
  ClipboardList,
} from 'lucide-react';
import { User } from '../types';
import { ElephantMascot, PrasatIcon, SurinSilkRibbon } from './SurinMotifs';

interface NavbarProps {
  currentTab: 'home' | 'report' | 'track' | 'map' | 'dashboard' | 'officer';
  onSelectTab: (tab: 'home' | 'report' | 'track' | 'map' | 'dashboard' | 'officer') => void;
  currentUser: User;
  onOpenAuth: () => void;
  onSwitchRole: (role: 'citizen' | 'officer') => void;
  onResetData: () => void;
  pendingCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onOpenAuth,
  onSwitchRole,
  onResetData,
  pendingCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (tab: 'home' | 'report' | 'track' | 'map' | 'dashboard' | 'officer') => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  const isOfficer = currentUser.role === 'officer' || currentUser.role === 'admin';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-900/10 shadow-xs">
      {/* Subtle traditional Surin silk ribbon accent */}
      <SurinSilkRibbon className="h-1" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo - Prasat Community Care */}
          <div
            id="brand-logo"
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="relative">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-emerald-800 via-emerald-700 to-amber-600 flex items-center justify-center text-white shadow-md shadow-emerald-800/20 group-hover:scale-105 transition-transform p-1">
                <ElephantMascot size={38} className="drop-shadow-xs" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-900 p-0.5 rounded-full border-2 border-white shadow-2xs">
                <PrasatIcon size={12} className="text-slate-900" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-extrabold text-emerald-950 group-hover:text-emerald-800 transition-colors">
                  Prasat Community Care
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-300/80 rounded-full">
                  สุรินทร์
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                ระบบแจ้งปัญหาชุมชน • 18 ตำบล 241 หมู่บ้าน
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              id="nav-home"
              type="button"
              onClick={() => handleNavClick('home')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                currentTab === 'home'
                  ? 'bg-emerald-50 text-emerald-800 font-bold'
                  : 'text-slate-600 hover:text-emerald-800 hover:bg-slate-50'
              }`}
            >
              <Home size={17} />
              <span>หน้าแรก</span>
            </button>

            <button
              id="nav-track"
              type="button"
              onClick={() => handleNavClick('track')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                currentTab === 'track'
                  ? 'bg-emerald-50 text-emerald-800 font-bold'
                  : 'text-slate-600 hover:text-emerald-800 hover:bg-slate-50'
              }`}
            >
              <Search size={17} />
              <span>ติดตามปัญหา</span>
            </button>

            <button
              id="nav-map"
              type="button"
              onClick={() => handleNavClick('map')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                currentTab === 'map'
                  ? 'bg-emerald-50 text-emerald-800 font-bold'
                  : 'text-slate-600 hover:text-emerald-800 hover:bg-slate-50'
              }`}
            >
              <MapPin size={17} />
              <span>แผนที่ชุมชน</span>
            </button>

            <button
              id="nav-dashboard"
              type="button"
              onClick={() => handleNavClick('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                currentTab === 'dashboard'
                  ? 'bg-emerald-50 text-emerald-800 font-bold'
                  : 'text-slate-600 hover:text-emerald-800 hover:bg-slate-50'
              }`}
            >
              <BarChart3 size={17} />
              <span>สถิติ & กราฟ</span>
            </button>

            {/* Officer Desk tab */}
            <button
              id="nav-officer"
              type="button"
              onClick={() => handleNavClick('officer')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors relative ${
                currentTab === 'officer'
                  ? 'bg-amber-50 text-amber-900 font-bold border border-amber-200'
                  : 'text-slate-600 hover:text-amber-800 hover:bg-slate-50'
              }`}
            >
              <ShieldCheck size={18} className={isOfficer ? 'text-amber-700' : 'text-slate-400'} />
              <span>งานเจ้าหน้าที่</span>
              {pendingCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 text-[11px] font-bold bg-amber-600 text-white rounded-full">
                  {pendingCount}
                </span>
              )}
            </button>
          </nav>

          {/* Action Buttons & Profile Controls */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Quick Report CTA */}
            <button
              id="btn-quick-report"
              type="button"
              onClick={() => handleNavClick('report')}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-800 to-teal-700 hover:from-emerald-900 hover:to-teal-800 text-white font-semibold text-sm rounded-xl shadow-md shadow-emerald-800/20 hover:shadow-lg transition-all active:scale-95"
            >
              <PlusCircle size={17} />
              <span>แจ้งปัญหาใหม่</span>
            </button>

            {/* Role switch toggle pill */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => onSwitchRole('citizen')}
                className={`px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                  !isOfficer
                    ? 'bg-white text-emerald-900 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                ประชาชน
              </button>
              <button
                type="button"
                onClick={() => onSwitchRole('officer')}
                className={`px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                  isOfficer
                    ? 'bg-white text-amber-900 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                เจ้าหน้าที่
              </button>
            </div>

            {/* Profile Avatar / Login modal */}
            <button
              type="button"
              onClick={onOpenAuth}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
              title="จัดการบัญชีผู้ใช้งาน"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover ring-2 ring-emerald-600/30"
              />
              <div className="text-left text-xs leading-none">
                <p className="font-semibold text-slate-800 truncate max-w-[95px]">{currentUser.name}</p>
                <span className="text-[10px] text-emerald-700 font-medium">{isOfficer ? 'จนท.ปราสาท' : 'ชาวบ้าน'}</span>
              </div>
            </button>
          </div>

          {/* Mobile menu button and quick CTA */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => handleNavClick('report')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-xs"
            >
              <PlusCircle size={15} />
              <span>แจ้งเรื่อง</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white/98 px-4 pt-3 pb-6 space-y-3 shadow-xl">
          {/* Active User info */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-semibold text-slate-900">{currentUser.name}</p>
                <p className="text-xs text-slate-500">
                  {isOfficer ? 'เจ้าหน้าที่เทศบาล' : 'ประชาชนทั่วไป'} • {currentUser.phone}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAuth();
              }}
              className="text-xs text-teal-600 font-medium px-2 py-1 bg-teal-50 rounded-md"
            >
              สลับบัญชี
            </button>
          </div>

          {/* Role switcher for mobile */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-xl text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                onSwitchRole('citizen');
                setMobileMenuOpen(false);
              }}
              className={`py-2 rounded-lg text-center ${
                !isOfficer ? 'bg-white text-teal-700 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              โหมดประชาชน
            </button>
            <button
              type="button"
              onClick={() => {
                onSwitchRole('officer');
                setMobileMenuOpen(false);
              }}
              className={`py-2 rounded-lg text-center ${
                isOfficer ? 'bg-white text-sky-700 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              โหมดเจ้าหน้าที่ {pendingCount > 0 && `(${pendingCount})`}
            </button>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1 pt-1">
            <button
              type="button"
              onClick={() => handleNavClick('home')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                currentTab === 'home' ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-slate-700'
              }`}
            >
              <Home size={18} />
              <span>หน้าแรก</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('report')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                currentTab === 'report' ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-slate-700'
              }`}
            >
              <PlusCircle size={18} />
              <span>แจ้งปัญหาใหม่</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('track')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                currentTab === 'track' ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-slate-700'
              }`}
            >
              <Search size={18} />
              <span>ติดตามสถานะปัญหา</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('map')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                currentTab === 'map' ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-slate-700'
              }`}
            >
              <MapPin size={18} />
              <span>แผนที่ปัญหาชุมชน</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                currentTab === 'dashboard' ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-slate-700'
              }`}
            >
              <BarChart3 size={18} />
              <span>สถิติ & สรุปผลงาน</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('officer')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium ${
                currentTab === 'officer'
                  ? 'bg-sky-50 text-sky-700 font-semibold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShieldCheck size={18} className="text-sky-600" />
                <span>จัดการสำหรับเจ้าหน้าที่</span>
              </div>
              {pendingCount > 0 && (
                <span className="px-2 py-0.5 text-xs bg-amber-500 text-white rounded-full font-bold">
                  {pendingCount} รอตรวจ
                </span>
              )}
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                onResetData();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800"
            >
              <RotateCcw size={14} />
              <span>รีเซ็ตข้อมูลทดสอบ</span>
            </button>
            <span className="text-[11px] text-slate-400">Community Care v2.4</span>
          </div>
        </div>
      )}
    </header>
  );
};
