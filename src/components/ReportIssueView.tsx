import React, { useState, useEffect } from 'react';
import {
  Camera,
  MapPin,
  Send,
  AlertCircle,
  CheckCircle2,
  Upload,
  Sparkles,
  ArrowLeft,
  Navigation,
  Image as ImageIcon,
  Check,
  Building2,
  Home as HomeIcon,
} from 'lucide-react';
import { CategoryType, Issue, UrgencyLevel, User } from '../types';
import { CATEGORIES } from '../data/categories';
import { CategoryIcon } from './CategoryIcon';
import { generateTicketCode } from '../utils/storage';
import {
  PRASAT_PROVINCE,
  PRASAT_DISTRICT,
  PRASAT_SUB_DISTRICTS,
  getSubDistrictByName,
  getVillagesBySubDistrict,
} from '../data/prasatLocations';
import { ElephantMascot, PrasatIcon, SurinCommunityBadge } from './SurinMotifs';

interface ReportIssueViewProps {
  currentUser: User;
  existingIssues: Issue[];
  onSubmitIssue: (newIssue: Issue) => void;
  onCancel: () => void;
  onViewIssue: (issue: Issue) => void;
}

// Preset photo options for quick testing
const PRESET_PHOTOS: Record<CategoryType, string[]> = {
  road: [
    'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800&auto=format&fit=crop&q=80',
  ],
  street_light: [
    'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800&auto=format&fit=crop&q=80',
  ],
  garbage: [
    'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=800&auto=format&fit=crop&q=80',
  ],
  water_supply: [
    'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80',
  ],
  tree_blocking: [
    'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=800&auto=format&fit=crop&q=80',
  ],
  road_obstacle: [
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80',
  ],
  noise: [
    'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?w=800&auto=format&fit=crop&q=80',
  ],
  other: [
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80',
  ],
};

export const ReportIssueView: React.FC<ReportIssueViewProps> = ({
  currentUser,
  existingIssues,
  onSubmitIssue,
  onCancel,
  onViewIssue,
}) => {
  const [category, setCategory] = useState<CategoryType>('road');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<UrgencyLevel>('medium');

  // Cascading Location States for Prasat, Surin
  const province = PRASAT_PROVINCE;
  const district = PRASAT_DISTRICT;
  const [subDistrict, setSubDistrict] = useState<string>('กังแอน');
  const [village, setVillage] = useState<string>('หมู่ 2 บ้านบุเจก');
  const [isOtherVillage, setIsOtherVillage] = useState(false);
  const [customVillage, setCustomVillage] = useState('');
  const [locationDetail, setLocationDetail] = useState('');
  const [locationName, setLocationName] = useState('');

  // Initial coordinates centered on Kang Aen, Prasat, Surin
  const [latitude, setLatitude] = useState(14.6433);
  const [longitude, setLongitude] = useState(103.4072);

  const [reporterName, setReporterName] = useState(currentUser.name || '');
  const [reporterPhone, setReporterPhone] = useState(currentUser.phone || '');
  const [reporterEmail, setReporterEmail] = useState(currentUser.email || '');

  const [imageUrl, setImageUrl] = useState(PRESET_PHOTOS.road[0]);
  const [isCustomImage, setIsCustomImage] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdIssue, setCreatedIssue] = useState<Issue | null>(null);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Available villages for currently selected subdistrict
  const currentSubDistrictData = getSubDistrictByName(subDistrict);
  const availableVillages = currentSubDistrictData ? currentSubDistrictData.villages : [];

  // Update village & coordinates when subdistrict changes
  const handleSubDistrictChange = (newSubDistrictName: string) => {
    setSubDistrict(newSubDistrictName);
    setIsOtherVillage(false);
    setCustomVillage('');

    const targetSub = getSubDistrictByName(newSubDistrictName);
    if (targetSub) {
      // Set to first village if exists
      if (targetSub.villages.length > 0) {
        setVillage(`หมู่ ${targetSub.villages[0].moo} ${targetSub.villages[0].name}`);
      } else {
        setVillage('');
      }
      setLatitude(targetSub.lat);
      setLongitude(targetSub.lng);
    }
  };

  const handleVillageChange = (val: string) => {
    if (val === '__OTHER__') {
      setIsOtherVillage(true);
      setVillage('');
    } else {
      setIsOtherVillage(false);
      setVillage(val);
    }
  };

  // Keep locationName in sync
  useEffect(() => {
    const finalVillage = isOtherVillage ? customVillage.trim() : village;
    const parts = [
      locationDetail.trim(),
      finalVillage,
      subDistrict ? `ต.${subDistrict}` : '',
      'อ.ปราสาท',
      'จ.สุรินทร์',
    ].filter(Boolean);
    setLocationName(parts.join(' '));
  }, [subDistrict, village, isOtherVillage, customVillage, locationDetail]);

  const handleCategorySelect = (catId: CategoryType) => {
    setCategory(catId);
    if (!isCustomImage) {
      setImageUrl(PRESET_PHOTOS[catId]?.[0] || PRESET_PHOTOS.road[0]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setImageUrl(reader.result as string);
          setIsCustomImage(true);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude);
          setLongitude(pos.coords.longitude);
        },
        () => {
          // Fallback to coordinates near Kang Aen center
          const lat = 14.6433 + (Math.random() - 0.5) * 0.03;
          const lng = 103.4072 + (Math.random() - 0.5) * 0.03;
          setLatitude(Number(lat.toFixed(4)));
          setLongitude(Number(lng.toFixed(4)));
        }
      );
    }
  };

  const validate = () => {
    const errors: { [key: string]: string } = {};
    if (!title.trim()) errors.title = 'กรุณาระบุหัวข้อปัญหา';
    if (!description.trim()) errors.description = 'กรุณากรอกรายละเอียดปัญหา';
    if (!subDistrict) errors.subDistrict = 'กรุณาเลือกตำบล';
    if (isOtherVillage && !customVillage.trim()) {
      errors.village = 'กรุณาระบุชื่อหมู่บ้าน/ชุมชน';
    } else if (!isOtherVillage && !village) {
      errors.village = 'กรุณาเลือกหมู่บ้าน';
    }
    if (!locationDetail.trim()) {
      errors.locationDetail = 'กรุณาระบุสถานที่หรือจุดสังเกต (เช่น หน้าโรงเรียน, เสาไฟต้นที่ 3)';
    }
    if (!reporterName.trim()) errors.reporterName = 'กรุณาระบุชื่อผู้แจ้ง';
    if (!reporterPhone.trim()) errors.reporterPhone = 'กรุณาระบุเบอร์โทรศัพท์ติดต่อ';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const now = new Date().toISOString();
    const ticketCode = generateTicketCode(existingIssues);
    const finalVillage = isOtherVillage ? customVillage.trim() : village;

    const newIssue: Issue = {
      id: `issue-${Date.now()}`,
      ticketCode,
      title: title.trim(),
      category,
      description: description.trim(),
      status: 'pending',
      urgency,
      province,
      district,
      subDistrict,
      village: finalVillage,
      locationDetail: locationDetail.trim(),
      locationName: locationName.trim(),
      latitude,
      longitude,
      reporterName: reporterName.trim(),
      reporterPhone: reporterPhone.trim(),
      reporterEmail: reporterEmail.trim() || undefined,
      imageUrl: isCustomImage && customImageUrl ? customImageUrl : imageUrl,
      createdAt: now,
      updatedAt: now,
      timeline: [
        {
          id: `tl-${Date.now()}`,
          status: 'pending',
          title: 'แจ้งปัญหาผ่านระบบออนไลน์ (อ.ปราสาท จ.สุรินทร์)',
          note: `ส่งข้อมูลแจ้งเรื่อง ณ ต.${subDistrict} ${finalVillage} เรียบร้อย รอเจ้าหน้าที่ตรวจเช็กและลงพื้นที่`,
          timestamp: now,
          actor: reporterName.trim(),
          actorRole: 'citizen',
        },
      ],
    };

    setTimeout(() => {
      onSubmitIssue(newIssue);
      setIsSubmitting(false);
      setCreatedIssue(newIssue);
    }, 600);
  };

  // If successfully created, show confirmation card
  if (createdIssue) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6">
        <div className="bg-white rounded-3xl shadow-xl border border-emerald-100 p-6 sm:p-10 text-center relative overflow-hidden">
          {/* Elephant Mascot Celebration */}
          <div className="flex justify-center mb-3">
            <ElephantMascot size={80} className="drop-shadow-md animate-bounce" />
          </div>

          <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50">
            <CheckCircle2 size={36} />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 mb-2">
            <PrasatIcon size={14} className="text-emerald-700" />
            <span>ส่งข้อมูลสำเร็จเรียบร้อย • อ.ปราสาท จ.สุรินทร์</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 mb-2">
            บันทึกการแจ้งปัญหาของคุณแล้ว
          </h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
            ระบบส่งเรื่องต่อไปยังเทศบาลตำบล/อบต. ในพื้นที่ <strong>ต.{createdIssue.subDistrict || 'ปราสาท'}</strong> เรียบร้อยแล้ว สามารถใช้รหัสติดตามความคืบหน้าได้ตลอด 24 ชั่วโมง
          </p>

          <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 max-w-sm mx-auto mb-6">
            <span className="text-xs text-emerald-800 font-semibold block">รหัสติดตามปัญหา (Ticket ID)</span>
            <span className="text-2xl font-mono font-bold text-emerald-800 tracking-wide block mt-1">
              {createdIssue.ticketCode}
            </span>
            <div className="mt-2 text-xs text-emerald-700 font-medium">
              📍 {createdIssue.locationName}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => onViewIssue(createdIssue)}
              className="w-full sm:w-auto px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm rounded-xl shadow-md shadow-emerald-700/20 transition-all"
            >
              ดูสถานะและความคืบหน้าทันที
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-all"
            >
              กลับสู่หน้าหลัก
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-8 px-4 sm:px-6">
      {/* Top breadcrumb */}
      <div className="flex items-center gap-2 mb-6">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors p-1 rounded-lg"
        >
          <ArrowLeft size={16} />
          <span>ย้อนกลับ</span>
        </button>
        <span className="text-slate-300">/</span>
        <span className="text-xs text-teal-700 font-semibold">แบบฟอร์มแจ้งปัญหาชุมชน</span>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-emerald-900/10 overflow-hidden">
        {/* Form Banner - Surin Local Modern */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-800 p-6 sm:p-8 text-white relative overflow-hidden">
          {/* Subtle silk decorative pattern overlay */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(#FDE68A 1px, transparent 1px), radial-gradient(#FDE68A 1px, transparent 1px)',
              backgroundSize: '24px 24px',
              backgroundPosition: '0 0, 12px 12px',
            }}
          />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="max-w-xl space-y-2">
              <div className="flex items-center gap-2">
                <SurinCommunityBadge variant="dark" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold leading-tight flex items-center gap-2 text-amber-100">
                <PrasatIcon size={24} className="text-amber-400 shrink-0" />
                <span>แจ้งปัญหาชุมชน • อำเภอปราสาท จ.สุรินทร์</span>
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                ร่วมดูแลชุมชนบ้านเรา ส่งตรงถึงเทศบาลตำบลและ อบต. ทั้ง 18 ตำบล 241 หมู่บ้าน เพื่อการลงพื้นที่ตรวจสอบอย่างรวดเร็ว
              </p>
            </div>

            {/* Elephant Mascot Tip in banner */}
            <div className="hidden md:flex items-center gap-3 bg-emerald-950/50 backdrop-blur-sm p-3 rounded-2xl border border-emerald-700/60 max-w-xs shrink-0">
              <ElephantMascot size={52} className="shrink-0 drop-shadow-sm" />
              <div className="text-[11px] text-emerald-200 leading-tight">
                <strong className="text-amber-300 block mb-0.5">ช้างน้อยปราสาทแนะนำ</strong>
                ระบุตำบล หมู่บ้าน และจุดสังเกต จะช่วยให้ช่างลงพื้นที่แก้ปัญหาได้ตรงจุดครับ
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
          {/* Step 1: Category Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-teal-600 text-white text-xs flex items-center justify-center font-bold">
                  1
                </span>
                <span>เลือกประเภทปัญหา *</span>
              </label>
              <span className="text-xs text-slate-400">เลือก 1 ประเภทที่ตรงที่สุด</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategorySelect(cat.id)}
                    className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col items-start gap-2 ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50/70 shadow-xs ring-2 ring-teal-500/20'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-2xs"
                      style={{ backgroundColor: cat.color }}
                    >
                      <CategoryIcon category={cat.id} size={18} />
                    </div>
                    <span className="text-xs font-bold text-slate-900 leading-tight">
                      {cat.label}
                    </span>
                    {isSelected && (
                      <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-teal-600 text-white flex items-center justify-center">
                        <Check size={10} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Title & Details */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-teal-600 text-white text-xs flex items-center justify-center font-bold">
                  2
                </span>
                <span>รายละเอียดของปัญหา *</span>
              </label>
            </div>

            {/* Urgency selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                ระดับความเร่งด่วน:
              </label>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    { id: 'low', label: 'ปกติ (Low)', color: 'border-slate-200 text-slate-700' },
                    { id: 'medium', label: 'ปานกลาง (Medium)', color: 'border-blue-200 text-blue-700' },
                    { id: 'high', label: 'สูง (High)', color: 'border-amber-200 text-amber-700' },
                    { id: 'urgent', label: 'เร่งด่วนมาก/อันตราย (Urgent)', color: 'border-rose-300 text-rose-700' },
                  ] as const
                ).map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setUrgency(u.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                      urgency === u.id
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : `${u.color} bg-white hover:bg-slate-50`
                    }`}
                  >
                    {u.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                หัวข้อปัญหา (สรุปสั้น ๆ ให้เข้าใจง่าย) *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="เช่น ไฟทางดับ 3 ต้นในซอยสุขใจ 5, ขยะล้นถังส่งกลิ่นเหม็น"
                className={`w-full text-sm px-3.5 py-2.5 rounded-xl border ${
                  formErrors.title ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                } focus:outline-teal-500`}
              />
              {formErrors.title && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle size={13} /> {formErrors.title}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                รายละเอียดเพิ่มเติม (บอกลักษณะความเสียหาย ผลกระทบ) *
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="ระบุรายละเอียด เช่น มีน้ำซึมท่วมถนนมา 2 วันแล้ว, หลอดไฟกะพริบเวลากลางคืน, กิ่งไม้อยู่ใกล้สายไฟ..."
                className={`w-full text-sm px-3.5 py-2.5 rounded-xl border ${
                  formErrors.description ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                } focus:outline-teal-500`}
              />
              {formErrors.description && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle size={13} /> {formErrors.description}
                </p>
              )}
            </div>
          </div>

          {/* Step 3: Cascading Location (Prasat, Surin) & Coordinates */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-700 text-white text-xs flex items-center justify-center font-bold">
                  3
                </span>
                <span>ระบุสถานที่เกิดเหตุ (อ.ปราสาท จ.สุรินทร์) *</span>
              </label>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-900 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-300 hover:bg-emerald-100 transition-colors"
              >
                <Navigation size={13} className="text-emerald-700" />
                <span>ใช้พิกัดปัจจุบัน (GPS)</span>
              </button>
            </div>

            {/* Cascading Dropdown: Province -> District -> Sub-district -> Village */}
            <div className="bg-emerald-50/40 p-4 sm:p-5 rounded-2xl border border-emerald-200/80 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* 1. Province (Fixed / Readonly) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    <span>จังหวัด</span>
                  </label>
                  <div className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-100 text-slate-700 flex items-center justify-between">
                    <span>{province}</span>
                    <span className="text-[10px] text-slate-400 font-normal">สุรินทร์ถิ่นช้างใหญ่</span>
                  </div>
                </div>

                {/* 2. District (Fixed / Readonly) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    <span>อำเภอ</span>
                  </label>
                  <div className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-100 text-slate-700 flex items-center justify-between">
                    <span>{district}</span>
                    <span className="text-[10px] text-slate-400 font-normal">18 ตำบล</span>
                  </div>
                </div>

                {/* 3. Sub-district (ตำบล - 18 ตำบล) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>ตำบล (เลือกจาก 18 ตำบล) *</span>
                  </label>
                  <select
                    value={subDistrict}
                    onChange={(e) => handleSubDistrictChange(e.target.value)}
                    className={`w-full text-xs font-medium px-3 py-2.5 rounded-xl border bg-white ${
                      formErrors.subDistrict ? 'border-rose-400 bg-rose-50/30' : 'border-emerald-300'
                    } focus:outline-emerald-600 focus:ring-1 focus:ring-emerald-500`}
                  >
                    <option value="">-- กรุณาเลือกตำบล --</option>
                    {PRASAT_SUB_DISTRICTS.map((sd) => (
                      <option key={sd.id} value={sd.name}>
                        ต.{sd.name} ({sd.villages.length} หมู่บ้าน)
                      </option>
                    ))}
                  </select>
                  {formErrors.subDistrict && (
                    <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle size={12} /> {formErrors.subDistrict}
                    </p>
                  )}
                </div>

                {/* 4. Village (หมู่บ้าน - ดึงตามตำบลที่เลือก) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>หมู่บ้าน (ใน ต.{subDistrict || '...'}) *</span>
                  </label>
                  <select
                    disabled={!subDistrict}
                    value={isOtherVillage ? '__OTHER__' : village}
                    onChange={(e) => handleVillageChange(e.target.value)}
                    className={`w-full text-xs font-medium px-3 py-2.5 rounded-xl border bg-white disabled:bg-slate-100 disabled:text-slate-400 ${
                      formErrors.village ? 'border-rose-400 bg-rose-50/30' : 'border-emerald-300'
                    } focus:outline-emerald-600 focus:ring-1 focus:ring-emerald-500`}
                  >
                    <option value="">-- เลือกหมู่บ้าน --</option>
                    {availableVillages.map((v) => {
                      const val = `หมู่ ${v.moo} ${v.name}`;
                      return (
                        <option key={v.moo} value={val}>
                          {val}
                        </option>
                      );
                    })}
                    <option value="__OTHER__">+ ระบุหมู่บ้าน / ชุมชนอื่น ๆ</option>
                  </select>
                  {formErrors.village && (
                    <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle size={12} /> {formErrors.village}
                    </p>
                  )}
                </div>
              </div>

              {/* In case of Custom Village */}
              {isOtherVillage && (
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ระบุชื่อหมู่บ้าน หรือชุมชนของคุณ *
                  </label>
                  <input
                    type="text"
                    value={customVillage}
                    onChange={(e) => setCustomVillage(e.target.value)}
                    placeholder="เช่น ชุมชนหน้าตลาดปราสาท, หมู่ 5 บ้านใหม่พัฒนา..."
                    className="w-full text-xs px-3 py-2 rounded-xl border border-emerald-300 focus:outline-emerald-600 bg-white"
                  />
                </div>
              )}

              {/* 5. Specific Location / Landmark */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  สถานที่เฉพาะ / จุดสังเกตชัดเจน (ช่วยให้ช่างหาตำแหน่งได้เร็ว) *
                </label>
                <input
                  type="text"
                  value={locationDetail}
                  onChange={(e) => setLocationDetail(e.target.value)}
                  placeholder="เช่น หน้า รพ.สต., ทางโค้งข้างสระน้ำหนองยาว, เสาไฟส่องสว่างต้นที่ 3 จากปากซอย, ตรงข้ามศาลาประชาคม"
                  className={`w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border bg-white ${
                    formErrors.locationDetail ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                  } focus:outline-emerald-600`}
                />
                {formErrors.locationDetail && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle size={13} /> {formErrors.locationDetail}
                  </p>
                )}
              </div>

              {/* Live Preview of Formatted Address */}
              <div className="bg-white/80 border border-emerald-200 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 text-xs text-emerald-900">
                <MapPin size={16} className="text-emerald-700 shrink-0" />
                <div className="flex-1">
                  <span className="text-[11px] text-emerald-700 font-semibold block">ที่อยู่ปัญหาตามระบบ:</span>
                  <span className="font-semibold text-slate-800">
                    {locationName || 'กรุณาเลือกตำบลและระบุจุดสังเกต'}
                  </span>
                </div>
              </div>
            </div>

            {/* Interactive Prasat Surin Coordinates Map Picker */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-1 mb-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <MapPin size={14} className="text-rose-600" />
                  <span>พิกัดแผนที่อำเภอปราสาท (คลิกบนแผนที่เพื่อขยับตำแหน่งหมุด)</span>
                </span>
                <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  ละติจูด {latitude.toFixed(4)}, ลองจิจูด {longitude.toFixed(4)}
                </span>
              </div>

              {/* Interactive map plane calibrated for Prasat, Surin */}
              <div
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = (e.clientX - rect.left) / rect.width;
                  const y = (e.clientY - rect.top) / rect.height;
                  // Map [0,1] to lat range [14.40, 14.80] and lng range [103.20, 103.60]
                  const newLat = 14.80 - y * 0.40;
                  const newLng = 103.20 + x * 0.40;
                  setLatitude(Number(newLat.toFixed(4)));
                  setLongitude(Number(newLng.toFixed(4)));
                }}
                className="relative h-44 sm:h-52 rounded-xl overflow-hidden border border-emerald-300 bg-emerald-50/40 cursor-crosshair group shadow-inner select-none"
                style={{
                  backgroundImage:
                    'radial-gradient(#10B981 1px, transparent 1px), radial-gradient(#10B981 1px, #f0fdf4 1px)',
                  backgroundSize: '24px 24px',
                  backgroundPosition: '0 0, 12px 12px',
                }}
              >
                {/* Simulated geographic landmarks of Prasat District */}
                <div className="absolute inset-0 pointer-events-none opacity-60">
                  {/* Highway 24 & Highway 214 road intersection in Prasat */}
                  <div className="absolute top-1/2 left-0 right-0 h-2 bg-amber-200/80 shadow-xs" />
                  <div className="absolute top-0 bottom-0 left-1/2 w-2.5 bg-amber-300/80 shadow-xs" />

                  {/* Prasat Landmarks */}
                  <div className="absolute top-[42%] left-[45%] bg-white/90 border border-emerald-400 text-emerald-900 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs flex items-center gap-1">
                    <PrasatIcon size={12} className="text-amber-600" />
                    <span>เทศบาลตำบลกังแอน</span>
                  </div>

                  <div className="absolute top-[25%] left-[25%] bg-white/80 border border-slate-300 text-slate-700 text-[9px] px-1.5 py-0.5 rounded">
                    ต.เชื้อเพลิง
                  </div>

                  <div className="absolute top-[18%] left-[55%] bg-white/80 border border-slate-300 text-slate-700 text-[9px] px-1.5 py-0.5 rounded">
                    ต.ทมอ / ปราสาทบ้านไพล
                  </div>

                  <div className="absolute top-[65%] left-[65%] bg-white/80 border border-slate-300 text-slate-700 text-[9px] px-1.5 py-0.5 rounded">
                    ต.บ้านพลวง / ปราสาทพลวง
                  </div>

                  <div className="absolute bottom-[10%] left-[30%] bg-white/80 border border-slate-300 text-slate-700 text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1">
                    <PrasatIcon size={10} className="text-amber-700" />
                    <span>ต.บักได / ปราสาทตาเมือน</span>
                  </div>
                </div>

                {/* The Pin */}
                {(() => {
                  const topPercent = ((14.80 - latitude) / 0.40) * 100;
                  const leftPercent = ((longitude - 103.20) / 0.40) * 100;
                  const clampedTop = Math.max(6, Math.min(94, topPercent));
                  const clampedLeft = Math.max(6, Math.min(94, leftPercent));

                  return (
                    <div
                      className="absolute -translate-x-1/2 -translate-y-full transition-all duration-200 pointer-events-none z-10"
                      style={{ top: `${clampedTop}%`, left: `${clampedLeft}%` }}
                    >
                      <div className="flex flex-col items-center">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-amber-300 text-[10px] font-bold shadow-md whitespace-nowrap mb-0.5 border border-amber-400/50">
                          {subDistrict ? `ต.${subDistrict}` : 'จุดพิกัด'}
                        </span>
                        <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg ring-4 ring-rose-200 animate-bounce">
                          <MapPin size={18} />
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <div className="absolute bottom-2 right-2 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[10px] text-emerald-800 font-medium border border-emerald-200 shadow-2xs">
                  แผนที่จำลอง อ.ปราสาท (คลิกเพื่อเลื่อนตำแหน่ง)
                </div>
              </div>
            </div>
          </div>

          {/* Step 4: Photo Upload */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-teal-600 text-white text-xs flex items-center justify-center font-bold">
                  4
                </span>
                <span>แนบรูปภาพปัญหา *</span>
              </label>
              <span className="text-xs text-slate-400">รูปถ่ายช่วยให้เจ้าหน้าที่แก้ได้ตรงจุด</span>
            </div>

            {/* Photo preview & picker */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-6">
                <div className="relative rounded-2xl overflow-hidden border border-slate-300 bg-slate-100 h-48 flex items-center justify-center group">
                  <img
                    src={isCustomImage && customImageUrl ? customImageUrl : imageUrl}
                    alt="ตัวอย่างรูปปัญหา"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-slate-900/80 text-white px-2.5 py-1 rounded-lg text-xs font-medium backdrop-blur-xs">
                    ภาพที่จะส่งเข้าระบบ
                  </div>
                </div>
              </div>

              <div className="sm:col-span-6 flex flex-col justify-between space-y-3">
                {/* File Upload drag-and-drop / select */}
                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 text-center hover:border-teal-500 bg-slate-50/60 transition-colors relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                  />
                  <Upload className="mx-auto text-teal-600 mb-1" size={24} />
                  <p className="text-xs font-semibold text-slate-800">
                    อัปโหลดรูปภาพจากอุปกรณ์
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    คลิกเพื่อเลือกไฟล์ หรือลากรูปมาวางที่นี่
                  </p>
                </div>

                {/* Preset quick picker */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                    หรือเลือกรูปภาพตัวอย่างตามประเภท {CATEGORIES.find((c) => c.id === category)?.label}:
                  </span>
                  <div className="flex gap-2">
                    {(PRESET_PHOTOS[category] || PRESET_PHOTOS.road).map((url, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setImageUrl(url);
                          setIsCustomImage(false);
                          setCustomImageUrl('');
                        }}
                        className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                          imageUrl === url && !isCustomImage
                            ? 'border-teal-600 ring-2 ring-teal-200'
                            : 'border-slate-200 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={url} alt={`preset ${i}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 5: Reporter Contact Info */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-teal-600 text-white text-xs flex items-center justify-center font-bold">
                5
              </span>
              <span>ข้อมูลผู้แจ้งเรื่อง (สำหรับเจ้าหน้าที่ติดต่อกลับ)</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่อ-นามสกุล ผู้แจ้ง *
                </label>
                <input
                  type="text"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  className={`w-full text-xs p-2.5 rounded-xl border ${
                    formErrors.reporterName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                  } focus:outline-teal-500`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  เบอร์โทรศัพท์ติดต่อ *
                </label>
                <input
                  type="tel"
                  value={reporterPhone}
                  onChange={(e) => setReporterPhone(e.target.value)}
                  className={`w-full text-xs p-2.5 rounded-xl border ${
                    formErrors.reporterPhone ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                  } focus:outline-teal-500`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  อีเมล (ถ้ามี)
                </label>
                <input
                  type="email"
                  value={reporterEmail}
                  onChange={(e) => setReporterEmail(e.target.value)}
                  placeholder="example@mail.com"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-800 via-emerald-700 to-amber-700 hover:from-emerald-900 hover:to-amber-800 text-white font-semibold text-sm rounded-xl shadow-md shadow-emerald-800/20 active:scale-98 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>กำลังส่งข้อมูลเข้าระบบ อ.ปราสาท...</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>ยืนยันการส่งข้อมูลแจ้งปัญหา</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
