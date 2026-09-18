import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  UserCheck,
  Search,
  Info,
  Shield,
  Clock,
  MapPin,
  Building2,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { UserRole } from '../types';
import { ElephantMascot, PrasatIcon, SurinCommunityBadge } from './SurinMotifs';
import { getOnlineMembersStats } from '../services/supabaseService';
import { PRASAT_SUB_DISTRICTS } from '../data/prasatLocations';

interface OnlineMembersViewProps {
  currentUserRole?: UserRole | 'officer' | 'admin';
  onNavigateHome?: () => void;
}

export const OnlineMembersView: React.FC<OnlineMembersViewProps> = ({
  currentUserRole = 'citizen',
  onNavigateHome,
}) => {
  const isStaff = currentUserRole === 'staff' || currentUserRole === 'officer' || currentUserRole === 'admin';

  const [stats, setStats] = useState({
    onlineCitizens: 0,
    onlineStaff: 0,
    totalActive: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const data = await getOnlineMembersStats();
      setStats(data);
      setLastRefreshed(new Date());
    } catch (e) {
      console.error('Failed to get online members stats:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-950 via-teal-950 to-amber-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-emerald-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <SurinCommunityBadge variant="dark" />
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-emerald-200 backdrop-blur-xs inline-flex items-center gap-1.5 border border-white/10">
                <PrasatIcon size={14} className="text-amber-300" />
                <span>สถานะกิจกรรมชุมชน อ.ปราสาท</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              สถานะสมาชิกออนไลน์ในระบบ
            </h1>
            <p className="text-emerald-100/90 text-xs sm:text-sm leading-relaxed">
              Prasat Community Care • ประมวลผลสถานะออนไลน์จริงตามการเคลื่อนไหวล่าสุด (ภายใน 5 นาที)
              เพื่อความปลอดภัยและความเป็นส่วนตัวของสมาชิกทุกคนในชุมชน
            </p>
          </div>

          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-emerald-900/60 border border-emerald-700/50 backdrop-blur-xs text-center shrink-0">
            <button
              type="button"
              onClick={fetchStats}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-1.5 bg-emerald-800/80 hover:bg-emerald-700 text-amber-200 rounded-xl text-xs font-bold transition-all border border-emerald-600/60"
            >
              <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
              <span>รีเฟรชสถานะ</span>
            </button>
            <span className="text-[10px] text-emerald-300/80 mt-1.5">
              อัปเดตล่าสุด: {lastRefreshed.toLocaleTimeString('th-TH')}
            </span>
          </div>
        </div>
      </div>

      {/* User Rule 14: Aggregate Status Cards (Strictly Safe Counts) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Citizens Online */}
        <div className="bg-white p-6 rounded-3xl border border-teal-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-teal-800 uppercase tracking-wider flex items-center gap-2">
              <UserCheck size={17} className="text-teal-600" />
              <span>ประชาชนออนไลน์</span>
            </span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              🟢 ออนไลน์
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-teal-900">{stats.onlineCitizens}</span>
            <span className="text-sm font-semibold text-slate-500">คน</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1.5">
            <Clock size={12} className="text-teal-600" />
            <span>มีความเคลื่อนไหวภายใน 5 นาทีล่าสุด</span>
          </p>
        </div>

        {/* Staff Online */}
        <div className="bg-white p-6 rounded-3xl border border-sky-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-sky-800 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck size={17} className="text-sky-600" />
              <span>เจ้าหน้าที่ออนไลน์</span>
            </span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-sky-50 text-sky-800 border border-sky-200">
              🟢 ออนไลน์
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-sky-900">{stats.onlineStaff}</span>
            <span className="text-sm font-semibold text-slate-500">คน</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1.5">
            <ShieldCheck size={12} className="text-sky-600" />
            <span>พร้อมรับเรื่องและประสานงานแก้ไขปัญหา</span>
          </p>
        </div>

        {/* Total Active Session */}
        <div className="bg-white p-6 rounded-3xl border border-amber-200 shadow-xs hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-2">
              <Users size={17} className="text-amber-700" />
              <span>รวมสมาชิกที่มีกิจกรรม</span>
            </span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
              ⚡ แอคทีฟ
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-amber-950">{stats.totalActive}</span>
            <span className="text-sm font-semibold text-slate-500">คน</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            ครอบคลุม 18 ตำบลในอำเภอปราสาท จังหวัดสุรินทร์
          </p>
        </div>
      </div>

      {/* Privacy Notice Card */}
      <div className="p-5 bg-emerald-50/90 rounded-3xl border border-emerald-200/80 flex items-start gap-3.5 text-xs text-emerald-950">
        <Info size={20} className="text-emerald-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-emerald-900 text-sm">
            นโยบายการคุ้มครองข้อมูลส่วนบุคคล (PDPA Community Privacy)
          </p>
          <p className="text-emerald-800/90 text-xs leading-relaxed">
            ระบบแสดงเฉพาะจำนวนสถิติรวมของสมาชิกที่ออนไลน์ โดยไม่มีการเปิดเผยรายชื่อ นามสกุล เบอร์โทรศัพท์
            หรือข้อมูลส่วนบุคคลใด ๆ ของสมาชิกแก่บุคคลภายนอก เพื่อความปลอดภัยและเป็นส่วนตัวสูงสุดของประชาชน
          </p>
        </div>
      </div>

      {/* Community Coverage Overview (18 Sub-districts Standby Readiness) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              สถานะความพร้อมการดูแล 18 ตำบล อ.ปราสาท
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              ศูนย์รับแจ้งเหตุและทีมช่างประจำพื้นที่ อบต./เทศบาล
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 bg-teal-50 text-teal-800 rounded-full border border-teal-200">
            ครอบคลุม 100%
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
          {PRASAT_SUB_DISTRICTS.map((sd) => (
            <div
              key={sd.id}
              className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between hover:bg-teal-50/50 hover:border-teal-200 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-[10px] font-semibold text-slate-400">
                  {sd.villages.length} หมู่บ้าน
                </span>
              </div>
              <p className="text-xs font-bold text-slate-800">ต.{sd.name}</p>
              <p className="text-[10px] text-emerald-700 font-medium mt-1">
                พร้อมรับเรื่อง
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
