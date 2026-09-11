import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  PlusCircle,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Camera,
  Image as ImageIcon,
} from 'lucide-react';
import { Issue, IssueStatus, User } from '../types';
import { STATUSES, CATEGORIES } from '../data/categories';
import { StatusBadge } from './StatusBadge';
import { CategoryIcon } from './CategoryIcon';
import { formatThaiDate, formatRelativeThaiTime } from '../utils/storage';
import { ElephantMascot, PrasatIcon, SurinCommunityBadge } from './SurinMotifs';

interface MyHistoryViewProps {
  issues: Issue[];
  currentUser: User;
  onSelectIssue: (issue: Issue) => void;
  onNavigateReport: () => void;
}

export const MyHistoryView: React.FC<MyHistoryViewProps> = ({
  issues,
  currentUser,
  onSelectIssue,
  onNavigateReport,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<IssueStatus | 'all'>('all');

  // Strict user isolation: Only reports belonging to this user
  const myIssues = useMemo(() => {
    return issues.filter((issue) => {
      const matchPhone = issue.reporterPhone && currentUser.phone && issue.reporterPhone === currentUser.phone;
      const matchName = issue.reporterName && currentUser.name && (
        issue.reporterName.toLowerCase().trim() === currentUser.name.toLowerCase().trim() ||
        currentUser.name.includes(issue.reporterName) ||
        issue.reporterName.includes(currentUser.name.split(' ')[0])
      );
      const matchEmail = issue.reporterEmail && currentUser.email && issue.reporterEmail === currentUser.email;

      return matchPhone || matchName || matchEmail;
    });
  }, [issues, currentUser]);

  const filteredIssues = useMemo(() => {
    return myIssues.filter((issue) => {
      if (statusFilter !== 'all' && issue.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          issue.title.toLowerCase().includes(q) ||
          issue.ticketCode.toLowerCase().includes(q) ||
          issue.locationName.toLowerCase().includes(q) ||
          issue.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [myIssues, statusFilter, searchQuery]);

  // Statistics for this citizen
  const totalCount = myIssues.length;
  const pendingCount = myIssues.filter((i) => i.status === 'pending').length;
  const inProgressCount = myIssues.filter((i) => i.status === 'in_progress' || i.status === 'acknowledged').length;
  const resolvedCount = myIssues.filter((i) => i.status === 'resolved' || i.status === 'closed').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-emerald-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <SurinCommunityBadge variant="dark" />
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-emerald-200 backdrop-blur-xs inline-flex items-center gap-1.5 border border-white/10">
                <FileText size={14} className="text-amber-300" />
                <span>ประวัติการแจ้งปัญหาเฉพาะคุณ</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              ประวัติของฉัน
            </h1>
            <p className="text-emerald-100/85 text-xs sm:text-sm leading-relaxed">
              ติดตามสถานะคำร้องและความคืบหน้าของปัญหาที่คุณ ({currentUser.name}) ได้แจ้งไว้ในระบบ
              ข้อมูลนี้ได้รับการปกป้องความเป็นส่วนตัวและแสดงผลเฉพาะบัญชีของคุณเท่านั้น
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <button
              type="button"
              onClick={onNavigateReport}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-sm shadow-md transition-all cursor-pointer hover:scale-102"
            >
              <PlusCircle size={18} />
              <span>แจ้งปัญหาใหม่</span>
            </button>
          </div>
        </div>
      </div>

      {/* Citizen Personal Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500 mb-1">ปัญหาทั้งหมดที่ฉันแจ้ง</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-slate-900">{totalCount}</span>
            <span className="text-xs text-slate-500">เรื่อง</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-2xs">
          <p className="text-xs font-semibold text-amber-700 mb-1 flex items-center gap-1">
            <Clock size={14} />
            <span>รอดำเนินการ</span>
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-amber-900">{pendingCount}</span>
            <span className="text-xs text-slate-500">เรื่อง</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-blue-200 shadow-2xs">
          <p className="text-xs font-semibold text-blue-700 mb-1 flex items-center gap-1">
            <Sparkles size={14} />
            <span>กำลังดำเนินการ</span>
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-blue-900">{inProgressCount}</span>
            <span className="text-xs text-slate-500">เรื่อง</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-2xs">
          <p className="text-xs font-semibold text-emerald-700 mb-1 flex items-center gap-1">
            <CheckCircle2 size={14} />
            <span>แก้ไขเสร็จสิ้น</span>
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-emerald-900">{resolvedCount}</span>
            <span className="text-xs text-slate-500">เรื่อง</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-thin">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ทั้งหมด ({myIssues.length})
            </button>
            {STATUSES.map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setStatusFilter(st.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  statusFilter === st.id
                    ? 'bg-emerald-700 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st.label} ({myIssues.filter((i) => i.status === st.id).length})
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาเรื่องที่คุณแจ้ง..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Issue Cards */}
        {filteredIssues.length > 0 ? (
          <div className="space-y-3 pt-2">
            {filteredIssues.map((issue) => {
              const cat = CATEGORIES.find((c) => c.id === issue.category);

              return (
                <div
                  key={issue.id}
                  onClick={() => onSelectIssue(issue)}
                  className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 bg-white hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4 min-w-0">
                    {/* Category Icon */}
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-xs"
                      style={{ backgroundColor: cat?.color || '#059669' }}
                    >
                      <CategoryIcon category={issue.category} size={20} />
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono font-bold text-emerald-950 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                          {issue.ticketCode}
                        </span>
                        <StatusBadge status={issue.status} />
                        <span className="text-[11px] text-slate-400">
                          {formatRelativeThaiTime(issue.createdAt)}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 line-clamp-1 hover:text-emerald-800">
                        {issue.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin size={13} className="text-emerald-700 shrink-0" />
                          <span>{issue.locationName}</span>
                        </span>
                        {issue.imageUrl && (
                          <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px] font-medium border border-emerald-100">
                            <Camera size={12} />
                            <span>มีภาพที่ประชาชนแจ้ง</span>
                          </span>
                        )}
                        {issue.afterImageUrl && (
                          <span className="flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full text-[11px] font-medium border border-blue-100">
                            <CheckCircle2 size={12} />
                            <span>มีภาพหลังดำเนินการ</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end w-full sm:w-auto gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <button
                      type="button"
                      className="flex items-center gap-1 px-3.5 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors"
                    >
                      <span>ดูรายละเอียด</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 text-slate-400 space-y-3">
            <FileText size={48} className="mx-auto opacity-30 text-emerald-700" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-700">
                {myIssues.length === 0
                  ? 'คุณยังไม่มีประวัติการแจ้งปัญหาในระบบ'
                  : 'ไม่พบรายการปัญหาตามเงื่อนไขที่ค้นหา'}
              </p>
              <p className="text-xs text-slate-500">
                {myIssues.length === 0
                  ? 'หากพบปัญหา เช่น ไฟถนนดับ ถนนชำรุด หรือขยะตกค้าง สามารถแจ้งให้เจ้าหน้าที่ประสานงานได้ทันที'
                  : 'ลองเปลี่ยนคำค้นหาหรือตัวกรองสถานะ'}
              </p>
            </div>
            {myIssues.length === 0 && (
              <button
                type="button"
                onClick={onNavigateReport}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition-all"
              >
                <PlusCircle size={15} />
                <span>แจ้งปัญหาแรกของคุณเลย</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
