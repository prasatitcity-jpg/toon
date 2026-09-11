export interface OnlineMember {
  id: string;
  displayName: string;
  role: 'citizen' | 'officer';
  roleLabel: string;
  subDistrict: string;
  status: 'online' | 'offline';
  lastActive: string;
}

export const INITIAL_MEMBERS: OnlineMember[] = [
  // 2 Officers online
  {
    id: 'mem-off-1',
    displayName: 'นายช่างเกรียงไกร (กองช่าง)',
    role: 'officer',
    roleLabel: 'เจ้าหน้าที่ อ.ปราสาท',
    subDistrict: 'ต.กังแอน',
    status: 'online',
    lastActive: 'กำลังใช้งาน',
  },
  {
    id: 'mem-off-2',
    displayName: 'กานดา (กองสาธารณสุข)',
    role: 'officer',
    roleLabel: 'เจ้าหน้าที่ อ.ปราสาท',
    subDistrict: 'ต.เชื้อเพลิง',
    status: 'online',
    lastActive: 'กำลังใช้งาน',
  },

  // 10 Citizens online (Total online = 12: 10 citizens + 2 officers as in user example)
  {
    id: 'mem-cit-1',
    displayName: 'สมชาย ใจดี',
    role: 'citizen',
    roleLabel: 'ประชาชน',
    subDistrict: 'ต.กังแอน',
    status: 'online',
    lastActive: 'กำลังใช้งาน',
  },
  {
    id: 'mem-cit-2',
    displayName: 'วารุณี จ.',
    role: 'citizen',
    roleLabel: 'ประชาชน',
    subDistrict: 'ต.บ้านพลวง',
    status: 'online',
    lastActive: 'กำลังใช้งาน',
  },
  {
    id: 'mem-cit-3',
    displayName: 'ประดิษฐ์ รักษ์ถิ่น',
    role: 'citizen',
    roleLabel: 'ประชาชน',
    subDistrict: 'ต.เชื้อเพลิง',
    status: 'online',
    lastActive: 'กำลังใช้งาน',
  },
  {
    id: 'mem-cit-4',
    displayName: 'อนงค์ สุรินทร์',
    role: 'citizen',
    roleLabel: 'ประชาชน',
    subDistrict: 'ต.ทมอ',
    status: 'online',
    lastActive: 'กำลังใช้งาน',
  },
  {
    id: 'mem-cit-5',
    displayName: 'กิตติศักดิ์ พ.',
    role: 'citizen',
    roleLabel: 'ประชาชน',
    subDistrict: 'ต.โคกยาง',
    status: 'online',
    lastActive: 'กำลังใช้งาน',
  },
  {
    id: 'mem-cit-6',
    displayName: 'นภาวรรณ ศ.',
    role: 'citizen',
    roleLabel: 'ประชาชน',
    subDistrict: 'ต.ไพล',
    status: 'online',
    lastActive: 'กำลังใช้งาน',
  },
  {
    id: 'mem-cit-7',
    displayName: 'ธีรพงษ์ ก.',
    role: 'citizen',
    roleLabel: 'ประชาชน',
    subDistrict: 'ต.กังแอน',
    status: 'online',
    lastActive: 'กำลังใช้งาน',
  },
  {
    id: 'mem-cit-8',
    displayName: 'สมบัติ ชุมชนบักได',
    role: 'citizen',
    roleLabel: 'ประชาชน',
    subDistrict: 'ต.บักได',
    status: 'online',
    lastActive: 'กำลังใช้งาน',
  },
  {
    id: 'mem-cit-9',
    displayName: 'สุรีย์พร พลวงพัฒนา',
    role: 'citizen',
    roleLabel: 'ประชาชน',
    subDistrict: 'ต.บ้านพลวง',
    status: 'online',
    lastActive: 'กำลังใช้งาน',
  },
  {
    id: 'mem-cit-10',
    displayName: 'วิชัย เกษตรกรร่วมใจ',
    role: 'citizen',
    roleLabel: 'ประชาชน',
    subDistrict: 'ต.ตาเบา',
    status: 'online',
    lastActive: 'กำลังใช้งาน',
  },

  // Offline members (displaying ⚪ ออฟไลน์)
  {
    id: 'mem-offl-1',
    displayName: 'สุรชัย ศรีสวัสดิ์',
    role: 'citizen',
    roleLabel: 'ประชาชน',
    subDistrict: 'ต.ตานี',
    status: 'offline',
    lastActive: '2 ชั่วโมงที่แล้ว',
  },
  {
    id: 'mem-offl-2',
    displayName: 'ช่างวิรัช (ประปา)',
    role: 'officer',
    roleLabel: 'เจ้าหน้าที่ อ.ปราสาท',
    subDistrict: 'ต.ทมอ',
    status: 'offline',
    lastActive: '3 ชั่วโมงที่แล้ว',
  },
  {
    id: 'mem-offl-3',
    displayName: 'อำนวย บ้านไพล',
    role: 'citizen',
    roleLabel: 'ประชาชน',
    subDistrict: 'ต.บ้านไพล',
    status: 'offline',
    lastActive: 'เมื่อวานนี้',
  },
  {
    id: 'mem-offl-4',
    displayName: 'บุญมี โคกสะอาด',
    role: 'citizen',
    roleLabel: 'ประชาชน',
    subDistrict: 'ต.โคกสะอาด',
    status: 'offline',
    lastActive: '3 วันที่แล้ว',
  },
];
