import React, { useState } from 'react';
import {
  Menu,
  X,
  PlusCircle,
  Search,
  MapPin,
  Home,
  ShieldCheck,
  User as UserIcon,
  RotateCcw,
  History,
  PhoneCall,
  Users,
  LogOut,
  LayoutDashboard,
  Bell,
  Database,
  Settings,
  BarChart3,
} from 'lucide-react';
import { User, TicketNotification, AppTab } from '../types';
import { ElephantMascot, PrasatIcon, SurinSilkRibbon } from './SurinMotifs';
import { NotificationCenter } from './NotificationCenter';

interface NavbarProps {
  currentTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  currentUser: User;
  onOpenProfile: () => void;
  onLogout: () => void;
  onResetData: () => void;
  pendingCount: number;
  notifications: TicketNotification[];
  onSelectNotification: (notification: TicketNotification) => void;
  onMarkAllNotificationsAsRead: () => void;
  onSimulateStatusChange: () => void;
  isDbConnected?: boolean;
  onOpenSqlModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onOpenProfile,
  onLogout,
  onResetData,
  pendingCount,
  notifications,
  onSelectNotification,
  onMarkAllNotificationsAsRead,
  onSimulateStatusChange,
  isDbConnected = true,
  onOpenSqlModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (tab: AppTab) => {
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
            onClick={() => handleNavClick(isOfficer ? 'officer' : 'home')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="relative">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-emerald-800 via-emerald-700 to-amber-600 flex items-center justify-center text-white shadow-md shadow-emerald-800/20 group-hover:scale-105 transition-transform p-1">
                <ElephantMascot size={34} className="drop-shadow-xs" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-900 p-0.5 rounded-full border-2 border-white shadow-2xs">
                <PrasatIcon size={11} className="text-slate-900" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm sm:text-base font-extrabold text-emerald-950 group-hover:text-emerald-800 transition-colors">
                  Prasat Community Care
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.2 text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-300/80 rounded-full">
                  สุรินทร์
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium">
                {isOfficer ? 'ระบบปฏิบัติการเจ้าหน้าที่ • อ.ปราสาท' : 'ชุมชนช่วยกันดูแลบ้าน • 18 ตำบล 241 หมู่บ้าน'}
              </p>
            </div>
          </div>

          {/* Desktop Navigation - Role Differentiated */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1">
            {/* Citizen Nav Items */}
            {!isOfficer && (
              <>
                <button
                  id="nav-home"
                  type="button"
                  onClick={() => handleNavClick('home')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs xl:text-sm font-medium transition-colors ${
                    currentTab === 'home'
                      ? 'bg-emerald-50 text-emerald-800 font-bold'
                      : 'text-slate-600 hover:text-emerald-800 hover:bg-slate-50'
                  }`}
                >
                  <Home size={16} />
                  <span>หน้าหลัก</span>
                </button>

                <button
                  id="nav-track"
                  type="button"
                  onClick={() => handleNavClick('track')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs xl:text-sm font-medium transition-colors ${
                    currentTab === 'track'
                      ? 'bg-emerald-50 text-emerald-800 font-bold'
                      : 'text-slate-600 hover:text-emerald-800 hover:bg-slate-50'
                  }`}
                >
                  <Search size={16} />
                  <span>ติดตามปัญหา</span>
                </button>

                <button
                  id="nav-my-history"
                  type="button"
                  onClick={() => handleNavClick('my_history')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs xl:text-sm font-medium transition-colors ${
                    currentTab === 'my_history'
                      ? 'bg-emerald-50 text-emerald-800 font-bold'
                      : 'text-slate-600 hover:text-emerald-800 hover:bg-slate-50'
                  }`}
                >
                  <History size={16} />
                  <span>ประวัติของฉัน</span>
                </button>

                <button
                  id="nav-map"
                  type="button"
                  onClick={() => handleNavClick('map')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs xl:text-sm font-medium transition-colors ${
                    currentTab === 'map'
                      ? 'bg-emerald-50 text-emerald-800 font-bold'
                      : 'text-slate-600 hover:text-emerald-800 hover:bg-slate-50'
                  }`}
                >
                  <MapPin size={16} />
                  <span>แผนที่ปัญหา</span>
                </button>

                <button
                  id="nav-hotlines"
                  type="button"
                  onClick={() => handleNavClick('hotlines')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs xl:text-sm font-medium transition-colors ${
                    currentTab === 'hotlines'
                      ? 'bg-emerald-50 text-emerald-800 font-bold'
                      : 'text-slate-600 hover:text-emerald-800 hover:bg-slate-50'
                  }`}
                >
                  <PhoneCall size={16} />
                  <span>หน่วยงาน & สายด่วน</span>
                </button>

                <button
                  id="nav-members"
                  type="button"
                  onClick={() => handleNavClick('online_members')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs xl:text-sm font-medium transition-colors ${
                    currentTab === 'online_members'
                      ? 'bg-emerald-50 text-emerald-800 font-bold'
                      : 'text-slate-600 hover:text-emerald-800 hover:bg-slate-50'
                  }`}
                >
                  <Users size={16} />
                  <span>สมาชิกออนไลน์</span>
                </button>
              </>
            )}

            {/* Officer Nav Items */}
            {isOfficer && (
              <>
                <button
                  id="nav-officer-dashboard"
                  type="button"
                  onClick={() => handleNavClick('officer')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs xl:text-sm font-bold transition-colors ${
                    currentTab === 'officer'
                      ? 'bg-amber-50 text-amber-900 border border-amber-300 shadow-2xs'
                      : 'text-slate-700 hover:text-amber-800 hover:bg-amber-50/60'
                  }`}
                >
                  <LayoutDashboard size={17} className="text-amber-700" />
                  <span>Dashboard เจ้าหน้าที่</span>
                  {pendingCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 text-[10px] font-extrabold bg-amber-600 text-white rounded-full">
                      {pendingCount}
                    </span>
                  )}
                </button>

                <button
                  id="nav-officer-map"
                  type="button"
                  onClick={() => handleNavClick('map')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs xl:text-sm font-medium transition-colors ${
                    currentTab === 'map'
                      ? 'bg-emerald-50 text-emerald-800 font-bold'
                      : 'text-slate-600 hover:text-emerald-800 hover:bg-slate-50'
                  }`}
                >
                  <MapPin size={16} />
                  <span>แผนที่ปัญหาชุมชน</span>
                </button>

                <button
                  id="nav-officer-hotlines"
                  type="button"
                  onClick={() => handleNavClick('hotlines')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs xl:text-sm font-medium transition-colors ${
                    currentTab === 'hotlines'
                      ? 'bg-emerald-50 text-emerald-800 font-bold'
                      : 'text-slate-600 hover:text-emerald-800 hover:bg-slate-50'
                  }`}
                >
                  <PhoneCall size={16} />
                  <span>หน่วยงาน & สายด่วน</span>
                </button>

                <button
                  id="nav-officer-members"
                  type="button"
                  onClick={() => handleNavClick('online_members')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs xl:text-sm font-medium transition-colors ${
                    currentTab === 'online_members'
                      ? 'bg-emerald-50 text-emerald-800 font-bold'
                      : 'text-slate-600 hover:text-emerald-800 hover:bg-slate-50'
                  }`}
                >
                  <Users size={16} />
                  <span>สมาชิกออนไลน์</span>
                </button>

                <button
                  id="nav-officer-backend"
                  type="button"
                  onClick={() => handleNavClick('backend_settings')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs xl:text-sm font-bold transition-colors ${
                    currentTab === 'backend_settings'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-slate-700 hover:text-emerald-900 hover:bg-emerald-50'
                  }`}
                >
                  <Settings size={16} />
                  <span>ตั้งค่าหลังบ้าน</span>
                </button>
              </>
            )}
          </nav>

          {/* Action Buttons & Profile Controls */}
          <div className="hidden lg:flex items-center gap-2.5">
            {/* Notification Bell with Badge */}
            <NotificationCenter
              notifications={notifications}
              onSelectNotification={onSelectNotification}
              onMarkAllAsRead={onMarkAllNotificationsAsRead}
              onSimulateStatusChange={onSimulateStatusChange}
            />

            {/* Quick Report CTA for citizen */}
            {!isOfficer && (
              <button
                id="btn-quick-report"
                type="button"
                onClick={() => handleNavClick('report')}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-800 to-teal-700 hover:from-emerald-900 hover:to-teal-800 text-white font-semibold text-xs rounded-xl shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <PlusCircle size={15} />
                <span>แจ้งปัญหาใหม่</span>
              </button>
            )}

            {/* Cloud Database Schema & SQL Export (Staff Only) */}
            {isOfficer && (
              <button
                id="btn-nav-sql-export"
                type="button"
                onClick={onOpenSqlModal}
                className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold border transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                  isDbConnected
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                }`}
                title="โครงสร้างฐานข้อมูลและสคริปต์ SQL ของระบบ"
              >
                <Database size={13} className={isDbConnected ? 'text-emerald-600' : 'text-amber-600'} />
                <span>โครงสร้างฐานข้อมูล</span>
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isDbConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                  }`}
                ></span>
              </button>
            )}

            {/* Backend Settings (Staff Only) */}
            {isOfficer && (
              <button
                id="btn-nav-backend"
                type="button"
                onClick={() => handleNavClick('backend_settings')}
                className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                  currentTab === 'backend_settings'
                    ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                    : 'bg-emerald-50 text-emerald-900 border-emerald-300/80 hover:bg-emerald-100'
                }`}
                title="เข้าสู่หน้าการตั้งค่าหลังบ้าน Dashboard และ Member"
              >
                <Settings size={13} className={currentTab === 'backend_settings' ? 'text-white' : 'text-emerald-700'} />
                <span>ตั้งค่าหลังบ้าน</span>
              </button>
            )}

            {/* Role indicator badge */}
            <div
              className={`px-2.5 py-1 rounded-xl text-xs font-bold border flex items-center gap-1 ${
                isOfficer
                  ? 'bg-amber-50 text-amber-900 border-amber-300'
                  : 'bg-emerald-50 text-emerald-900 border-emerald-300'
              }`}
            >
              {isOfficer ? (
                <ShieldCheck size={13} className="text-amber-700" />
              ) : (
                <UserIcon size={13} className="text-emerald-700" />
              )}
              <span>{isOfficer ? 'จนท. อ.ปราสาท' : 'ประชาชน'}</span>
            </div>

            {/* Profile Avatar / Modal */}
            <button
              id="btn-nav-profile"
              type="button"
              onClick={onOpenProfile}
              className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
              title="ดูโปรไฟล์และข้อมูลส่วนตัว"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover ring-2 ring-emerald-600/30"
              />
              <div className="text-left text-xs leading-tight">
                <p className="font-semibold text-slate-800 truncate max-w-[90px]">{currentUser.name}</p>
                <span className="text-[10px] text-slate-400">โปรไฟล์</span>
              </div>
            </button>

            {/* Logout button */}
            <button
              id="btn-nav-logout"
              type="button"
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 rounded-xl transition-colors cursor-pointer shadow-2xs"
              title="ออกจากระบบ เพื่อกลับไปหน้าเข้าสู่ระบบหรือสลับบัญชี"
            >
              <LogOut size={15} />
              <span>ออกจากระบบ</span>
            </button>
          </div>

          {/* Mobile menu button and quick notification */}
          <div className="flex items-center gap-1.5 lg:hidden">
            <NotificationCenter
              notifications={notifications}
              onSelectNotification={onSelectNotification}
              onMarkAllAsRead={onMarkAllNotificationsAsRead}
              onSimulateStatusChange={onSimulateStatusChange}
            />

            {!isOfficer && (
              <button
                type="button"
                onClick={() => handleNavClick('report')}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-xs"
              >
                <PlusCircle size={14} />
                <span>แจ้งเรื่อง</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white/98 px-4 pt-3 pb-6 space-y-3 shadow-xl">
          {/* Active User info */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-3">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-600/30"
              />
              <div>
                <p className="text-sm font-bold text-slate-900">{currentUser.name}</p>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                      isOfficer ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {isOfficer ? 'เจ้าหน้าที่' : 'ประชาชน'}
                  </span>
                  <span>{currentUser.phone}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenProfile();
                }}
                className="text-xs text-emerald-800 font-bold px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200"
              >
                โปรไฟล์
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLogout();
                }}
                className="text-xs text-rose-700 font-bold px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 flex items-center gap-1"
                title="ออกจากระบบ"
              >
                <LogOut size={13} />
                <span>ออก</span>
              </button>
            </div>
          </div>

          {/* Navigation Links according to role */}
          <div className="space-y-1 pt-1">
            {!isOfficer ? (
              /* Citizen Mobile Menu */
              <>
                <button
                  type="button"
                  onClick={() => handleNavClick('home')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                    currentTab === 'home' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-700'
                  }`}
                >
                  <Home size={18} />
                  <span>1. หน้าหลัก</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick('report')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                    currentTab === 'report' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-700'
                  }`}
                >
                  <PlusCircle size={18} />
                  <span>2. แจ้งปัญหาใหม่</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick('track')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                    currentTab === 'track' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-700'
                  }`}
                >
                  <Search size={18} />
                  <span>3. ติดตามปัญหา</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick('my_history')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                    currentTab === 'my_history' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-700'
                  }`}
                >
                  <History size={18} />
                  <span>4. ประวัติของฉัน</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick('map')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                    currentTab === 'map' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-700'
                  }`}
                >
                  <MapPin size={18} />
                  <span>5. แผนที่ปัญหาชุมชน</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick('hotlines')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                    currentTab === 'hotlines' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-700'
                  }`}
                >
                  <PhoneCall size={18} />
                  <span>6. หน่วยงานและสายด่วน</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick('online_members')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                    currentTab === 'online_members' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-700'
                  }`}
                >
                  <Users size={18} />
                  <span>7. สมาชิกออนไลน์</span>
                </button>
              </>
            ) : (
              /* Officer Mobile Menu */
              <>
                <button
                  type="button"
                  onClick={() => handleNavClick('officer')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold ${
                    currentTab === 'officer'
                      ? 'bg-amber-50 text-amber-900 border border-amber-300'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <LayoutDashboard size={18} className="text-amber-700" />
                    <span>1. Dashboard เจ้าหน้าที่</span>
                  </div>
                  {pendingCount > 0 && (
                    <span className="px-2 py-0.5 text-xs bg-amber-600 text-white rounded-full font-bold">
                      {pendingCount} รอตรวจ
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick('map')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                    currentTab === 'map' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-700'
                  }`}
                >
                  <MapPin size={18} />
                  <span>2. แผนที่ปัญหาชุมชน</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick('hotlines')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                    currentTab === 'hotlines' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-700'
                  }`}
                >
                  <PhoneCall size={18} />
                  <span>3. หน่วยงานและสายด่วน</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick('online_members')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                    currentTab === 'online_members' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-700'
                  }`}
                >
                  <Users size={18} />
                  <span>4. สมาชิกออนไลน์</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick('backend_settings')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold ${
                    currentTab === 'backend_settings'
                      ? 'bg-emerald-800 text-white'
                      : 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Settings size={18} />
                    <span>5. ตั้งค่าหลังบ้าน (Dashboard & Member)</span>
                  </div>
                  <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-bold">
                    Admin
                  </span>
                </button>
              </>
            )}

            {/* Profile action */}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenProfile();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <UserIcon size={18} className="text-slate-500" />
              <span>โปรไฟล์</span>
            </button>

            {/* Logout action */}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onLogout();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50"
            >
              <LogOut size={18} />
              <span>ออกจากระบบ</span>
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
            <span className="text-[11px] text-slate-400">Prasat Community Care v3.0</span>
          </div>
        </div>
      )}
    </header>
  );
};
