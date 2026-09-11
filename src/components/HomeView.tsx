import React, { useState } from 'react';
import {
  PlusCircle,
  Search,
  MapPin,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  PhoneCall,
  Users,
  Compass,
  Building2,
  Layers,
} from 'lucide-react';
import { CategoryType, Issue, IssueStatus, AppTab } from '../types';
import { CATEGORIES } from '../data/categories';
import { CategoryIcon } from './CategoryIcon';
import { StatusBadge } from './StatusBadge';
import { formatRelativeThaiTime } from '../utils/storage';
import { PRASAT_SUB_DISTRICTS } from '../data/prasatLocations';
import {
  ElephantMascot,
  PrasatIcon,
  SurinSilkRibbon,
  SurinCommunityBadge,
} from './SurinMotifs';

interface HomeViewProps {
  issues: Issue[];
  onNavigate: (tab: AppTab) => void;
  onSelectIssue: (issue: Issue) => void;
  onQuickSearch: (query: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  issues,
  onNavigate,
  onSelectIssue,
  onQuickSearch,
}) => {
  const [quickTicketInput, setQuickTicketInput] = useState('');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<CategoryType | 'all'>('all');
  const [selectedSubDistrictTab, setSelectedSubDistrictTab] = useState<string>('all');

  const totalCount = issues.length;
  const pendingCount = issues.filter((i) => i.status === 'pending').length;
  const inProgressCount = issues.filter((i) => i.status === 'in_progress' || i.status === 'acknowledged').length;
  const resolvedCount = issues.filter((i) => i.status === 'resolved' || i.status === 'closed').length;

  // Latest issues filtered by category & subdistrict
  const latestIssues = issues
    .filter((i) => (selectedCategoryTab === 'all' ? true : i.category === selectedCategoryTab))
    .filter((i) => {
      if (selectedSubDistrictTab === 'all') return true;
      return i.locationName.includes(selectedSubDistrictTab);
    })
    .slice(0, 6);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickTicketInput.trim()) {
      onQuickSearch(quickTicketInput.trim());
      onNavigate('track');
    }
  };

  return (
    <div className="space-y-10 pb-12">
      {/* Hero Section - Surin Local Modern Theme */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 text-white pt-10 sm:pt-14 pb-20 px-4 sm:px-6 lg:px-8">
        {/* Subtle Silk Weaving Geometric Pattern */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(#FDE68A 1px, transparent 1px), radial-gradient(#FDE68A 1px, transparent 1px)',
            backgroundSize: '28px 28px',
            backgroundPosition: '0 0, 14px 14px',
          }}
        />

        <div className="max-w-5xl mx-auto relative z-10 space-y-6">
          {/* Top Badge & Slogan */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <SurinCommunityBadge variant="dark" />
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 text-amber-200 border border-amber-300/30 text-xs font-semibold backdrop-blur-md">
              <PrasatIcon size={13} className="text-amber-300" />
              <span>18 ตำบล • 241 หมู่บ้าน</span>
            </span>
          </div>

          {/* Heading with Mascot Greeting */}
          <div className="text-center space-y-3">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              ชุมชนเล็ก ๆ ของสุรินทร์ <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-amber-200 via-amber-300 to-emerald-200 bg-clip-text text-transparent">
                ที่ช่วยกันดูแลบ้านของเรา
              </span>
            </h1>

            <p className="max-w-2xl mx-auto text-emerald-100/80 text-xs sm:text-base leading-relaxed">
              ยินดีต้อนรับสู่ระบบรับเรื่องร้องทุกข์และติดตามการแก้ไขปัญหาของชาวอำเภอปราสาท จังหวัดสุรินทร์
              ถนนชำรุด ไฟดับ ขยะล้น หรือท่อประปาแตก ส่งตรงถึงช่างเทศบาลและ อบต. ได้ทุกตำบล
            </p>
          </div>

          {/* Mascot Welcome Card */}
          <div className="max-w-xl mx-auto bg-emerald-900/60 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-emerald-700/50 flex items-center gap-3.5 shadow-lg shadow-emerald-950/40">
            <ElephantMascot size={58} className="shrink-0 drop-shadow-md" />
            <div className="text-left text-xs leading-relaxed text-emerald-100">
              <strong className="text-amber-300 block text-xs sm:text-sm font-bold mb-0.5">
                สวัสดีครับ! ช้างน้อยปราสาทพร้อมรับเรื่องครับ
              </strong>
              พบเห็นสิ่งชำรุดในหมู่บ้าน ถ่ายรูปแล้วกดแจ้งได้เลย ระบบจะประสานงานฝ่ายช่างลงตรวจสอบพื้นที่ให้ครับ
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              id="hero-btn-report"
              type="button"
              onClick={() => onNavigate('report')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-slate-950 font-bold text-sm sm:text-base rounded-2xl shadow-lg shadow-amber-600/30 hover:shadow-xl transition-all active:scale-98 cursor-pointer"
            >
              <PlusCircle size={20} className="text-slate-950" />
              <span>แจ้งปัญหาใหม่ในพื้นที่</span>
            </button>

            <button
              id="hero-btn-track"
              type="button"
              onClick={() => onNavigate('track')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 bg-white/10 hover:bg-white/15 text-white font-semibold text-sm sm:text-base rounded-2xl border border-white/20 backdrop-blur-md transition-all active:scale-98 cursor-pointer"
            >
              <Search size={19} />
              <span>ติดตามสถานะปัญหา</span>
            </button>

            <button
              id="hero-btn-map"
              type="button"
              onClick={() => onNavigate('map')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 bg-emerald-800/40 hover:bg-emerald-800/60 text-emerald-200 font-semibold text-sm rounded-2xl border border-emerald-500/30 backdrop-blur-md transition-all cursor-pointer"
            >
              <MapPin size={18} className="text-emerald-300" />
              <span>แผนที่ อ.ปราสาท</span>
            </button>
          </div>

          {/* Quick Ticket Tracking Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-lg mx-auto mt-4 flex items-center bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 shadow-inner"
          >
            <div className="pl-3 text-amber-300">
              <Search size={18} />
            </div>
            <input
              type="text"
              value={quickTicketInput}
              onChange={(e) => setQuickTicketInput(e.target.value)}
              placeholder="ค้นหาด่วนด้วยรหัส Ticket เช่น CC-2026-001..."
              className="w-full bg-transparent px-3 py-2 text-xs sm:text-sm text-white placeholder:text-emerald-200/60 focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold rounded-xl transition-colors shrink-0 cursor-pointer"
            >
              ค้นหา
            </button>
          </form>
        </div>
      </section>

      {/* Floating Statistics Cards (Overlapping Hero) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {/* Total */}
          <div className="bg-white p-5 rounded-3xl border border-emerald-900/10 shadow-md flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-800 shrink-0">
              <TrendingUp size={22} />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 block">ปัญหาทั้งหมด</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{totalCount}</span>
              <span className="text-[11px] text-emerald-700 font-medium block mt-0.5">ใน อ.ปราสาท</span>
            </div>
          </div>

          {/* Pending */}
          <div className="bg-white p-5 rounded-3xl border border-amber-900/10 shadow-md flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-800 shrink-0">
              <Clock size={22} />
            </div>
            <div>
              <span className="text-xs font-semibold text-amber-800 block">รอตรวจสอบ</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-900">{pendingCount}</span>
              <span className="text-[11px] text-amber-700 block mt-0.5">รับเรื่องใหม่</span>
            </div>
          </div>

          {/* In Progress */}
          <div className="bg-white p-5 rounded-3xl border border-sky-900/10 shadow-md flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-800 shrink-0">
              <Sparkles size={22} />
            </div>
            <div>
              <span className="text-xs font-semibold text-sky-800 block">กำลังดำเนินการ</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-sky-900">{inProgressCount}</span>
              <span className="text-[11px] text-sky-700 block mt-0.5">ทีมช่างลงพื้นที่</span>
            </div>
          </div>

          {/* Resolved */}
          <div className="bg-white p-5 rounded-3xl border border-emerald-900/10 shadow-md flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <span className="text-xs font-semibold text-emerald-800 block">แก้ไขแล้วเสร็จ</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-900">{resolvedCount}</span>
              <span className="text-[11px] text-emerald-700 font-semibold block mt-0.5">
                สำเร็จ {totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Sub-District Quick Filter (18 Tambons of Prasat) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-emerald-50/70 p-4 sm:p-5 rounded-3xl border border-emerald-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <PrasatIcon size={18} className="text-emerald-800 shrink-0" />
              <h3 className="text-xs sm:text-sm font-bold text-emerald-950">
                สำรวจปัญหาตามตำบลในอำเภอปราสาท (18 ตำบล)
              </h3>
            </div>
            <span className="text-[11px] text-emerald-700 font-medium">
              คลิกตำบลเพื่อกรองดูรายการปัญหาเฉพาะพื้นที่
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
            <button
              type="button"
              onClick={() => setSelectedSubDistrictTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedSubDistrictTab === 'all'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-emerald-200 hover:bg-emerald-100/50'
              }`}
            >
              ทุกตำบล ({totalCount})
            </button>
            {PRASAT_SUB_DISTRICTS.map((sd) => {
              const count = issues.filter((i) => i.locationName.includes(sd.name)).length;
              const isSelected = selectedSubDistrictTab === sd.name;
              return (
                <button
                  key={sd.id}
                  type="button"
                  onClick={() => setSelectedSubDistrictTab(isSelected ? 'all' : sd.name)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-amber-600 text-white font-bold shadow-xs'
                      : 'bg-white text-slate-700 border border-emerald-200 hover:bg-emerald-100/50'
                  }`}
                >
                  <span>ต.{sd.name}</span>
                  {count > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isSelected ? 'bg-amber-800 text-amber-100' : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Category Icons Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              หมวดหมู่ปัญหาที่รับแจ้ง (Categories)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              คลิกหมวดหมู่เพื่อดูเรื่องที่เกี่ยวข้อง หรือแจ้งปัญหาในหมวดนั้น
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {CATEGORIES.map((cat) => {
            const count = issues.filter((i) => i.category === cat.id).length;
            const isSelected = selectedCategoryTab === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategoryTab(isSelected ? 'all' : cat.id)}
                className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-2 group cursor-pointer ${
                  isSelected
                    ? 'border-emerald-700 bg-emerald-50 shadow-xs ring-2 ring-emerald-700/20'
                    : 'border-slate-200/80 bg-white hover:border-emerald-300 hover:shadow-xs'
                }`}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-2xs group-hover:scale-105 transition-transform"
                  style={{ backgroundColor: cat.color }}
                >
                  <CategoryIcon category={cat.id} size={18} />
                </div>
                <span className="text-xs font-bold text-slate-800 line-clamp-1">{cat.label}</span>
                <span className="text-[10px] text-slate-500 font-medium px-2 py-0.5 rounded-full bg-slate-100">
                  {count} เรื่อง
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Latest Issues Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                รายการปัญหาล่าสุดในพื้นที่ อ.ปราสาท
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              {selectedSubDistrictTab !== 'all' && `เฉพาะ ต.${selectedSubDistrictTab} • `}
              {selectedCategoryTab === 'all'
                ? 'เรื่องที่ประชาชนแจ้งเข้ามาล่าสุด'
                : `หมวดหมู่: ${CATEGORIES.find((c) => c.id === selectedCategoryTab)?.label}`}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('track')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 cursor-pointer"
          >
            <span>ดูรายการทั้งหมด ({issues.length})</span>
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Issues Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {latestIssues.length === 0 ? (
            <div className="col-span-full bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-3">
              <ElephantMascot size={48} className="mx-auto opacity-70" />
              <p className="text-sm font-semibold text-slate-600">
                ยังไม่มีรายการปัญหาในตัวกรองนี้
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategoryTab('all');
                  setSelectedSubDistrictTab('all');
                }}
                className="text-xs font-bold text-emerald-800 hover:underline cursor-pointer"
              >
                ล้างตัวกรองทั้งหมด
              </button>
            </div>
          ) : (
            latestIssues.map((issue) => {
              const catMeta = CATEGORIES.find((c) => c.id === issue.category) || CATEGORIES[0];
              return (
                <div
                  key={issue.id}
                  onClick={() => onSelectIssue(issue)}
                  className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer flex flex-col group"
                >
                  {/* Image */}
                  <div className="relative h-44 bg-slate-100 overflow-hidden">
                    <img
                      src={issue.imageUrl}
                      alt={issue.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-white/95 text-slate-800 shadow-xs backdrop-blur-xs border border-slate-200">
                        {issue.ticketCode}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <StatusBadge status={issue.status} size="sm" />
                    </div>
                    {issue.afterImageUrl && (
                      <div className="absolute bottom-2 right-2 bg-emerald-700 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                        <CheckCircle2 size={12} /> ผลงานเสร็จแล้ว
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: catMeta.color }}
                        />
                        <span className="text-[11px] font-semibold text-slate-500">
                          {catMeta.label}
                        </span>
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-emerald-800 transition-colors">
                        {issue.title}
                      </h3>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
                      <div className="flex items-start gap-1.5 line-clamp-1">
                        <MapPin size={13} className="text-emerald-700 shrink-0 mt-0.5" />
                        <span className="truncate">{issue.locationName}</span>
                      </div>

                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">
                          {formatRelativeThaiTime(issue.createdAt)}
                        </span>
                        <span className="text-emerald-800 font-semibold flex items-center group-hover:translate-x-0.5 transition-transform">
                          <span>ดูรายละเอียด</span>
                          <ChevronRight size={14} />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Trust & Service Process Flow with Surin Touch */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-10 border border-emerald-800 shadow-sm relative overflow-hidden">
          {/* Subtle silk pattern */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(#FDE68A 1px, transparent 1px), radial-gradient(#FDE68A 1px, transparent 1px)',
              backgroundSize: '24px 24px',
              backgroundPosition: '0 0, 12px 12px',
            }}
          />

          <div className="relative z-10">
            <div className="text-center max-w-xl mx-auto mb-8 space-y-1">
              <span className="text-xs font-semibold text-amber-300">
                ขั้นตอนการทำงาน • Prasat Community Care
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                4 ขั้นตอนง่าย ๆ ร่วมดูแลบ้านของเรา
              </h2>
              <p className="text-xs sm:text-sm text-emerald-200/80">
                ตั้งแต่ชาวบ้านแจ้งเรื่อง จนถึงฝ่ายช่างประจำตำบลลงพื้นที่ซ่อมแซมเสร็จสิ้น
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {[
                {
                  step: '01',
                  title: 'ประชาชนแจ้งเรื่อง',
                  desc: 'ถ่ายภาพ ระบุตำบล หมู่บ้าน และจุดสังเกต ผ่านมือถือโดยไม่ต้องเดินทางมาที่ว่าการ',
                  icon: <PlusCircle className="text-amber-400" size={24} />,
                },
                {
                  step: '02',
                  title: 'รับเรื่อง & ประสานตำบล',
                  desc: 'ศูนย์บริการตรวจสอบเรื่องและส่งต่องานไปยังเทศบาลตำบลหรือ อบต. ในพื้นที่เกิดเหตุ',
                  icon: <Clock className="text-emerald-300" size={24} />,
                },
                {
                  step: '03',
                  title: 'ทีมช่างลงพื้นที่',
                  desc: 'ฝ่ายช่างนำเครื่องจักรเข้าแก้ไข พร้อมอัปเดตความคืบหน้าให้ผู้แจ้งทราบในระบบ',
                  icon: <Sparkles className="text-amber-300" size={24} />,
                },
                {
                  step: '04',
                  title: 'ส่งมอบผลงาน',
                  desc: 'แนบภาพถ่ายหลังแก้ไขเสร็จ ประชาชนตรวจสอบความเรียบร้อยและให้คะแนนความพึงพอใจ',
                  icon: <CheckCircle2 className="text-emerald-400" size={24} />,
                },
              ].map((st, i) => (
                <div key={i} className="bg-emerald-950/70 backdrop-blur-xs p-5 rounded-2xl border border-emerald-700/60 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-900/80 flex items-center justify-center border border-emerald-700">
                      {st.icon}
                    </div>
                    <span className="text-xl font-mono font-extrabold text-emerald-400/40">{st.step}</span>
                  </div>
                  <h3 className="text-sm font-bold text-amber-200 mb-1">{st.title}</h3>
                  <p className="text-xs text-emerald-100/70 leading-relaxed">{st.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
