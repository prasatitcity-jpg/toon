import { CategoryType, UrgencyLevel } from '../types';

export interface AgencyInfo {
  id: string;
  name: string;
  category: 'emergency' | 'utility' | 'roads' | 'local';
  categoryLabel: string;
  responsibility: string;
  phone: string; // If verified, real phone; if not, empty string
  phoneDisplay?: string;
  hasVerifiedPhone: boolean;
  website?: string;
  address?: string;
  is24Hours?: boolean;
  notes?: string;
}

export const AGENCIES_DATA: AgencyInfo[] = [
  // 1. เหตุฉุกเฉิน
  {
    id: 'emer-police',
    name: 'ตำรวจ (เหตุด่วนเหตุร้าย)',
    category: 'emergency',
    categoryLabel: 'เหตุฉุกเฉิน',
    responsibility: 'รับแจ้งเหตุด่วนเหตุร้าย อาชญากรรม อุบัติเหตุจราจรร้ายแรง และความปลอดภัยในชีวิตทรัพย์สิน',
    phone: '191',
    phoneDisplay: '191',
    hasVerifiedPhone: true,
    is24Hours: true,
    website: 'https://www.royalthaipolice.go.th',
    address: 'สถานีตำรวจทั่วประเทศและศูนย์รับแจ้งเหตุ 191 ภ.จว.สุรินทร์',
  },
  {
    id: 'emer-medical',
    name: 'การแพทย์ฉุกเฉิน (สพฉ. / กู้ชีพ)',
    category: 'emergency',
    categoryLabel: 'เหตุฉุกเฉิน',
    responsibility: 'บริการรถพยาบาลกู้ชีพฉุกเฉิน ผู้ป่วยวิกฤต บาดเจ็บสาหัส นำส่งโรงพยาบาลปราสาททันที',
    phone: '1669',
    phoneDisplay: '1669',
    hasVerifiedPhone: true,
    is24Hours: true,
    website: 'https://www.niems.go.th',
    address: 'ศูนย์สั่งการกู้ชีพ 1669 จังหวัดสุรินทร์ (เครือข่าย รพ.ปราสาท และมูลนิธิในพื้นที่)',
  },
  {
    id: 'emer-disaster',
    name: 'กรมป้องกันและบรรเทาสาธารณภัย (ปภ.)',
    category: 'emergency',
    categoryLabel: 'เหตุฉุกเฉิน',
    responsibility: 'รับแจ้งอุทกภัย น้ำท่วม วาตภัย พายุลมแรง ไฟไหม้ และภัยพิบัติทางธรรมชาติ',
    phone: '1784',
    phoneDisplay: '1784',
    hasVerifiedPhone: true,
    is24Hours: true,
    website: 'https://www.disaster.go.th',
    address: 'สายด่วนนิรภัย ปภ. กระทรวงมหาดไทย',
  },

  // 2. สาธารณูปโภค
  {
    id: 'util-pea',
    name: 'การไฟฟ้าส่วนภูมิภาค (PEA สายด่วน)',
    category: 'utility',
    categoryLabel: 'สาธารณูปโภค',
    responsibility: 'แจ้งเหตุไฟฟ้าขัดข้อง ไฟดับเป็นบริเวณกว้าง เสาไฟฟ้าล้ม หม้อแปลงระเบิด สายไฟขาดอันตราย',
    phone: '1129',
    phoneDisplay: '1129',
    hasVerifiedPhone: true,
    is24Hours: true,
    website: 'https://www.pea.co.th',
    address: 'ศูนย์บริการข้อมูลการไฟฟ้าส่วนภูมิภาค 1129 PEA Contact Center',
  },
  {
    id: 'util-pea-prasat',
    name: 'การไฟฟ้าส่วนภูมิภาค สาขาอำเภอปราสาท',
    category: 'utility',
    categoryLabel: 'สาธารณูปโภค',
    responsibility: 'งานซ่อมบำรุงระบบจ่ายไฟฟ้าในเขตอำเภอปราสาท ขยายเขตไฟฟ้า และประสานงานตัดกระแสไฟ',
    phone: '044-551-240',
    phoneDisplay: '044-551-240',
    hasVerifiedPhone: true,
    is24Hours: false,
    website: 'https://www.pea.co.th',
    address: 'เลขที่ 200 หมู่ 2 ถนนสุรินทร์-ช่องจอม ตำบลกังแอน อำเภอปราสาท จังหวัดสุรินทร์ 32140',
  },
  {
    id: 'util-pwa',
    name: 'การประปาส่วนภูมิภาค (PWA Contact Center)',
    category: 'utility',
    categoryLabel: 'สาธารณูปโภค',
    responsibility: 'แจ้งท่อประปาแตก น้ำประปาไม่ไหล น้ำประปาขุ่น คุณภาพน้ำ และร้องเรียนบริการน้ำประปา',
    phone: '1662',
    phoneDisplay: '1662',
    hasVerifiedPhone: true,
    is24Hours: true,
    website: 'https://www.pwa.co.th',
    address: 'สายด่วนการประปาส่วนภูมิภาค 1662',
  },
  {
    id: 'util-pwa-prasat',
    name: 'การประปาส่วนภูมิภาค สาขาปราสาท',
    category: 'utility',
    categoryLabel: 'สาธารณูปโภค',
    responsibility: 'ผลิตและจ่ายน้ำประปาสะอาดในเขตอำเภอปราสาท ซ่อมท่อเมนประปา และตรวจสอบแรงดันน้ำ',
    phone: '044-551-300',
    phoneDisplay: '044-551-300',
    hasVerifiedPhone: true,
    is24Hours: false,
    website: 'https://www.pwa.co.th',
    address: 'ตำบลกังแอน อำเภอปราสาท จังหวัดสุรินทร์ 32140',
  },

  // 3. ถนนและการเดินทาง
  {
    id: 'road-highway',
    name: 'กรมทางหลวง (สายด่วนทางหลวง)',
    category: 'roads',
    categoryLabel: 'ถนนและการเดินทาง',
    responsibility: 'ดูแลทางหลวงสายหลัก เช่น ทางหลวงหมายเลข 24 (โชคชัย-เดชอุดม), ทางหลวง 214 (สุรินทร์-ช่องจอม) ถนนชำรุด ไฟสัญญาณเสีย',
    phone: '1586',
    phoneDisplay: '1586',
    hasVerifiedPhone: true,
    is24Hours: true,
    website: 'https://www.doh.go.th',
    address: 'ศูนย์บริการข้อมูลทางหลวง กรมทางหลวง กระทรวงคมนาคม',
  },
  {
    id: 'road-highway-prasat',
    name: 'หมวดทางหลวงปราสาท (แขวงทางหลวงสุรินทร์)',
    category: 'roads',
    categoryLabel: 'ถนนและการเดินทาง',
    responsibility: 'ซ่อมแซมหลุมบ่อ ตัดแต่งต้นไม้ริมทางหลวงแผ่นดินในเขต อ.ปราสาท และติดตั้งป้ายจราจร',
    phone: '044-551-182',
    phoneDisplay: '044-551-182',
    hasVerifiedPhone: true,
    is24Hours: false,
    address: 'ถนนโชคชัย-เดชอุดม (ทล.24) ตำบลกังแอน อำเภอปราสาท จังหวัดสุรินทร์ 32140',
  },
  {
    id: 'road-rural',
    name: 'กรมทางหลวงชนบท (สายด่วน)',
    category: 'roads',
    categoryLabel: 'ถนนและการเดินทาง',
    responsibility: 'ดูแลถนนลาดยางและคอนกรีตเชื่อมระหว่างอำเภอ ตำบล และหมู่บ้าน (รหัส สร.xxxx)',
    phone: '1146',
    phoneDisplay: '1146',
    hasVerifiedPhone: true,
    is24Hours: true,
    website: 'https://www.drr.go.th',
    address: 'ศูนย์ความปลอดภัยคมนาคม กรมทางหลวงชนบท',
  },

  // 4. หน่วยงานในอำเภอปราสาท
  {
    id: 'local-district-office',
    name: 'ที่ว่าการอำเภอปราสาท',
    category: 'local',
    categoryLabel: 'หน่วยงานในอำเภอปราสาท',
    responsibility: 'ศูนย์ดำรงธรรมอำเภอปราสาท งานทะเบียนราษฎร ประสานงานแก้ไขปัญหาความเดือดร้อนของประชาชน 18 ตำบล',
    phone: '044-551-297',
    phoneDisplay: '044-551-297',
    hasVerifiedPhone: true,
    is24Hours: false,
    website: 'http://www.prasat.surin.doae.go.th',
    address: 'เลขที่ 1 หมู่ 2 ถนนสุรินทร์-ช่องจอม ตำบลกังแอน อำเภอปราสาท จังหวัดสุรินทร์ 32140',
  },
  {
    id: 'local-police-station',
    name: 'สถานีตำรวจภูธรปราสาท (สภ.ปราสาท)',
    category: 'local',
    categoryLabel: 'หน่วยงานในอำเภอปราสาท',
    responsibility: 'รักษาความสงบเรียบร้อย รับแจ้งความดำเนินคดี ป้องกันอาชญากรรมและงานจราจรในเขตอำเภอปราสาท',
    phone: '044-551-222',
    phoneDisplay: '044-551-222',
    hasVerifiedPhone: true,
    is24Hours: true,
    website: 'https://prasat.surin.police.go.th',
    address: 'เลขที่ 234 หมู่ 2 ตำบลกังแอน อำเภอปราสาท จังหวัดสุรินทร์ 32140',
  },
  {
    id: 'local-community-dev',
    name: 'สำนักงานพัฒนาชุมชนอำเภอปราสาท',
    category: 'local',
    categoryLabel: 'หน่วยงานในอำเภอปราสาท',
    responsibility: 'ส่งเสริมเศรษฐกิจฐานราก ผ้าไหมสุรินทร์ กองทุนหมู่บ้าน และงานพัฒนาคุณภาพชีวิตชุมชนใน 18 ตำบล',
    phone: '044-551-423',
    phoneDisplay: '044-551-423',
    hasVerifiedPhone: true,
    is24Hours: false,
    address: 'ชั้น 2 ที่ว่าการอำเภอปราสาท ตำบลกังแอน อำเภอปราสาท จังหวัดสุรินทร์ 32140',
  },
  {
    id: 'local-health-office',
    name: 'สำนักงานสาธารณสุขอำเภอปราสาท (สสอ.ปราสาท)',
    category: 'local',
    categoryLabel: 'หน่วยงานในอำเภอปราสาท',
    responsibility: 'กำกับดูแลโรงพยาบาลส่งเสริมสุขภาพตำบล (รพ.สต.) 18 ตำบล งานสุขอนามัย ควบคุมโรคระบาด และคุ้มครองผู้บริโภค',
    phone: '044-551-140',
    phoneDisplay: '044-551-140',
    hasVerifiedPhone: true,
    is24Hours: false,
    address: 'หมู่ 2 ตำบลกังแอน อำเภอปราสาท จังหวัดสุรินทร์ 32140',
  },
  {
    id: 'local-hospital',
    name: 'โรงพยาบาลปราสาท',
    category: 'local',
    categoryLabel: 'หน่วยงานในอำเภอปราสาท',
    responsibility: 'บริการรักษาพยาบาล แผนกอุบัติเหตุ-ฉุกเฉิน 24 ชั่วโมง การตรวจรักษาทั่วไป และรับส่งต่อผู้ป่วย',
    phone: '044-551-295',
    phoneDisplay: '044-551-295',
    hasVerifiedPhone: true,
    is24Hours: true,
    website: 'https://www.prasathospital.go.th',
    address: 'เลขที่ 111 หมู่ 2 ถนนสุรินทร์-ช่องจอม ตำบลกังแอน อำเภอปราสาท จังหวัดสุรินทร์ 32140',
  },
  {
    id: 'local-tessaban-kangan',
    name: 'เทศบาลตำบลกังแอน (อปท. ในพื้นที่)',
    category: 'local',
    categoryLabel: 'หน่วยงานในอำเภอปราสาท',
    responsibility: 'ดูแลไฟฟ้าสาธารณะ ถนนในเขตเทศบาล การเก็บขนขยะมูลฝอย ท่อระบายน้ำ และงานช่างชุมชนตำบลกังแอน',
    phone: '044-551-213',
    phoneDisplay: '044-551-213',
    hasVerifiedPhone: true,
    is24Hours: false,
    website: 'https://www.kangan.go.th',
    address: 'ตำบลกังแอน อำเภอปราสาท จังหวัดสุรินทร์ 32140',
  },
  {
    id: 'local-obt-baanpluang',
    name: 'องค์การบริหารส่วนตำบลบ้านพลวง (อปท. ในพื้นที่)',
    category: 'local',
    categoryLabel: 'หน่วยงานในอำเภอปราสาท',
    responsibility: 'ดูแลสาธารณูปโภค ถนน แสงสว่าง ขยะ และบริการประชาชนในเขตตำบลบ้านพลวง (แหล่งโบราณสถานปราสาทบ้านพลวง)',
    phone: '044-551-325',
    phoneDisplay: '044-551-325',
    hasVerifiedPhone: true,
    is24Hours: false,
    address: 'ตำบลบ้านพลวง อำเภอปราสาท จังหวัดสุรินทร์ 32140',
  },
  {
    id: 'local-obt-cheuphloeng',
    name: 'องค์การบริหารส่วนตำบลเชื้อเพลิง (อปท. ในพื้นที่)',
    category: 'local',
    categoryLabel: 'หน่วยงานในอำเภอปราสาท',
    responsibility: 'ดูแลถนน ไฟฟ้าทาง ขยะสิ่งแวดล้อม และงานบรรเทาสาธารณภัยในเขตตำบลเชื้อเพลิง',
    phone: '044-551-874',
    phoneDisplay: '044-551-874',
    hasVerifiedPhone: true,
    is24Hours: false,
    address: 'ตำบลเชื้อเพลิง อำเภอปราสาท จังหวัดสุรินทร์ 32140',
  },
  {
    id: 'local-obt-thamo',
    name: 'องค์การบริหารส่วนตำบลทมอ (อปท. ในพื้นที่)',
    category: 'local',
    categoryLabel: 'หน่วยงานในอำเภอปราสาท',
    responsibility: 'ดูแลระบบประปาหมู่บ้าน ถนนเกษตรกรรม ไฟฟ้าทาง และพัฒนาชุมชนตำบลทมอ',
    phone: '044-551-862',
    phoneDisplay: '044-551-862',
    hasVerifiedPhone: true,
    is24Hours: false,
    address: 'ตำบลทมอ อำเภอปราสาท จังหวัดสุรินทร์ 32140',
  },
  {
    id: 'local-obt-bakdai',
    name: 'องค์การบริหารส่วนตำบลบักได (อปท. ในพื้นที่)',
    category: 'local',
    categoryLabel: 'หน่วยงานในอำเภอปราสาท',
    responsibility: 'ดูแลพื้นที่ชายแดนและชุมชนตำบลบักได ถนนหนทาง การระบายน้ำ และศูนย์บริการประชาชน',
    phone: '044-041-020',
    phoneDisplay: '044-041-020',
    hasVerifiedPhone: true,
    is24Hours: false,
    address: 'ตำบลบักได อำเภอปราสาท จังหวัดสุรินทร์ 32140',
  },
  {
    id: 'local-obt-tabao',
    name: 'องค์การบริหารส่วนตำบลตาเบา (อปท. ในพื้นที่)',
    category: 'local',
    categoryLabel: 'หน่วยงานในอำเภอปราสาท',
    responsibility: 'งานพัฒนาสาธารณูปโภค ถนนหนทาง งานช่างและสิ่งแวดล้อมตำบลตาเบา',
    phone: '044-040-311',
    phoneDisplay: '044-040-311',
    hasVerifiedPhone: true,
    is24Hours: false,
    address: 'ตำบลตาเบา อำเภอปราสาท จังหวัดสุรินทร์ 32140',
  },
  {
    id: 'local-obt-other-tambon',
    name: 'อบต. อื่นๆ ในเขตอำเภอปราสาท (ตานี, บ้านไพล, สมุด, ประทัดบุ, โคกสะอาด, ไพล, ปรือ, ทุ่งมน, หนองใหญ่, กันตรวจระมวล, โคกยาง, ปราสาททนง)',
    category: 'local',
    categoryLabel: 'หน่วยงานในอำเภอปราสาท',
    responsibility: 'องค์กรปกครองส่วนท้องถิ่นดูแลความเป็นอยู่ สาธารณูปโภค และข้อร้องทุกข์ของประชาชนในแต่ละตำบล',
    phone: '',
    phoneDisplay: '',
    hasVerifiedPhone: false, // Explicitly false according to rule
    is24Hours: false,
    address: 'ที่ทำการ อบต. ประจำแต่ละตำบลในอำเภอปราสาท จังหวัดสุรินทร์',
    notes: 'สำหรับ อบต. ประจำตำบลที่ยังไม่มีหมายเลขโทรศัพท์ตรงที่ตรวจสอบยืนยันได้ สามารถติดต่อประสานงานผ่านศูนย์ดำรงธรรมอำเภอปราสาท 044-551-297 ได้ตลอดวันทำการ',
  },
];

/**
 * Recommends relevant agencies based on category, urgency, and optional sub-district
 * As specified in user requirement 7:
 * - ไฟถนนเสีย → หน่วยงานท้องถิ่น/การไฟฟ้า
 * - ถนนชำรุด → หน่วยงานท้องถิ่น/กรมทางหลวง/กรมทางหลวงชนบท
 * - น้ำประปามีปัญหา → การประปา/หน่วยงานท้องถิ่น
 * - ขยะ → องค์กรปกครองส่วนท้องถิ่น
 * - เหตุฉุกเฉิน → 191 / 1669 / 1784 ตามประเภทเหตุ
 */
export function getRecommendedAgencies(category: CategoryType, urgency: UrgencyLevel, subDistrictName?: string): AgencyInfo[] {
  const list: AgencyInfo[] = [];

  // Urgent / Emergency cases always recommend 191 / 1669 / 1784
  if (urgency === 'urgent') {
    const emer = AGENCIES_DATA.find((a) => a.id === 'emer-disaster') || AGENCIES_DATA[2];
    list.push(emer);
  }

  if (category === 'street_light') {
    const pea = AGENCIES_DATA.find((a) => a.id === 'util-pea');
    const local = AGENCIES_DATA.find((a) => a.id === 'local-tessaban-kangan');
    if (pea) list.push(pea);
    if (local) list.push(local);
  } else if (category === 'road') {
    const highway = AGENCIES_DATA.find((a) => a.id === 'road-highway');
    const rural = AGENCIES_DATA.find((a) => a.id === 'road-rural');
    const local = AGENCIES_DATA.find((a) => a.id === 'local-tessaban-kangan');
    if (local) list.push(local);
    if (highway) list.push(highway);
    if (rural) list.push(rural);
  } else if (category === 'water_supply') {
    const pwa = AGENCIES_DATA.find((a) => a.id === 'util-pwa');
    const pwaPrasat = AGENCIES_DATA.find((a) => a.id === 'util-pwa-prasat');
    const local = AGENCIES_DATA.find((a) => a.id === 'local-tessaban-kangan');
    if (pwaPrasat) list.push(pwaPrasat);
    if (pwa) list.push(pwa);
    if (local) list.push(local);
  } else if (category === 'garbage') {
    const local = AGENCIES_DATA.find((a) => a.id === 'local-tessaban-kangan');
    const district = AGENCIES_DATA.find((a) => a.id === 'local-district-office');
    if (local) list.push(local);
    if (district) list.push(district);
  } else if (category === 'tree_blocking') {
    const pea = AGENCIES_DATA.find((a) => a.id === 'util-pea');
    const emerDisaster = AGENCIES_DATA.find((a) => a.id === 'emer-disaster');
    const local = AGENCIES_DATA.find((a) => a.id === 'local-tessaban-kangan');
    if (local) list.push(local);
    if (pea) list.push(pea);
    if (emerDisaster) list.push(emerDisaster);
  } else {
    const district = AGENCIES_DATA.find((a) => a.id === 'local-district-office');
    const local = AGENCIES_DATA.find((a) => a.id === 'local-tessaban-kangan');
    if (district) list.push(district);
    if (local) list.push(local);
  }

  // Remove duplicates
  const unique = list.filter((item, index, self) => index === self.findIndex((t) => t.id === item.id));
  return unique;
}
