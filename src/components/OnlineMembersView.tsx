import React, { useState } from 'react';
import {
  Users,
  ShieldCheck,
  UserCheck,
  Search,
  Info,
  Shield,
  Clock,
  Sparkles,
  MapPin,
  Building2,
} from 'lucide-react';
import { INITIAL_MEMBERS, OnlineMember } from '../data/onlineMembers';
import { ElephantMascot, PrasatIcon, SurinCommunityBadge } from './SurinMotifs';

interface OnlineMembersViewProps {
  currentUserRole?: 'citizen' | 'officer' | 'admin';
  onNavigateHome?: () => void;
}

export const OnlineMembersView: React.FC<OnlineMembersViewProps> = ({
  currentUserRole = 'citizen',
  onNavigateHome,
}) => {
  const [filter, setFilter] = useState<'all' | 'online' | 'officer' | 'citizen'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const onlineMembersCount = INITIAL_MEMBERS.filter((m) => m.status === 'online').length;
  const onlineCitizensCount = INITIAL_MEMBERS.filter(
    (m) => m.status === 'online' && m.role === 'citizen'
  ).length;
  const onlineOfficersCount = INITIAL_MEMBERS.filter(
    (m) => m.status === 'online' && m.role === 'officer'
  ).length;

  const totalMembers = INITIAL_MEMBERS.length;

  const filteredList = INITIAL_MEMBERS.filter((member) => {
    if (filter === 'online' && member.status !== 'online') return false;
    if (filter === 'officer' && member.role !== 'officer') return false;
    if (filter === 'citizen' && member.role !== 'citizen') return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        member.displayName.toLowerCase().includes(q) ||
        member.subDistrict.toLowerCase().includes(q) ||
        member.roleLabel.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Header Banner - Surin Local Modern Style */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-emerald-800">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(#FDE68A 1px, transparent 1px), radial-gradient(#FDE68A 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            backgroundPosition: '0 0, 12px 12px',
          }}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <SurinCommunityBadge variant="dark" />
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-emerald-200 backdrop-blur-xs inline-flex items-center gap-1.5 border border-white/10">
                <PrasatIcon size={14} className="text-amber-300" />
                <span>สถานะสมาชิกในระบบ</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              สมาชิกออนไลน์ในระบบ
            </h1>
            <p className="text-emerald-100/85 text-xs sm:text-sm leading-relaxed">
              Prasat Community Care • ชุมชนเล็ก ๆ ของสุรินทร์ที่ช่วยกันดูแลบ้านของเรา
              แสดงจำนวนผู้ใช้งานและเจ้าหน้าที่ที่กำลังออนไลน์อยู่เพื่อความโปร่งใสและร่วมมือกัน
            </p>
          </div>

          <div className="hidden lg:flex flex-col items-center justify-center p-4 rounded-2xl bg-emerald-900/60 border border-emerald-700/50 backdrop-blur-xs text-center shrink-0">
            <ElephantMascot size={52} className="mb-1 text-amber-300" />
            <span className="text-xs font-bold text-amber-300">ชุมชนเข้มแข็ง</span>
            <span className="text-[11px] text-emerald-200">ดูแลบ้านเราด้วยกัน</span>
          </div>
        </div>
      </div>

      {/* Aggregate Counts Display (Requirement 2: สมาชิกออนไลน์ 12 คน, ประชาชน 10 คน, เจ้าหน้าที่ 2 คน) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Online */}
        <div className="bg-white p-6 rounded-3xl border border-emerald-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              สมาชิกออนไลน์
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Users size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-slate-900">{onlineMembersCount}</span>
            <span className="text-sm font-semibold text-slate-500">คน</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            จากสมาชิกทั้งหมด {totalMembers} บัญชีในระบบ
          </p>
        </div>

        {/* Citizens Online */}
        <div className="bg-white p-6 rounded-3xl border border-teal-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-teal-800 uppercase tracking-wider flex items-center gap-2">
              <UserCheck size={16} className="text-teal-600" />
              ประชาชน
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
              🟢 ออนไลน์
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-teal-900">{onlineCitizensCount}</span>
            <span className="text-sm font-semibold text-slate-500">คน</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            ประชาชน 18 ตำบลในอำเภอปราสาท
          </p>
        </div>

        {/* Officers Online */}
        <div className="bg-white p-6 rounded-3xl border border-sky-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-sky-800 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck size={16} className="text-sky-600" />
              เจ้าหน้าที่
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
              🟢 ออนไลน์
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-sky-900">{onlineOfficersCount}</span>
            <span className="text-sm font-semibold text-slate-500">คน</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            พร้อมรับเรื่องและประสานงานแก้ไขปัญหา
          </p>
        </div>
      </div>

      {/* Privacy Guarantee Banner (Requirement 2: ไม่เปิดเผยข้อมูลส่วนตัวที่ไม่จำเป็นของสมาชิก) */}
      <div className="p-4 bg-emerald-50/90 rounded-2xl border border-emerald-200 flex items-start gap-3 text-xs text-emerald-950">
        <Info size={18} className="text-emerald-700 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold text-emerald-900">
            นโยบายการคุ้มครองข้อมูลส่วนบุคคล (PDPA Community Care)
          </p>
          <p className="text-emerald-800/90 text-[11px] leading-relaxed">
            ระบบแสดงเฉพาะจำนวนสถิติสมาชิกออนไลน์ นามแฝงหรือชื่อย่อ และตำบลในอำเภอปราสาทเท่านั้น
            ไม่มีการเปิดเผยหมายเลขโทรศัพท์ รหัสผ่าน อีเมลส่วนบุคคล หรือข้อมูลอ่อนไหวใด ๆ ของสมาชิก
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                filter === 'all'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ทั้งหมด ({INITIAL_MEMBERS.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('online')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                filter === 'online'
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>เฉพาะออนไลน์ ({onlineMembersCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilter('officer')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                filter === 'officer'
                  ? 'bg-sky-700 text-white shadow-2xs'
                  : 'bg-sky-50 text-sky-800 hover:bg-sky-100'
              }`}
            >
              เจ้าหน้าที่ปฏิบัติการ ({INITIAL_MEMBERS.filter((m) => m.role === 'officer').length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('citizen')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                filter === 'citizen'
                  ? 'bg-teal-700 text-white shadow-2xs'
                  : 'bg-teal-50 text-teal-800 hover:bg-teal-100'
              }`}
            >
              ประชาชนในพื้นที่ ({INITIAL_MEMBERS.filter((m) => m.role === 'citizen').length})
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาชื่อหรือตำบล..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Member Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {filteredList.map((member) => {
            const isOnline = member.status === 'online';
            const isOfficer = member.role === 'officer';

            return (
              <div
                key={member.id}
                className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:border-emerald-300 hover:shadow-sm transition-all flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Status Indicator Avatar */}
                  <div className="relative shrink-0">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-2xs ${
                        isOfficer
                          ? 'bg-sky-100 text-sky-800 border border-sky-300'
                          : 'bg-teal-100 text-teal-800 border border-teal-300'
                      }`}
                    >
                      {member.displayName.slice(0, 2)}
                    </div>
                    {/* Status Dot: 🟢 Online, ⚪ Offline */}
                    <span
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                        isOnline ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                      title={isOnline ? '🟢 ออนไลน์' : '⚪ ออฟไลน์'}
                    />
                  </div>

                  {/* Name and Details */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {member.displayName}
                      </p>
                      {isOfficer && (
                        <ShieldCheck size={13} className="text-sky-600 shrink-0" />
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span className="flex items-center gap-0.5 truncate">
                        <MapPin size={11} className="text-slate-400 shrink-0" />
                        <span>ต.{member.subDistrict}</span>
                      </span>
                      <span>•</span>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-md ${
                          isOfficer
                            ? 'bg-sky-50 text-sky-700'
                            : 'bg-teal-50 text-teal-700'
                        }`}
                      >
                        {member.roleLabel}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Online / Offline Badge */}
                <div className="shrink-0 text-right">
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                      isOnline
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                  >
                    <span>{isOnline ? '🟢 ออนไลน์' : '⚪ ออฟไลน์'}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {filteredList.length === 0 && (
          <div className="text-center py-12 text-slate-400 space-y-2">
            <Users size={36} className="mx-auto opacity-30" />
            <p className="text-xs">ไม่พบรายชื่อสมาชิกที่ตรงกับเงื่อนไขการค้นหา</p>
          </div>
        )}
      </div>
    </div>
  );
};
