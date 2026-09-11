import { TicketNotification, IssueStatus } from '../types';

const STORAGE_KEY_NOTIFS = 'community_care_notifications_v1';

// Initial sample notification for demo
const INITIAL_NOTIFICATIONS: TicketNotification[] = [
  {
    id: 'notif-1',
    ticketId: 'issue-1',
    ticketCode: 'CC-2025-001',
    issueTitle: 'ท่อระบายน้ำอุดตัน น้ำท่วมขังช่วงฝนตก ตลาดสดเทศบาลกังแอน',
    oldStatus: 'in_progress',
    newStatus: 'resolved',
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    officerName: 'นายประสิทธิ์ สุขใจ (กองช่าง เทศบาลตำบลกังแอน)',
    officerNotes: 'เจ้าหน้าที่นำรถดูดสิ่งปฏิกูลและลอกท่อระบายน้ำบริเวณตลาดสดเรียบร้อยแล้ว น้ำระบายได้ปกติ',
    subDistrict: 'กังแอน',
    village: 'หมู่ 1 บ้านปะอาว',
    isRead: false,
    reporterName: 'สมใจ รักปราสาท',
    reporterPhone: '081-234-5678',
  },
  {
    id: 'notif-2',
    ticketId: 'issue-3',
    ticketCode: 'CC-2025-003',
    issueTitle: 'ไฟทางดับมืดตลอดแนวถนน ทางเข้าหมู่บ้านพลวง',
    oldStatus: 'pending',
    newStatus: 'in_progress',
    updatedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    officerName: 'นายวิชัย สุรินทร์ดี (การไฟฟ้าส่วนภูมิภาคสาขาปราสาท)',
    officerNotes: 'ทีมช่าง กฟภ. ลงพื้นที่ตรวจสอบหม้อแปลงและเตรียมเปลี่ยนหลอดไฟ LED ในสัปดาห์นี้',
    subDistrict: 'บ้านพลวง',
    village: 'หมู่ 2 บ้านพลวง',
    isRead: true,
    reporterName: 'สมใจ รักปราสาท',
    reporterPhone: '081-234-5678',
  },
];

export function getStoredNotifications(): TicketNotification[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_NOTIFS);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to parse notifications', e);
  }
  saveStoredNotifications(INITIAL_NOTIFICATIONS);
  return INITIAL_NOTIFICATIONS;
}

export function saveStoredNotifications(notifs: TicketNotification[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(notifs));
  } catch (e) {
    console.error('Failed to save notifications', e);
  }
}

/**
 * Web Audio API gentle melodic chime
 */
export function playNotificationSound(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Tone 1
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    gain1.gain.setValueAtTime(0.12, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.3);

    // Tone 2 (higher note)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5
    gain2.gain.setValueAtTime(0.15, ctx.currentTime + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.12);
    osc2.stop(ctx.currentTime + 0.5);
  } catch {
    // AudioContext blocked or not supported
  }
}

export type NotificationPermissionState = 'default' | 'granted' | 'denied' | 'unsupported';

export function getBrowserNotificationPermission(): NotificationPermissionState {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission as NotificationPermissionState;
}

export async function requestBrowserNotificationPermission(): Promise<NotificationPermissionState> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  try {
    const result = await Notification.requestPermission();
    return result as NotificationPermissionState;
  } catch (e) {
    console.error('Error requesting notification permission', e);
    return 'denied';
  }
}

export function sendBrowserPushNotification(
  title: string,
  body: string,
  ticketCode?: string
): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    try {
      const notif = new Notification(title, {
        body,
        icon: '/vite.svg',
        tag: ticketCode || 'community-care-alert',
      });

      notif.onclick = () => {
        window.focus();
        notif.close();
      };
      return true;
    } catch (e) {
      console.error('Failed to trigger browser notification', e);
      return false;
    }
  }
  return false;
}

export const STATUS_LABEL_MAP: Record<IssueStatus, string> = {
  pending: 'รอตรวจสอบ',
  acknowledged: 'รับเรื่องแล้ว',
  in_progress: 'กำลังดำเนินการ',
  resolved: 'แก้ไขเสร็จสิ้น',
  closed: 'ปิดเรื่องแล้ว',
};

export const STATUS_COLOR_MAP: Record<IssueStatus, { bg: string; text: string; border: string }> = {
  pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  acknowledged: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  in_progress: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  resolved: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  closed: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-300' },
};
