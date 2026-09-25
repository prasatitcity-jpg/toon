export type CategoryType =
  | 'road'
  | 'street_light'
  | 'garbage'
  | 'water_supply'
  | 'tree_blocking'
  | 'road_obstacle'
  | 'noise'
  | 'other';

export type IssueStatus =
  | 'pending'       // รอตรวจสอบ
  | 'acknowledged'  // รับเรื่องแล้ว
  | 'in_progress'   // กำลังดำเนินการ
  | 'resolved'      // แก้ไขแล้ว
  | 'closed';       // ปิดเรื่อง

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'urgent';

export interface TimelineEvent {
  id: string;
  status: IssueStatus;
  title: string;
  note?: string;
  timestamp: string;
  actor: string;
  actorRole: 'citizen' | 'officer' | 'system';
  photoUrl?: string;
}

export interface ContactLogEntry {
  id: string;
  timestamp: string;
  officerName: string;
  channel: 'phone' | 'line' | 'onsite' | 'other';
  notes: string;
}

export interface Issue {
  id: string;
  ticketCode: string;
  userId?: string;
  title: string;
  category: CategoryType;
  description: string;
  status: IssueStatus;
  urgency: UrgencyLevel;
  locationName: string;
  province?: string;
  district?: string;
  subDistrict?: string;
  village?: string;
  locationDetail?: string;
  latitude: number;
  longitude: number;
  reporterName: string;
  reporterPhone: string;
  reporterEmail?: string;
  imageUrl: string;
  afterImageUrl?: string;
  additionalImages?: string[];
  imageCaption?: string;
  afterImageCaption?: string;
  officerNotes?: string;
  assignedDepartment?: string;
  assignedOfficer?: string;
  contactLog?: ContactLogEntry[];
  createdAt: string;
  updatedAt: string;
  timeline: TimelineEvent[];
}

export type UserRole = 'citizen' | 'staff_pending' | 'staff' | 'super_admin';
export type UserStatus = 'active' | 'pending' | 'rejected' | 'suspended';

export interface User {
  id: string;
  name: string;
  username?: string;
  password?: string;
  email: string;
  phone: string;
  role: UserRole | 'officer' | 'admin'; // 'officer' normalized to 'staff', 'admin' to 'super_admin'
  subDistrict?: string;
  village?: string;
  address?: string;
  department?: string;
  position?: string;
  inviteCode?: string;
  avatar: string;
  isOnline?: boolean;
  rememberMe?: boolean;
  status?: UserStatus;
  lastSeen?: string;
  createdAt?: string;
  notes?: string;
  approvedAt?: string;
  approvedBy?: string;
}

export interface CategoryMeta {
  id: CategoryType;
  label: string;
  iconName: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  description: string;
  realPhotoUrl: string;
  photoExamples?: { url: string; title: string; description?: string }[];
}

export interface StatusMeta {
  id: IssueStatus;
  label: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  stepIndex: number;
  description: string;
}

export interface TicketNotification {
  id: string;
  ticketId: string;
  ticketCode: string;
  issueTitle: string;
  oldStatus: IssueStatus;
  newStatus: IssueStatus;
  updatedAt: string;
  officerName?: string;
  officerNotes?: string;
  afterImageUrl?: string;
  subDistrict?: string;
  village?: string;
  isRead: boolean;
  reporterName?: string;
  reporterPhone?: string;
}

export type AppTab =
  | 'home'
  | 'report'
  | 'track'
  | 'my_history'
  | 'map'
  | 'hotlines'
  | 'online_members'
  | 'officer'
  | 'dashboard'
  | 'backend_settings';

