import { CategoryMeta, CategoryType, IssueStatus, StatusMeta } from '../types';

export const CATEGORIES: CategoryMeta[] = [
  {
    id: 'road',
    label: 'ถนนชำรุด',
    iconName: 'Construction',
    color: '#ea580c',
    badgeBg: 'bg-orange-50 text-orange-700 border-orange-200',
    badgeText: 'text-orange-700',
    description: 'ผิวทางเป็นหลุมบ่อ ทางเท้าทรุด หรือฝาท่อระบายน้ำชำรุด',
    realPhotoUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
    photoExamples: [
      {
        url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
        title: 'หลุมบ่อขนาดใหญ่บนผิวทางแอสฟัลต์',
        description: 'ภาพจริง: หลุมบ่อลึก ผิวทางแตกร่อน กักขังน้ำฝน เสี่ยงเกิดอุบัติเหตุ',
      },
      {
        url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80',
        title: 'ถนนทรุดตัวและแตกร้าวอันตราย',
        description: 'ภาพจริง: ขอบทางทรุดตัว แตกลายงาเป็นทางยาว',
      },
      {
        url: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800&auto=format&fit=crop&q=80',
        title: 'ผิวจราจรชำรุด มีหินคลุกหลุดร่อน',
        description: 'ภาพจริง: ผิวจราจรหลุดร่อน ยานพาหนะสัญจรลำบาก',
      },
    ],
  },
  {
    id: 'street_light',
    label: 'ไฟถนนเสีย / ไฟดับ',
    iconName: 'Lightbulb',
    color: '#eab308',
    badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
    badgeText: 'text-amber-700',
    description: 'หลอดไฟดับ ไฟกะพริบ เสาไฟเอียง หรือสายไฟชำรุด',
    realPhotoUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
    photoExamples: [
      {
        url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
        title: 'โคมไฟถนนดับมืดช่วงพลบค่ำ',
        description: 'ภาพจริง: โคมไฟทางสาธารณะไม่ติด ถนนมืดสนิทในเวลากลางคืน',
      },
      {
        url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&auto=format&fit=crop&q=80',
        title: 'เสาไฟฟ้าส่องสว่างริมถนนชุมชน',
        description: 'ภาพจริง: เสาไฟทางจุดเสี่ยง ทางแยกมืดอันตราย',
      },
      {
        url: 'https://images.unsplash.com/photo-1508873696983-2df5293cb325?w=800&auto=format&fit=crop&q=80',
        title: 'เสาไฟและสายไฟริมถนนเสี่ยงชำรุด',
        description: 'ภาพจริง: สายไฟหย่อนยาน เสาไฟเอนเอียง',
      },
    ],
  },
  {
    id: 'garbage',
    label: 'ขยะตกค้าง',
    iconName: 'Trash2',
    color: '#10b981',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    badgeText: 'text-emerald-700',
    description: 'ถังขยะล้น กองขยะส่งกลิ่นเหม็น หรือจุดทิ้งขยะไม่ถูกสุขลักษณะ',
    realPhotoUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&auto=format&fit=crop&q=80',
    photoExamples: [
      {
        url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&auto=format&fit=crop&q=80',
        title: 'กองขยะตกค้างริมทางเดิน ส่งกลิ่นเหม็น',
        description: 'ภาพจริง: ถุงขยะกองท่วมริมทาง สัตว์คุ้ยเขี่ยเกลื่อนกลาด',
      },
      {
        url: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=800&auto=format&fit=crop&q=80',
        title: 'ถังขยะชุมชนล้น ไม่มีรถเข้าจัดเก็บ',
        description: 'ภาพจริง: ขยะล้นออกจากถัง ไม่สามารถทิ้งเพิ่มได้',
      },
      {
        url: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=800&auto=format&fit=crop&q=80',
        title: 'จุดลักลอบทิ้งขยะไม่ถูกสุขลักษณะ',
        description: 'ภาพจริง: มีการนำขยะมาทิ้งบริเวณที่ว่างเปล่าในชุมชน',
      },
    ],
  },
  {
    id: 'water_supply',
    label: 'น้ำไม่ไหล / น้ำประปา',
    iconName: 'Droplets',
    color: '#0284c7',
    badgeBg: 'bg-sky-50 text-sky-700 border-sky-200',
    badgeText: 'text-sky-700',
    description: 'ท่อประปาแตก น้ำไม่ไหล น้ำประปาขุ่น หรือน้ำล้นผิวทาง',
    realPhotoUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80',
    photoExamples: [
      {
        url: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80',
        title: 'ท่อเมนประปาแตก น้ำทะลักท่วมผิวทาง',
        description: 'ภาพจริง: ท่อประปาชำรุด แรงดันน้ำพุ่งสูง ไหลเจิ่งนองพื้น',
      },
      {
        url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80',
        title: 'ก๊อกน้ำแห้ง น้ำประปาไม่ไหลในชุมชน',
        description: 'ภาพจริง: ไม่มีน้ำประปาไหลออกจากก๊อก ชาวบ้านขาดแคลนน้ำอุปโภคบริโภค',
      },
      {
        url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?w=800&auto=format&fit=crop&q=80',
        title: 'วาล์วและระบบท่อส่งน้ำชำรุด',
        description: 'ภาพจริง: ข้อต่อท่อประปารั่วซึม ต้องขุดซ่อมแซมเร่งด่วน',
      },
    ],
  },
  {
    id: 'tree_blocking',
    label: 'ต้นไม้ขวางทาง / ไม้หัก',
    iconName: 'Trees',
    color: '#15803d',
    badgeBg: 'bg-green-50 text-green-700 border-green-200',
    badgeText: 'text-green-700',
    description: 'กิ่งไม้พาดสายไฟ กิ่งไม้บดบังทัศนวิสัย หรือต้นไม้ล้มขวางทาง',
    realPhotoUrl: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=800&auto=format&fit=crop&q=80',
    photoExamples: [
      {
        url: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=800&auto=format&fit=crop&q=80',
        title: 'ต้นไม้ใหญ่ล้มพาดขวางถนน',
        description: 'ภาพจริง: ลมพายุพัดต้นไม้โค่นล้มปิดกั้นช่องทางจราจร',
      },
      {
        url: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800&auto=format&fit=crop&q=80',
        title: 'กิ่งไม้ใหญ่พาดสายไฟฟ้าแรงต่ำ',
        description: 'ภาพจริง: กิ่งไม้ยื่นพาดสายไฟฟ้า เสี่ยงเกิดประกายไฟและไฟดับ',
      },
      {
        url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format&fit=crop&q=80',
        title: 'กิ่งไม้หักตกขวางทางสัญจร',
        description: 'ภาพจริง: ท่อนไม้และกิ่งไม้หักกองบนถนน บังเส้นทางรถยนต์',
      },
    ],
  },
  {
    id: 'road_obstacle',
    label: 'สิ่งกีดขวางบนถนน',
    iconName: 'ShieldAlert',
    color: '#dc2626',
    badgeBg: 'bg-red-50 text-red-700 border-red-200',
    badgeText: 'text-red-700',
    description: 'วัสดุตกหล่น สิ่งปลูกสร้างรุกล้ำ หรือจอดรถกีดขวางการจราจร',
    realPhotoUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80',
    photoExamples: [
      {
        url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80',
        title: 'กองวัสดุก่อสร้างและดินขวางช่องทาง',
        description: 'ภาพจริง: เศษหินดินทรายกองล้ำผิวทาง ทำให้ช่องจราจรแคบลง',
      },
      {
        url: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?w=800&auto=format&fit=crop&q=80',
        title: 'สิ่งกีดขวางและแผงกั้นอันตรายบนทางเดิน',
        description: 'ภาพจริง: ป้ายหรือวัสดุวางเกะกะบนผิวถนนและทางเท้า',
      },
    ],
  },
  {
    id: 'noise',
    label: 'เสียงรบกวน',
    iconName: 'Volume2',
    color: '#8b5cf6',
    badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
    badgeText: 'text-purple-700',
    description: 'เสียงก่อสร้างนอกเวลา เสียงดนตรีสถานบันเทิง หรือเสียงเครื่องจักร',
    realPhotoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?w=800&auto=format&fit=crop&q=80',
    photoExamples: [
      {
        url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?w=800&auto=format&fit=crop&q=80',
        title: 'งานขุดเจาะก่อสร้างส่งเสียงดังรบกวน',
        description: 'ภาพจริง: เครื่องจักรกลงานโยธาทำงานส่งเสียงดังช่วงกลางคืนหรือเวลาพักผ่อน',
      },
    ],
  },
  {
    id: 'other',
    label: 'อื่น ๆ',
    iconName: 'HelpCircle',
    color: '#64748b',
    badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
    badgeText: 'text-slate-700',
    description: 'ปัญหาทั่วไปหรือข้อร้องเรียนสุขอนามัยชุมชนอื่น ๆ',
    realPhotoUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80',
    photoExamples: [
      {
        url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80',
        title: 'อาคารและสาธารณูปโภคชุมชนทั่วไป',
        description: 'ภาพจริง: สถานที่สาธารณะและการบริการชุมชน',
      },
    ],
  },
];

export const STATUSES: StatusMeta[] = [
  {
    id: 'pending',
    label: 'รอตรวจสอบ',
    color: '#f59e0b',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
    badgeText: 'text-amber-800',
    stepIndex: 1,
    description: 'ส่งเรื่องแล้ว รอเจ้าหน้าที่ตรวจเช็กข้อมูลและส่งต่อหน่วยงาน',
  },
  {
    id: 'acknowledged',
    label: 'รับเรื่องแล้ว',
    color: '#0ea5e9',
    badgeBg: 'bg-sky-100 text-sky-800 border-sky-300',
    badgeText: 'text-sky-800',
    stepIndex: 2,
    description: 'เจ้าหน้าที่รับเรื่องและประสานงานฝ่ายที่เกี่ยวข้องเรียบร้อย',
  },
  {
    id: 'in_progress',
    label: 'กำลังดำเนินการ',
    color: '#6366f1',
    badgeBg: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    badgeText: 'text-indigo-800',
    stepIndex: 3,
    description: 'ทีมช่างหรือเจ้าหน้าที่ลงพื้นที่กำลังเข้าซ่อมแซมหรือแก้ไข',
  },
  {
    id: 'resolved',
    label: 'แก้ไขแล้ว',
    color: '#10b981',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    badgeText: 'text-emerald-800',
    stepIndex: 4,
    description: 'ดำเนินการแก้ไขเรียบร้อยแล้ว มีภาพถ่ายยืนยันผลงาน',
  },
  {
    id: 'closed',
    label: 'ปิดเรื่อง',
    color: '#475569',
    badgeBg: 'bg-slate-200 text-slate-800 border-slate-300',
    badgeText: 'text-slate-800',
    stepIndex: 5,
    description: 'ส่งมอบงานและปิดคำร้องเรียนเรียบร้อยตามมาตรฐาน',
  },
];

export const DEPARTMENTS = [
  'สำนักการโยธาและผังเมือง',
  'ฝ่ายรักษาความสะอาดและสวนสาธารณะ',
  'กองสาธารณสุขและสิ่งแวดล้อม',
  'งานไฟฟ้าและแสงสว่างสาธารณะ',
  'ฝ่ายเทศกิจและจัดการจราจร',
  'การประปาเทศบาลนคร',
];
