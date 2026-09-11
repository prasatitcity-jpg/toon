import React, { useState } from 'react';
import { X, Users, ShieldCheck, UserCheck, Search, Info } from 'lucide-react';
import { INITIAL_MEMBERS, OnlineMember } from '../data/onlineMembers';
import { SurinElephantMotif } from './SurinMotifs';

interface OnlineMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserRole?: 'citizen' | 'officer' | 'admin';
}

export const OnlineMembersModal: React.FC<OnlineMembersModalProps> = ({
  isOpen,
  onClose,
  currentUserRole = 'citizen',
}) => {
  const [filter, setFilter] = useState<'all' | 'online' | 'officer' | 'citizen'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const onlineMembersCount = INITIAL_MEMBERS.filter((m) => m.status === 'online').length;
  const onlineCitizensCount = INITIAL_MEMBERS.filter((m) => m.status === 'online' && m.role === 'citizen').length;
  const onlineOfficersCount = INITIAL_MEMBERS.filter((m) => m.status === 'online' && m.role === 'officer').length;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-teal-900 to-emerald-900 text-white flex items-center justify-between relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 pointer-events-none">
            <SurinElephantMotif className="w-full h-full text-amber-200" />
          </div>
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 flex items-center justify-center text-amber-300">
              <Users size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">สมาชิกออนไลน์ในระบบ</h2>
              <p className="text-xs text-teal-200">
                Prasat Community Care • ชุมชนช่วยกันดูแลบ้านของเรา
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors relative z-10"
          >
            <X size={18} />
          </button>
        </div>

        {/* Aggregated Counts Box (As required: 12 สมาชิกออนไลน์, 10 ประชาชน, 2 เจ้าหน้าที่) */}
        <div className="p-6 bg-slate-50 border-b border-slate-200">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white p-3.5 rounded-2xl border border-emerald-200 shadow-2xs text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1 text-emerald-600 font-semibold text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>สมาชิกออนไลน์</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{onlineMembersCount} <span className="text-xs font-normal text-slate-500">คน</span></p>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-teal-200 shadow-2xs text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1 text-teal-700 font-semibold text-xs">
                <UserCheck size={14} />
                <span>ประชาชน</span>
              </div>
              <p className="text-2xl font-bold text-teal-800">{onlineCitizensCount} <span className="text-xs font-normal text-slate-500">คน</span></p>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-sky-200 shadow-2xs text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1 text-sky-700 font-semibold text-xs">
                <ShieldCheck size={14} />
                <span>เจ้าหน้าที่</span>
              </div>
              <p className="text-2xl font-bold text-sky-800">{onlineOfficersCount} <span className="text-xs font-normal text-slate-500">คน</span></p>
            </div>
          </div>

          {/* Privacy Notice as mandated: ไม่เปิดเผยข้อมูลส่วนตัวที่ไม่จำเป็นของสมาชิก */}
          <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500 bg-white/70 px-3 py-1.5 rounded-xl border border-slate-200/70">
            <Info size={13} className="text-slate-400 shrink-0" />
            <span>ระบบแสดงเฉพาะชื่อแสดงและตำบล เพื่อความปลอดภัยและความเป็นส่วนตัวของสมาชิก</span>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="px-6 py-3 border-b border-slate-100 flex flex-col sm:flex-row gap-2.5 items-center justify-between bg-white">
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto text-xs">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                filter === 'all' ? 'bg-teal-800 text-white font-semibold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ทั้งหมด ({INITIAL_MEMBERS.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('online')}
              className={`px-3 py-1.5 rounded-xl font-medium flex items-center gap-1 transition-all ${
                filter === 'online' ? 'bg-emerald-700 text-white font-semibold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>ออนไลน์ ({onlineMembersCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilter('officer')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                filter === 'officer' ? 'bg-sky-700 text-white font-semibold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              เจ้าหน้าที่
            </button>
            <button
              type="button"
              onClick={() => setFilter('citizen')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                filter === 'citizen' ? 'bg-teal-700 text-white font-semibold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ประชาชน
            </button>
          </div>

          <div className="relative w-full sm:w-48">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาชื่อ, ตำบล..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Member List */}
        <div className="p-6 overflow-y-auto divide-y divide-slate-100 space-y-1 max-h-[380px]">
          {filteredList.map((member) => {
            const isOnline = member.status === 'online';
            const isOfficer = member.role === 'officer';

            return (
              <div
                key={member.id}
                className="py-2.5 flex items-center justify-between hover:bg-slate-50/80 px-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  {/* Status Indicator Icon: 🟢 ออนไลน์ / ⚪ ออฟไลน์ */}
                  <div className="relative">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                        isOfficer
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-teal-100 text-teal-800'
                      }`}
                    >
                      {member.displayName.charAt(0)}
                    </div>
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                        isOnline ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                      title={isOnline ? '🟢 ออนไลน์' : '⚪ ออฟไลน์'}
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-900">{member.displayName}</p>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.2 rounded-full ${
                          isOfficer ? 'bg-sky-100 text-sky-800' : 'bg-teal-50 text-teal-700'
                        }`}
                      >
                        {member.roleLabel}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{member.subDistrict} • อ.ปราสาท</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {isOnline ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        🟢 ออนไลน์
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                        ⚪ ออฟไลน์
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{member.lastActive}</span>
                </div>
              </div>
            );
          })}

          {filteredList.length === 0 && (
            <div className="py-8 text-center text-slate-400 text-xs">
              ไม่พบสมาชิกตามเงื่อนไขที่เลือก
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
