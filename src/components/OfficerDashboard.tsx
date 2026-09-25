import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Clock,
  Wrench,
  CheckCircle2,
  Archive,
  Search,
  Filter,
  Eye,
  Edit3,
  Calendar,
  Building,
  UserCheck,
  ChevronDown,
  Layers,
  ArrowUpDown,
  Download,
  MapPin,
  Users,
  Camera,
  Image as ImageIcon,
} from 'lucide-react';
import { CategoryType, Issue, IssueStatus, User } from '../types';
import { CATEGORIES, STATUSES, DEPARTMENTS } from '../data/categories';
import { PRASAT_SUB_DISTRICTS } from '../data/prasatLocations';
import { StatusBadge } from './StatusBadge';
import { CategoryIcon } from './CategoryIcon';
import { formatThaiDate } from '../utils/storage';
import { ElephantMascot, PrasatIcon, SurinCommunityBadge } from './SurinMotifs';
import { AdminImageEditModal } from './AdminImageEditModal';

interface OfficerDashboardProps {
  issues: Issue[];
  currentUser: User;
  onSelectIssue: (issue: Issue) => void;
  onQuickUpdateStatus: (issueId: string, newStatus: IssueStatus) => void;
  onUpdateIssue?: (issue: Issue) => Promise<void> | void;
  onOpenOnlineMembers?: () => void;
  onNavigateToCitizenView?: () => void;
}

export const OfficerDashboard: React.FC<OfficerDashboardProps> = ({
  issues,
  currentUser,
  onSelectIssue,
  onQuickUpdateStatus,
  onUpdateIssue,
  onOpenOnlineMembers,
  onNavigateToCitizenView,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [photoEditingIssue, setPhotoEditingIssue] = useState<Issue | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<CategoryType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<IssueStatus | 'all'>('all');
  const [subDistrictFilter, setSubDistrictFilter] = useState<string>('all');
  const [villageFilter, setVillageFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string | 'all'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'urgency'>('newest');

  // Available villages depending on sub-district selection
  const availableVillages = useMemo(() => {
    if (subDistrictFilter === 'all') {
      const all: { moo: number; name: string }[] = [];
      PRASAT_SUB_DISTRICTS.forEach((sd) => {
        sd.villages.forEach((v) => {
          if (!all.some((existing) => existing.name === v.name)) {
            all.push(v);
          }
        });
      });
      return all;
    }
    const found = PRASAT_SUB_DISTRICTS.find((sd) => sd.name === subDistrictFilter);
    return found ? found.villages : [];
  }, [subDistrictFilter]);

  // Counts for the KPI dashboard
  const totalCount = issues.length;
  const pendingCount = issues.filter((i) => i.status === 'pending').length;
  const inProgressCount = issues.filter((i) => i.status === 'in_progress' || i.status === 'acknowledged').length;
  const resolvedCount = issues.filter((i) => i.status === 'resolved' || i.status === 'closed').length;

  // Filtered and sorted issues
  const filteredIssues = useMemo(() => {
    return issues
      .filter((item) => {
        if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
        if (statusFilter !== 'all' && item.status !== statusFilter) return false;
        if (subDistrictFilter !== 'all' && !item.locationName.includes(subDistrictFilter)) return false;
        if (villageFilter !== 'all' && !item.locationName.includes(villageFilter)) return false;
        if (departmentFilter !== 'all' && item.assignedDepartment !== departmentFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            item.title.toLowerCase().includes(q) ||
            item.ticketCode.toLowerCase().includes(q) ||
            item.locationName.toLowerCase().includes(q) ||
            item.reporterName.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (sortOrder === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortOrder === 'oldest') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (sortOrder === 'urgency') {
          const rank = { urgent: 4, high: 3, medium: 2, low: 1 };
          return rank[b.urgency] - rank[a.urgency];
        }
        return 0;
      });
  }, [issues, categoryFilter, statusFilter, subDistrictFilter, villageFilter, departmentFilter, searchQuery, sortOrder]);

  const handleExportCSV = () => {
    const headers = ['TicketCode', 'Title', 'Category', 'Status', 'Urgency', 'Location', 'Reporter', 'CreatedAt'];
    const rows = filteredIssues.map((i) => [
      i.ticketCode,
      `"${i.title.replace(/"/g, '""')}"`,
      i.category,
      i.status,
      i.urgency,
      `"${i.locationName.replace(/"/g, '""')}"`,
      `"${i.reporterName}"`,
      i.createdAt,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `community-care-report-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Officer Header with Surin Local Identity */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-emerald-900/10 shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
              <UserCheck size={13} /> ศูนย์รับเรื่องและสั่งการ อ.ปราสาท
            </span>
            <span className="text-xs text-slate-400">• สุรินทร์ 18 ตำบล 241 หมู่บ้าน</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 flex items-center gap-2">
            <span>โต๊ะปฏิบัติการและจัดการเรื่องร้องทุกข์</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            ตรวจรับเรื่อง ส่งต่องานเทศบาลและ อบต. ในพื้นที่ อ.ปราสาท มอบหมายฝ่ายช่าง และอัปเดตสถานะพร้อมภาพถ่ายผลงาน
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {onNavigateToCitizenView && (
            <button
              id="btn-officer-view-citizen"
              type="button"
              onClick={onNavigateToCitizenView}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
              title="สลับไปดูหน้าเว็บทั่วไปของประชาชน (หน้าหลัก / แจ้งเรื่อง / ติดตามปัญหา)"
            >
              <Eye size={15} />
              <span>ดูหน้าเว็บประชาชน</span>
            </button>
          )}

          {onOpenOnlineMembers && (
            <button
              type="button"
              onClick={onOpenOnlineMembers}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-sky-50 border border-sky-200 hover:bg-sky-100 text-sky-900 rounded-xl transition-colors shadow-2xs cursor-pointer"
            >
              <Users size={15} className="text-sky-700" />
              <span>ดูสมาชิกออนไลน์</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </button>
          )}

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-900 rounded-xl transition-colors shadow-2xs cursor-pointer"
          >
            <Download size={15} className="text-emerald-700" />
            <span>ส่งออกรายงาน (.CSV)</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total */}
        <div
          onClick={() => setStatusFilter('all')}
          className={`bg-white p-5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            statusFilter === 'all'
              ? 'border-slate-800 ring-2 ring-slate-800/10'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">ปัญหาทั้งหมด</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
              <Layers size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900">{totalCount}</div>
          <p className="text-[11px] text-slate-400 mt-1">รวมทุกประเภทในเขตพื้นที่</p>
        </div>

        {/* Pending */}
        <div
          onClick={() => setStatusFilter('pending')}
          className={`bg-white p-5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            statusFilter === 'pending'
              ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/20'
              : 'border-slate-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between text-amber-700 mb-2">
            <span className="text-xs font-semibold">รอการตรวจสอบ</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
              <Clock size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-amber-700">{pendingCount}</div>
          <p className="text-[11px] text-amber-600 font-medium mt-1">ต้องตรวจเช็กและมอบหมายด่วน</p>
        </div>

        {/* In Progress */}
        <div
          onClick={() => setStatusFilter('in_progress')}
          className={`bg-white p-5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            statusFilter === 'in_progress'
              ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/20'
              : 'border-slate-200 hover:border-indigo-300'
          }`}
        >
          <div className="flex items-center justify-between text-indigo-700 mb-2">
            <span className="text-xs font-semibold">กำลังดำเนินการ</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700">
              <Wrench size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-indigo-700">{inProgressCount}</div>
          <p className="text-[11px] text-indigo-600 mt-1">ทีมช่าง/ฝ่ายกำลังลงพื้นที่</p>
        </div>

        {/* Resolved */}
        <div
          onClick={() => setStatusFilter('resolved')}
          className={`bg-white p-5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            statusFilter === 'resolved'
              ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20'
              : 'border-slate-200 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between text-emerald-700 mb-2">
            <span className="text-xs font-semibold">แก้ไขแล้วเสร็จ</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-700">{resolvedCount}</div>
          <p className="text-[11px] text-emerald-600 mt-1">
            {totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0}% ของปัญหาทั้งหมด
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="lg:col-span-4 relative">
            <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อเรื่อง, รหัส, สถานที่, ผู้แจ้ง..."
              className="w-full text-xs sm:text-sm pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-emerald-600"
            />
          </div>

          {/* Sub-district Filter */}
          <div className="lg:col-span-2">
            <select
              value={subDistrictFilter}
              onChange={(e) => {
                setSubDistrictFilter(e.target.value);
                setVillageFilter('all');
              }}
              className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-emerald-600 font-medium cursor-pointer"
            >
              <option value="all">ทุกตำบล (18 ตำบล)</option>
              {PRASAT_SUB_DISTRICTS.map((sd) => (
                <option key={sd.id} value={sd.name}>
                  ต.{sd.name}
                </option>
              ))}
            </select>
          </div>

          {/* Village Filter (Requirement 4: กรองตามหมู่บ้าน) */}
          <div className="lg:col-span-2">
            <select
              value={villageFilter}
              onChange={(e) => setVillageFilter(e.target.value)}
              className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-emerald-600 font-medium cursor-pointer"
            >
              <option value="all">
                {subDistrictFilter === 'all' ? 'ทุกหมู่บ้าน (241 หมู่บ้าน)' : `ทุกหมู่บ้านใน ต.${subDistrictFilter}`}
              </option>
              {availableVillages.map((v, idx) => (
                <option key={`${v.name}-${idx}`} value={v.name}>
                  ม.{v.moo} {v.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="lg:col-span-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-emerald-600 font-medium cursor-pointer"
            >
              <option value="all">ทุกประเภท ({issues.length})</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label} ({issues.filter((i) => i.category === c.id).length})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="lg:col-span-1">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-emerald-600 font-medium cursor-pointer"
            >
              <option value="all">ทุกสถานะ</option>
              {STATUSES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Order */}
          <div className="lg:col-span-1">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-emerald-600 font-medium cursor-pointer"
            >
              <option value="newest">แจ้งล่าสุด</option>
              <option value="oldest">แจ้งก่อน</option>
              <option value="urgency">เร่งด่วน</option>
            </select>
          </div>
        </div>

        {/* Clear Filters Indicator */}
        {(categoryFilter !== 'all' || statusFilter !== 'all' || subDistrictFilter !== 'all' || villageFilter !== 'all' || searchQuery.trim()) && (
          <div className="flex items-center gap-2 pt-2 text-xs text-slate-500">
            <span>ผลการกรอง: พบ {filteredIssues.length} รายการ</span>
            <button
              type="button"
              onClick={() => {
                setCategoryFilter('all');
                setStatusFilter('all');
                setSubDistrictFilter('all');
                setVillageFilter('all');
                setSearchQuery('');
              }}
              className="text-emerald-700 hover:underline font-semibold cursor-pointer"
            >
              ล้างตัวกรองทั้งหมด
            </button>
          </div>
        )}
      </div>

      {/* Issues Table (Desktop) and Cards (Mobile) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">รหัส / วันที่แจ้ง</th>
                <th className="py-3.5 px-4">หัวข้อปัญหา & สถานที่</th>
                <th className="py-3.5 px-4">ประเภท</th>
                <th className="py-3.5 px-4">สถานะปัจจุบัน</th>
                <th className="py-3.5 px-4">ฝ่ายรับผิดชอบ</th>
                <th className="py-3.5 px-4 text-center">เปลี่ยนสถานะด่วน</th>
                <th className="py-3.5 px-4 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70">
              {filteredIssues.map((issue) => {
                const catMeta = CATEGORIES.find((c) => c.id === issue.category) || CATEGORIES[0];
                return (
                  <tr
                    key={issue.id}
                    className="hover:bg-teal-50/30 transition-colors group cursor-pointer"
                    onClick={() => onSelectIssue(issue)}
                  >
                    {/* Ticket & Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-teal-800 block">
                        {issue.ticketCode}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Calendar size={11} /> {formatThaiDate(issue.createdAt).split(' ')[0]}
                      </span>
                    </td>

                    {/* Title & Location */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-bold text-slate-900 group-hover:text-teal-700 transition-colors line-clamp-1">
                        {issue.title}
                      </div>
                      <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        📍 {issue.locationName}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-5 h-5 rounded-md flex items-center justify-center text-white"
                          style={{ backgroundColor: catMeta.color }}
                        >
                          <CategoryIcon category={issue.category} size={11} />
                        </div>
                        <span className="font-medium text-slate-800">{catMeta.label}</span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={issue.status} size="sm" />
                    </td>

                    {/* Department */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                      <span className="truncate block max-w-[140px] text-[11px]">
                        {issue.assignedDepartment || 'รอมอบหมาย'}
                      </span>
                    </td>

                    {/* Quick status dropdown */}
                    <td
                      className="py-3.5 px-4 whitespace-nowrap text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <select
                        value={issue.status}
                        onChange={(e) => onQuickUpdateStatus(issue.id, e.target.value as IssueStatus)}
                        className="text-[11px] font-semibold py-1 px-2 rounded-lg border border-slate-300 bg-white hover:border-teal-500 focus:outline-teal-500 cursor-pointer"
                      >
                        {STATUSES.map((st) => (
                          <option key={st.id} value={st.id}>
                            {st.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPhotoEditingIssue(issue);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200 transition-colors cursor-pointer"
                          title="แก้ไขรูปภาพ / เปลี่ยนรูปภาพ / ใส่รูปภาพผลงาน"
                        >
                          <Camera size={13} />
                          <span>แก้ไขรูป</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectIssue(issue);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                        >
                          <Eye size={13} />
                          <span>เปิดตรวจ</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredIssues.map((issue) => {
            const catMeta = CATEGORIES.find((c) => c.id === issue.category) || CATEGORIES[0];
            return (
              <div
                key={issue.id}
                onClick={() => onSelectIssue(issue)}
                className="p-4 space-y-2.5 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-teal-800">
                    {issue.ticketCode}
                  </span>
                  <StatusBadge status={issue.status} size="sm" />
                </div>

                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                  {issue.title}
                </h3>

                <div className="text-xs text-slate-500 flex items-center justify-between">
                  <span>📍 {issue.locationName}</span>
                  <span className="text-[11px] text-slate-400">{catMeta.label}</span>
                </div>

                {/* Thumbnails row in mobile */}
                <div className="flex items-center gap-2 pt-1">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1 font-medium">
                      <Camera size={11} className="text-amber-600" />
                      <span>{issue.imageUrl ? 'มีภาพแจ้ง' : 'ไม่มีภาพ'}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-medium">
                      <CheckCircle2 size={11} className="text-emerald-600" />
                      <span>{issue.afterImageUrl ? 'มีผลงานซ่อม' : 'รอผลงาน'}</span>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPhotoEditingIssue(issue);
                    }}
                    className="ml-auto inline-flex items-center gap-1 px-2 py-1 text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 rounded-lg cursor-pointer"
                  >
                    <Camera size={11} />
                    <span>แก้ไขรูปภาพ</span>
                  </button>
                </div>

                <div
                  className="flex items-center justify-between pt-1 border-t border-slate-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-[11px] text-slate-400">เปลี่ยนสถานะ:</span>
                  <select
                    value={issue.status}
                    onChange={(e) => onQuickUpdateStatus(issue.id, e.target.value as IssueStatus)}
                    className="text-xs font-semibold py-1 px-2 rounded-lg border border-slate-300 bg-white"
                  >
                    {STATUSES.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}
        </div>

        {filteredIssues.length === 0 && (
          <div className="p-12 text-center text-slate-500">
            <p className="text-sm font-medium">ไม่พบรายการปัญหาตามเงื่อนไขที่เลือก</p>
          </div>
        )}
      </div>

      {/* Admin Image Edit Modal */}
      {photoEditingIssue && (
        <AdminImageEditModal
          issue={photoEditingIssue}
          currentUser={currentUser}
          onClose={() => setPhotoEditingIssue(null)}
          onSave={async (updated) => {
            if (onUpdateIssue) {
              await onUpdateIssue(updated);
            }
            setPhotoEditingIssue(null);
          }}
        />
      )}
    </div>
  );
};
