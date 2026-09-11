import React, { useState } from 'react';
import {
  Phone,
  Search,
  ExternalLink,
  MapPin,
  Clock,
  ShieldAlert,
  Zap,
  Navigation,
  Building2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { AGENCIES_DATA, AgencyInfo } from '../data/agencies';
import { PrasatKhomArch, SurinElephantMotif } from './SurinMotifs';

interface HotlinesViewProps {
  onBackToHome?: () => void;
}

export const HotlinesView: React.FC<HotlinesViewProps> = ({ onBackToHome }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'emergency' | 'utility' | 'roads' | 'local'>('all');

  const categories = [
    { id: 'all', label: 'ทั้งหมด', icon: Building2, count: AGENCIES_DATA.length },
    {
      id: 'emergency',
      label: 'เหตุฉุกเฉิน (191, 1669, 1784)',
      icon: ShieldAlert,
      count: AGENCIES_DATA.filter((a) => a.category === 'emergency').length,
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    },
    {
      id: 'utility',
      label: 'สาธารณูปโภค (ไฟฟ้า / ประปา)',
      icon: Zap,
      count: AGENCIES_DATA.filter((a) => a.category === 'utility').length,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    },
    {
      id: 'roads',
      label: 'ถนนและการเดินทาง (ทางหลวง)',
      icon: Navigation,
      count: AGENCIES_DATA.filter((a) => a.category === 'roads').length,
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    {
      id: 'local',
      label: 'หน่วยงานในอำเภอปราสาท (18 ตำบล)',
      icon: Building2,
      count: AGENCIES_DATA.filter((a) => a.category === 'local').length,
      badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
    },
  ];

  const filteredAgencies = AGENCIES_DATA.filter((agency) => {
    const matchesCategory = selectedCategory === 'all' || agency.category === selectedCategory;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      agency.name.toLowerCase().includes(query) ||
      agency.responsibility.toLowerCase().includes(query) ||
      agency.phone.toLowerCase().includes(query) ||
      (agency.address && agency.address.toLowerCase().includes(query));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner with Surin Local Identity */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-900 via-teal-900 to-amber-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-amber-500/20">
        <div className="absolute -right-6 -bottom-6 w-48 h-48 opacity-10 pointer-events-none">
          <SurinElephantMotif className="w-full h-full text-amber-300" />
        </div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-200 border border-amber-300/30 text-xs font-semibold mb-3">
            <PrasatKhomArch className="w-3.5 h-3.5 text-amber-300" />
            <span>ศูนย์บริการข้อมูลสายด่วน & หน่วยงานประสานงาน อ.ปราสาท</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
            หน่วยงานและสายด่วนฉุกเฉิน
          </h1>
          <p className="text-emerald-100/90 text-sm sm:text-base mt-2 leading-relaxed">
            รวบรวมเบอร์โทรศัพท์สายด่วนที่ตรวจสอบแล้ว เพื่อความรวดเร็วในการประสานงานและช่วยเหลือพี่น้องชาวอำเภอปราสาท
            ทั้งเหตุฉุกเฉิน สาธารณูปโภค ทางหลวง และหน่วยงานท้องถิ่น 18 ตำบล
          </p>

          {/* Quick Notice */}
          <div className="mt-4 flex items-center gap-2 text-xs text-amber-200/90 bg-black/25 px-3.5 py-2 rounded-xl border border-white/10 w-fit">
            <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
            <span>หมายเลขโทรศัพท์ทุกเบอร์ผ่านการตรวจสอบข้อมูลทางการเรียบร้อยแล้ว</span>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200 space-y-4">
        {/* Search input */}
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อหน่วยงาน, สายด่วน, ประเภทงาน (เช่น ไฟดับ, ประปา, ตำรวจ, กังแอน)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 px-2 py-0.5 rounded-md bg-slate-200"
            >
              ล้างคำค้น
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl whitespace-nowrap font-medium transition-all ${
                  isSelected
                    ? 'bg-teal-700 text-white shadow-xs font-semibold ring-2 ring-teal-600/30'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Icon size={15} />
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Agencies Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAgencies.map((agency) => (
          <div
            key={agency.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
          >
            <div>
              {/* Category Badge & 24h tag */}
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${
                    agency.category === 'emergency'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : agency.category === 'utility'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : agency.category === 'roads'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-teal-50 text-teal-700 border-teal-200'
                  }`}
                >
                  {agency.categoryLabel}
                </span>

                {agency.is24Hours && (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    <Clock size={11} />
                    <span>24 ชั่วโมง</span>
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className="text-base font-bold text-slate-900 leading-snug mb-1.5">
                {agency.name}
              </h3>

              {/* Responsibility Description */}
              <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-3">
                {agency.responsibility}
              </p>

              {/* Address if available */}
              {agency.address && (
                <div className="flex items-start gap-1.5 text-[11px] text-slate-500 mb-2">
                  <MapPin size={13} className="shrink-0 text-slate-400 mt-0.5" />
                  <span className="line-clamp-2">{agency.address}</span>
                </div>
              )}

              {/* Notes if available */}
              {agency.notes && (
                <div className="flex items-start gap-1.5 text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 mb-2">
                  <AlertCircle size={13} className="shrink-0 text-amber-600 mt-0.5" />
                  <span>{agency.notes}</span>
                </div>
              )}
            </div>

            {/* Actions: Call button or Under Verification status */}
            <div className="pt-3 border-t border-slate-100 mt-2">
              {agency.hasVerifiedPhone && agency.phone ? (
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${agency.phone.replace(/[^0-9]/g, '')}`}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-xs transition-colors"
                  >
                    <Phone size={15} />
                    <span>โทร {agency.phoneDisplay || agency.phone}</span>
                  </a>

                  {agency.website && (
                    <a
                      href={agency.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="เข้าชมเว็บไซต์ทางการ"
                      className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-teal-700"
                    >
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <HelpCircle size={14} className="text-slate-400" />
                    <span>อยู่ระหว่างตรวจสอบข้อมูล</span>
                  </div>
                  <a
                    href="tel:044551297"
                    title="ประสานผ่านศูนย์ดำรงธรรม อ.ปราสาท"
                    className="text-[11px] font-bold text-teal-700 hover:underline"
                  >
                    โทรศูนย์ดำรงธรรม
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredAgencies.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <Search size={32} className="mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-700">ไม่พบหน่วยงานที่ตรงกับคำค้นหา "{searchQuery}"</p>
          <p className="text-xs text-slate-400 mt-1">
            ลองค้นหาด้วยคำอื่น เช่น "ตำรวจ", "ไฟดับ", "ทางหลวง", หรือ "ปราสาท"
          </p>
        </div>
      )}
    </div>
  );
};
