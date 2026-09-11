import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  CheckCheck,
  Sparkles,
  ArrowRight,
  Clock,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Volume2,
} from 'lucide-react';
import { TicketNotification } from '../types';
import {
  STATUS_LABEL_MAP,
  STATUS_COLOR_MAP,
  getBrowserNotificationPermission,
  requestBrowserNotificationPermission,
  NotificationPermissionState,
} from '../utils/notification';
import { formatRelativeThaiTime } from '../utils/storage';

interface NotificationCenterProps {
  notifications: TicketNotification[];
  onSelectNotification: (notification: TicketNotification) => void;
  onMarkAllAsRead: () => void;
  onSimulateStatusChange: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onSelectNotification,
  onMarkAllAsRead,
  onSimulateStatusChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [permState, setPermState] = useState<NotificationPermissionState>(() =>
    getBrowserNotificationPermission()
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleRequestPush = async () => {
    const state = await requestBrowserNotificationPermission();
    setPermState(state);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        id="btn-notification-bell"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-600 hover:text-emerald-800 hover:bg-slate-100 transition-colors"
        title="การแจ้งเตือนสถานะ Ticket"
        aria-label="Notifications"
      >
        <Bell size={20} className={unreadCount > 0 ? 'text-amber-600' : ''} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center border-2 border-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                <Bell size={14} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">แจ้งเตือนสถานะ Ticket</h4>
                <p className="text-[10px] text-slate-500">
                  {unreadCount > 0 ? `ยังไม่อ่าน ${unreadCount} รายการ` : 'อ่านครบทั้งหมดแล้ว'}
                </p>
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={onMarkAllAsRead}
                className="text-[11px] text-teal-700 hover:text-teal-900 font-medium flex items-center gap-1 hover:underline"
              >
                <CheckCheck size={12} />
                <span>อ่านทั้งหมด</span>
              </button>
            )}
          </div>

          {/* Browser Push Permission Banner */}
          <div className="px-4 py-2.5 bg-emerald-50/70 border-b border-emerald-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-emerald-950">
              <Volume2 size={14} className="text-emerald-700 shrink-0" />
              <div className="leading-tight text-[11px]">
                {permState === 'granted' ? (
                  <span className="text-emerald-800 font-semibold flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    เปิดรับการแจ้งเตือน Push แล้ว
                  </span>
                ) : permState === 'denied' ? (
                  <span className="text-slate-500">เบราว์เซอร์ปิดกั้น Push Notification</span>
                ) : (
                  <span>รับแจ้งเตือนทันทีเมื่อสถานะเปลี่ยน</span>
                )}
              </div>
            </div>

            {permState !== 'granted' && permState !== 'unsupported' && (
              <button
                type="button"
                onClick={handleRequestPush}
                className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[10px] font-bold shadow-2xs transition-colors shrink-0"
              >
                เปิด Push
              </button>
            )}
          </div>

          {/* Quick Demo Trigger for Tester/User */}
          <div className="px-4 py-2 bg-amber-50/70 border-b border-amber-200/60 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] text-amber-900 font-medium">
              <Sparkles size={13} className="text-amber-600" />
              <span>ทดสอบระบบแจ้งเตือน</span>
            </div>
            <button
              type="button"
              onClick={() => {
                onSimulateStatusChange();
              }}
              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold rounded-lg shadow-2xs transition-all active:scale-95 flex items-center gap-1"
            >
              <span>จำลองสถานะเปลี่ยน</span>
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                <Bell size={28} className="mx-auto mb-2 opacity-30" />
                <p>ยังไม่มีการแจ้งเตือนสถานะ Ticket ในขณะนี้</p>
              </div>
            ) : (
              notifications.map((n) => {
                const oldStyle = STATUS_COLOR_MAP[n.oldStatus] || {
                  bg: 'bg-slate-50',
                  text: 'text-slate-600',
                  border: 'border-slate-200',
                };
                const newStyle = STATUS_COLOR_MAP[n.newStatus] || {
                  bg: 'bg-emerald-50',
                  text: 'text-emerald-700',
                  border: 'border-emerald-200',
                };
                return (
                  <div
                    key={n.id}
                    onClick={() => {
                      onSelectNotification(n);
                      setIsOpen(false);
                    }}
                    className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors flex items-start gap-3 ${
                      !n.isRead ? 'bg-teal-50/30' : ''
                    }`}
                  >
                    {/* Status badge pill */}
                    <div className="mt-0.5 shrink-0">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                        {n.newStatus === 'resolved' ? (
                          <CheckCircle2 size={16} className="text-emerald-700" />
                        ) : (
                          <ShieldCheck size={16} className="text-teal-700" />
                        )}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[11px] font-mono font-bold text-slate-700">
                          {n.ticketCode}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock size={10} />
                          {formatRelativeThaiTime(n.updatedAt)}
                        </span>
                      </div>

                      {/* Transition badges */}
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span
                          className={`text-[9px] font-medium px-1.5 py-0.5 rounded-md border ${oldStyle.bg} ${oldStyle.text} ${oldStyle.border}`}
                        >
                          {STATUS_LABEL_MAP[n.oldStatus]}
                        </span>
                        <ArrowRight size={10} className="text-slate-400" />
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${newStyle.bg} ${newStyle.text} ${newStyle.border}`}
                        >
                          {STATUS_LABEL_MAP[n.newStatus]}
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-slate-800 line-clamp-1">
                        {n.issueTitle}
                      </p>

                      {n.officerNotes && (
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          จนท.: {n.officerNotes}
                        </p>
                      )}
                    </div>

                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-teal-600 shrink-0 mt-2" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-500">
            <span>คลิกรายการเพื่อดูรายละเอียดและหลักฐานภาพถ่าย</span>
          </div>
        </div>
      )}
    </div>
  );
};
