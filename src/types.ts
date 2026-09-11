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

export interface Issue {
  id: string;
  ticketCode: string;
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
  officerNotes?: string;
  assignedDepartment?: string;
  assignedOfficer?: string;
  createdAt: string;
  updatedAt: string;
  timeline: TimelineEvent[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'citizen' | 'officer' | 'admin';
  department?: string;
  avatar: string;
}

export interface CategoryMeta {
  id: CategoryType;
  label: string;
  iconName: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  description: string;
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
