import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  ChevronRight,
  PlusCircle,
  FileQuestion,
  UserCheck,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowUpDown,
  Image as ImageIcon,
  Camera,
  Bell,
} from 'lucide-react';
import { CategoryType, Issue, IssueStatus, User } from '../types';
import { CATEGORIES, STATUSES } from '../data/categories';
import { PRASAT_SUB_DISTRICTS } from '../data/prasatLocations';
import { StatusBadge } from './StatusBadge';
import { CategoryIcon } from './CategoryIcon';
import { formatRelativeThaiTime } from '../utils/storage';
import { ElephantMascot, PrasatIcon, SurinCommunityBadge } from './SurinMotifs';

interface CitizenTrackViewProps {
  issues: Issue[];
  currentUser: User;
  onSelectIssue: (issue: Issue) => void;
  onNavigateReport: () => void;
  onTestNotification?: () => void;
}

export const CitizenTrackView: React.FC<CitizenTrackViewProps> = ({
  issues,
  currentUser,
  onSelectIssue,
  onNavigateReport,
  onTestNotification,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<IssueStatus | 'all'>('all');
  const [selectedSubDistrict, setSelectedSubDistrict] = useState<string>('all');
  const [filterScope, setFilterScope] = useState<'my_reports' | 'all'>('my_reports');

  // Filter issues
  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      // Filter scope: my reports vs all community issues
      if (filterScope === 'my_reports') {
        const isMine =
          issue.reporterName === currentUser.name ||
          issue.reporterPhone === currentUser.phone ||
          (issue.reporterEmail && issue.reporterEmail === currentUser.email);
        if (!isMine) return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && issue.category !== selectedCategory) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'all' && issue.status !== selectedStatus) {
        return false;
      }

      // Sub-district filter
      if (selectedSubDistrict !== 'all' && !issue.locationName.includes(selectedSubDistrict)) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchTitle = issue.title.toLowerCase().includes(query);
        const matchCode = issue.ticketCode.toLowerCase().includes(query);
        const matchLoc = issue.locationName.toLowerCase().includes(query);
        const matchDesc = issue.description.toLowerCase().includes(query);
        return matchTitle || matchCode || matchLoc || matchDesc;
      }

      return true;
    });
  }, [issues, filterScope, currentUser, selectedCategory, selectedStatus, selectedSubDistrict, searchQuery]);

  const myReportsCount = issues.filter(
    (i) =>
      i.reporterName === currentUser.name ||
      i.reporterPhone === currentUser.phone ||
      (i.reporterEmail && i.reporterEmail === currentUser.email)
  ).length;

  return (
    <div className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header & Quick Lookup Banner - Surin Local Modern */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden border border-emerald-800">
        {/* Subtle silk geometric pattern */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(#FDE68A 1px, transparent 1px), radial-gradient(#FDE68A 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            backgroundPosition: '0 0, 12px 12px',
          }}
        />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="max-w-2xl space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <SurinCommunityBadge variant="dark" />
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/15 text-emerald-200 backdrop-blur-xs inline-flex items-center gap-1.5 border border-white/10">
                <PrasatIcon size={13} className="text-amber-300" />
                <span>ศูนย์ติดตามสถานะคำร้อง</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold">
              ติดตามสถานะและประวัติการแจ้งปัญหา
            </h1>
            <p className="text-emerald-100/80 text-xs sm:text-sm leading-relaxed">
              ค้นหาด้วยรหัส Ticket (เช่น CC-2026-001) หรือกรองดูความคืบหน้าของเรื่องที่แจ้งไว้ในอำเภอปราสาทแบบเรียลไทม์
            </p>

            {/* Search Bar inside Hero */}
            <div className="pt-2">
              <div className="flex items-center bg-white rounded-2xl p-1.5 shadow-lg max-w-lg border border-emerald-300/30">
                <div className="pl-3 text-slate-400">
                  <Search size={18} />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหารหัส Ticket, ตำบล, หมู่บ้าน หรือชื่อเรื่อง..."
                  className="w-full text-xs sm:text-sm px-3 py-2 text-slate-800 focus:outline-none placeholder:text-slate-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-xs text-slate-400 hover:text-slate-600 px-2.5 font-medium cursor-pointer"
                  >
                    ล้าง
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="hidden lg:flex flex-col items-center justify-center p-4 rounded-2xl bg-emerald-900/60 border border-emerald-700/50 backdrop-blur-xs text-center shrink-0">
            <ElephantMascot size={54} className="mb-1" />
            <span className="text-xs font-bold text-amber-300">ช้างน้อยตรวจสอบให้</span>
            <span className="text-[11px] text-emerald-200">โปร่งใส ตรวจสอบได้ทุกขั้นตอน</span>
          </div>
        </div>
      </div>

      {/* Scope Toggles & Filters */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        {/* Scope Tabs: My Reports vs All Community Reports */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilterScope('my_reports')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                filterScope === 'my_reports'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <UserCheck size={16} />
              <span>เรื่องที่ฉันแจ้งไว้</span>
              <span
                className={`px-2 py-0.2 rounded-full text-xs ${
                  filterScope === 'my_reports' ? 'bg-emerald-950 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {myReportsCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilterScope('all')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                filterScope === 'all'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>ปัญหาทั้งหมดใน อ.ปราสาท</span>
              <span
                className={`px-2 py-0.2 rounded-full text-xs ${
                  filterScope === 'all' ? 'bg-emerald-950 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {issues.length}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {onTestNotification && (
              <button
                type="button"
                onClick={onTestNotification}
                className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl transition-colors border border-emerald-200 cursor-pointer"
                title="ทดสอบระบบจำลองแจ้งเตือนเมื่อสถานะเปลี่ยน"
              >
                <Bell size={14} className="text-emerald-700" />
                <span>ทดสอบการแจ้งเตือน</span>
              </button>
            )}

            <button
              type="button"
              onClick={onNavigateReport}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-amber-50 text-amber-900 hover:bg-amber-100 rounded-xl transition-colors border border-amber-200 cursor-pointer"
            >
              <PlusCircle size={15} className="text-amber-700" />
              <span>แจ้งปัญหาเพิ่ม</span>
            </button>
          </div>
        </div>

        {/* Real-time Push & Modal Notification Alert Bar */}
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-teal-50/90 via-emerald-50/80 to-slate-50 rounded-xl border border-teal-200/80 text-xs text-teal-950">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Bell size={15} />
            </div>
            <div>
              <p className="font-bold text-teal-900">
                ระบบแจ้งเตือนความคืบหน้าอัตโนมัติ (Push Notification & Alert Modal)
              </p>
              <p className="text-[11px] text-teal-800/80">
                เมื่อเจ้าหน้าที่ฝ่ายปฏิบัติการ อ.ปราสาท ปรับเปลี่ยนสถานะ Ticket (เช่น 'กำลังดำเนินการ' ➔ 'แก้ไขเสร็จสิ้น') ระบบจะส่งเสียงแจ้งเตือนและเปิดหน้าต่างสรุปผลพร้อมภาพถ่ายจริงทันที
              </p>
            </div>
          </div>
        </div>

        {/* Filters Row: Status + Category + Sub-district */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Status filters */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full scrollbar-thin">
            <span className="text-xs font-semibold text-slate-400 mr-1 shrink-0">สถานะ:</span>
            <button
              type="button"
              onClick={() => setSelectedStatus('all')}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedStatus === 'all'
                  ? 'bg-emerald-900 text-white font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ทั้งหมด
            </button>
            {STATUSES.map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setSelectedStatus(st.id)}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedStatus === st.id
                    ? `${st.badgeBg} font-bold border`
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Dropdowns for Sub-district and Category */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Sub-district Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-400">ตำบล:</span>
              <select
                value={selectedSubDistrict}
                onChange={(e) => setSelectedSubDistrict(e.target.value)}
                className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-emerald-600 font-medium cursor-pointer"
              >
                <option value="all">ทุกตำบล (18 ตำบล)</option>
                {PRASAT_SUB_DISTRICTS.map((sd) => (
                  <option key={sd.id} value={sd.name}>
                    ต.{sd.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-400">ประเภท:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-emerald-600 font-medium cursor-pointer"
              >
                <option value="all">ทุกประเภทปัญหา</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Issues Grid / List */}
      {filteredIssues.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs max-w-md mx-auto my-8">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileQuestion size={30} />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">ไม่พบรายการปัญหาตามเงื่อนไข</h3>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            {filterScope === 'my_reports'
              ? 'คุณยังไม่มีประวัติการแจ้งเรื่องที่ตรงกับตัวกรองนี้ สามารถกดแจ้งปัญหาใหม่ได้ทันที'
              : 'ลองปรับเปลี่ยนคำค้นหา หรือเลือกตัวกรองเป็น "ทั้งหมด" เพื่อดูรายการอื่นในอำเภอปราสาท'}
          </p>
          <button
            type="button"
            onClick={onNavigateReport}
            className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            เริ่มแจ้งปัญหาเรื่องแรกของคุณ
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredIssues.map((issue) => {
            const catMeta = CATEGORIES.find((c) => c.id === issue.category) || CATEGORIES[0];
            return (
              <div
                key={issue.id}
                onClick={() => onSelectIssue(issue)}
                className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer flex flex-col group"
              >
                {/* Image Thumbnail with Requirement 5 labels */}
                <div className="relative h-44 bg-slate-100 overflow-hidden">
                  {issue.imageUrl ? (
                    <img
                      src={issue.imageUrl}
                      alt={issue.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 p-4 text-center">
                      <ImageIcon size={28} className="text-slate-300 mb-1" />
                      <span className="text-xs font-semibold text-slate-500">ยังไม่มีภาพจากพื้นที่</span>
                      <span className="text-[10px] text-slate-400">ไม่มีรูปถ่ายแนบมา</span>
                    </div>
                  )}

                  <div className="absolute top-3 left-3">
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-white/95 text-slate-800 shadow-xs backdrop-blur-xs border border-slate-200">
                      {issue.ticketCode}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <StatusBadge status={issue.status} size="sm" />
                  </div>

                  <div className="absolute bottom-2 left-2 flex items-center gap-1.5 flex-wrap">
                    <span className="bg-slate-900/80 text-white text-[10px] px-2 py-0.5 rounded-md backdrop-blur-xs flex items-center gap-1 font-medium">
                      <Camera size={10} className="text-amber-400" /> ภาพที่ประชาชนแจ้ง
                    </span>
                    {issue.afterImageUrl && (
                      <span className="bg-emerald-700/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs shadow-xs flex items-center gap-1">
                        <CheckCircle size={10} /> ภาพหลังดำเนินการ
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
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

                    <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-emerald-800 transition-colors">
                      {issue.title}
                    </h3>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
                    <div className="flex items-start gap-1.5 line-clamp-1">
                      <MapPin size={13} className="text-emerald-700 shrink-0 mt-0.5" />
                      <span className="truncate">{issue.locationName}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock size={12} />
                        <span>{formatRelativeThaiTime(issue.createdAt)}</span>
                      </span>
                      <span className="text-emerald-800 font-semibold flex items-center group-hover:translate-x-0.5 transition-transform">
                        <span>ดูความคืบหน้า</span>
                        <ChevronRight size={14} />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
