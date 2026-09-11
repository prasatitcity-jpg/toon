import React from 'react';
import {
  Bell,
  CheckCircle2,
  Clock,
  ArrowRight,
  MapPin,
  User,
  X,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { TicketNotification, Issue } from '../types';
import { STATUS_LABEL_MAP, STATUS_COLOR_MAP } from '../utils/notification';
import { formatThaiDate } from '../utils/storage';
import { PrasatIcon } from './SurinMotifs';

interface TicketStatusModalProps {
  notification: TicketNotification | null;
  isOpen: boolean;
  onClose: () => void;
  onViewFullIssue?: (ticketCode: string) => void;
}

export const TicketStatusModal: React.FC<TicketStatusModalProps> = ({
  notification,
  isOpen,
  onClose,
  onViewFullIssue,
}) => {
  if (!isOpen || !notification) return null;

  const oldStatusStyle = STATUS_COLOR_MAP[notification.oldStatus] || {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
  };
  const newStatusStyle = STATUS_COLOR_MAP[notification.newStatus] || {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  };

  const isResolved = notification.newStatus === 'resolved' || notification.newStatus === 'closed';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Ribbon */}
        <div
          className={`px-6 py-5 border-b ${
            isResolved
              ? 'bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white'
              : 'bg-gradient-to-r from-indigo-800 via-slate-800 to-teal-900 text-white'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
                {isResolved ? (
                  <CheckCircle2 size={24} className="text-amber-300" />
                ) : (
                  <Bell size={22} className="text-white animate-bounce" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white">
                    {isResolved ? 'แก้ไขปัญหาเสร็จสิ้น 🎉' : 'อัปเดตสถานะ Ticket'}
                  </span>
                  <span className="text-xs text-white/80 font-mono font-bold">
                    {notification.ticketCode}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1 leading-snug">
                  สถานะคำร้องของคุณมีการเปลี่ยนแปลง
                </h3>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Status Progression Visualizer */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <p className="text-xs font-semibold text-slate-500 mb-2">
              การเปลี่ยนแปลงสถานะการดำเนินงาน
            </p>
            <div className="flex items-center justify-between gap-3">
              {/* Old Status */}
              <div
                className={`flex-1 p-2.5 rounded-xl border text-center ${oldStatusStyle.bg} ${oldStatusStyle.border}`}
              >
                <span className="text-[10px] font-medium text-slate-500 block mb-0.5">
                  สถานะเดิม
                </span>
                <span className={`text-xs font-bold ${oldStatusStyle.text}`}>
                  {STATUS_LABEL_MAP[notification.oldStatus]}
                </span>
              </div>

              {/* Arrow Indicator */}
              <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 shrink-0 shadow-2xs">
                <ArrowRight size={16} className="text-teal-600" />
              </div>

              {/* New Status */}
              <div
                className={`flex-1 p-2.5 rounded-xl border text-center shadow-xs ${newStatusStyle.bg} ${newStatusStyle.border} ring-2 ring-emerald-500/20`}
              >
                <span className="text-[10px] font-bold text-emerald-700 block mb-0.5">
                  สถานะใหม่ล่าสุด ✨
                </span>
                <span className={`text-xs font-extrabold ${newStatusStyle.text}`}>
                  {STATUS_LABEL_MAP[notification.newStatus]}
                </span>
              </div>
            </div>
          </div>

          {/* Issue Summary */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-900 leading-snug">
              {notification.issueTitle}
            </h4>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <MapPin size={13} className="text-teal-600" />
                <span>
                  ต.{notification.subDistrict || 'กังแอน'} อ.ปราสาท จ.สุรินทร์
                  {notification.village && ` (${notification.village})`}
                </span>
              </span>
              <span className="flex items-center gap-1">
                <Clock size={13} className="text-slate-400" />
                <span>{formatThaiDate(notification.updatedAt)}</span>
              </span>
            </div>
          </div>

          {/* Officer Note / Feedback */}
          {notification.officerNotes && (
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3.5 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                <ShieldCheck size={15} className="text-emerald-700" />
                <span>บันทึกชี้แจงจากเจ้าหน้าที่ผู้รับผิดชอบ:</span>
              </div>
              <p className="text-xs text-emerald-950 leading-relaxed pl-5">
                "{notification.officerNotes}"
              </p>
              {notification.officerName && (
                <p className="text-[11px] text-emerald-700 font-medium pl-5">
                  — {notification.officerName}
                </p>
              )}
            </div>
          )}

          {/* Real Photo After Action (if available) */}
          {notification.afterImageUrl ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">ภาพหลังดำเนินการ (ภาพจริงจากพื้นที่)</span>
                <span className="text-[10px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  ยืนยันการแก้ไขแล้ว
                </span>
              </div>
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 aspect-video bg-slate-100">
                <img
                  src={notification.afterImageUrl}
                  alt="ภาพหลังดำเนินการ"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ) : isResolved ? (
            <div className="p-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center text-xs text-slate-500">
              <span>ยังไม่มีภาพหลังดำเนินการแนบมา แต่เจ้าหน้าที่ได้ทำการปิดงานเรียบร้อยแล้ว</span>
            </div>
          ) : null}

          {/* Local Surin Emblem Note */}
          <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-500">
            <div className="flex items-center gap-2">
              <PrasatIcon size={14} className="text-teal-700" />
              <span>ศูนย์บริการร่วม อ.ปราสาท จ.สุรินทร์</span>
            </div>
            <span className="text-slate-400 font-mono text-[10px]">
              อัปเดตแบบเรียลไทม์
            </span>
          </div>
        </div>

        {/* Action Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
          >
            รับทราบและปิด
          </button>

          {onViewFullIssue && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onViewFullIssue(notification.ticketCode);
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-800 to-teal-700 hover:from-emerald-900 hover:to-teal-800 rounded-xl shadow-md shadow-emerald-800/20 transition-all"
            >
              <ExternalLink size={14} />
              <span>ดูรายละเอียด Ticket ฉบับเต็ม</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
