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
  Phone,
  ExternalLink,
  Shield,
  Zap,
} from 'lucide-react';
import { CategoryType, Issue, UrgencyLevel, User, CategoryMeta } from '../types';
import { CATEGORIES } from '../data/categories';
import { CategoryIcon } from './CategoryIcon';
import { generateTicketCode } from '../utils/storage';
import { getRecommendedAgencies } from '../data/agencies';
import {
  PRASAT_PROVINCE,
  PRASAT_DISTRICT,
  PRASAT_SUB_DISTRICTS,
  getSubDistrictByName,
  getVillagesBySubDistrict,
} from '../data/prasatLocations';
import { ElephantMascot, PrasatIcon, SurinCommunityBadge } from './SurinMotifs';
import { processAndCompressImage, formatFileSize } from '../utils/imageUpload';
import { CategoryPhotoEditModal } from './CategoryPhotoEditModal';

interface ReportIssueViewProps {
  currentUser: User;
  existingIssues: Issue[];
  onSubmitIssue: (newIssue: Issue) => void;
  onCancel: () => void;
  onViewIssue: (issue: Issue) => void;
  categories?: CategoryMeta[];
  onUpdateCategoryPhoto?: (catId: CategoryType, newPhotoUrl: string) => Promise<void> | void;
  onResetCategoryPhoto?: (catId: CategoryType) => Promise<void> | void;
}

export const ReportIssueView: React.FC<ReportIssueViewProps> = ({
  currentUser,
  existingIssues,
  onSubmitIssue,
  onCancel,
  onViewIssue,
  categories = CATEGORIES,
  onUpdateCategoryPhoto,
  onResetCategoryPhoto,
}) => {
  const [editingCategory, setEditingCategory] = useState<CategoryMeta | null>(null);

  const isOfficer =
    currentUser.role === 'officer' ||
    currentUser.role === 'admin' ||
    currentUser.role === 'staff' ||
    currentUser.role === 'super_admin';

  // Preset photo options populated dynamically from categories with authentic real photography
  const PRESET_PHOTOS: Record<CategoryType, string[]> = categories.reduce((acc, cat) => {
    acc[cat.id] =
      cat.photoExamples && cat.photoExamples.length > 0
        ? cat.photoExamples.map((p) => p.url)
        : [cat.realPhotoUrl];
    return acc;
  }, {} as Record<CategoryType, string[]>);
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
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadMessage(null);

    try {
      const res = await processAndCompressImage(file);
      setImageUrl(res.dataUrl);
      setIsCustomImage(true);
      setUploadMessage(
        `อัปโหลด ${res.fileName} สำเร็จ (${formatFileSize(res.originalSize)} → ${formatFileSize(res.compressedSize)})`
      );
    } catch (err: any) {
      console.error('File upload failed:', err);
      setUploadError(err.message || 'เกิดข้อผิดพลาดในการโหลดรูปภาพ');
    } finally {
      setIsUploading(false);
      e.target.value = '';
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
      ...(reporterEmail.trim() ? { reporterEmail: reporterEmail.trim() } : {}),
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
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <label className="text-sm font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                <span className="w-5 h-5 rounded-full bg-teal-600 text-white text-xs flex items-center justify-center font-bold">
                  1
                </span>
                <span>เลือกประเภทปัญหา *</span>
                {isOfficer && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 shadow-2xs">
                    <Camera size={11} className="text-amber-700" />
                    <span>แอดมิน: เปลี่ยนภาพหมวดหมู่จากเครื่องได้</span>
                  </span>
                )}
              </label>
              <span className="text-xs text-slate-400">เลือก 1 ประเภทที่ตรงที่สุด</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {categories.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <div key={cat.id} className="relative group/card flex flex-col">
                    <button
                      type="button"
                      onClick={() => handleCategorySelect(cat.id)}
                      className={`w-full rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col group cursor-pointer flex-1 ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/80 shadow-md ring-2 ring-emerald-600/30'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                      }`}
                    >
                      {/* Real photo header */}
                      <div className="relative h-24 sm:h-28 w-full bg-slate-100 overflow-hidden">
                        <img
                          src={cat.realPhotoUrl}
                          alt={cat.label}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                        {/* Real photo badge */}
                        <span className="absolute top-2 left-2 text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/70 text-emerald-300 backdrop-blur-xs border border-white/20 flex items-center gap-1 shadow-xs">
                          <Camera size={10} className="text-emerald-400" />
                          <span>ภาพจริง</span>
                        </span>

                        {isSelected && !isOfficer && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md">
                            <Check size={12} strokeWidth={3} />
                          </div>
                        )}

                        <div className="absolute bottom-1.5 left-2.5 right-2.5">
                          <span className="text-xs sm:text-sm font-extrabold text-white drop-shadow-md flex items-center gap-1.5 truncate">
                            <CategoryIcon category={cat.id} size={14} className="shrink-0 text-amber-300" />
                            <span>{cat.label}</span>
                          </span>
                        </div>
                      </div>

                      {/* Card Description */}
                      <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between space-y-2">
                        <p className="text-[11px] text-slate-600 line-clamp-2 leading-snug">
                          {cat.description}
                        </p>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                          <span className="text-[9px] font-semibold text-emerald-800 bg-emerald-100/70 px-1.5 py-0.5 rounded">
                            {cat.photoExamples?.length || 1} ภาพจริง
                          </span>
                          <span
                            className={`text-[10px] font-bold ${
                              isSelected ? 'text-emerald-700' : 'text-slate-400 group-hover:text-slate-600'
                            }`}
                          >
                            {isSelected ? '✓ เลือกแล้ว' : 'คลิกเลือก'}
                          </span>
                        </div>
                      </div>
                    </button>

                    {/* Admin Quick Upload / Change Photo Button */}
                    {isOfficer && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingCategory(cat);
                        }}
                        className="absolute top-2 right-2 z-20 px-2 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-[10px] font-extrabold shadow-md flex items-center gap-1 transition-transform hover:scale-105 active:scale-95 cursor-pointer opacity-90 group-hover/card:opacity-100"
                        title={`แอดมิน: เปลี่ยนภาพหมวดหมู่ "${cat.label}" โดยอัปโหลดจากเครื่อง`}
                      >
                        <Camera size={11} className="text-slate-950 shrink-0" />
                        <span>เปลี่ยนภาพ</span>
                      </button>
                    )}
                  </div>
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

            {/* User Requirement 7: ระบบแนะนำหน่วยงานอัตโนมัติ */}
            {(() => {
              const recommended = getRecommendedAgencies(category, urgency, subDistrict);
              if (!recommended || recommended.length === 0) return null;

              return (
                <div className="bg-gradient-to-r from-amber-50/90 via-emerald-50/60 to-teal-50/80 p-4 rounded-2xl border border-amber-300/80 shadow-2xs">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-amber-600 text-white flex items-center justify-center text-xs font-bold">
                        <Building2 size={14} />
                      </div>
                      <span className="text-xs font-bold text-slate-900">
                        ระบบแนะนำหน่วยงานที่รับผิดชอบโดยตรง (อัตโนมัติ)
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200">
                      ประสานงานรวดเร็ว
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 mb-3">
                    เมื่อส่งเรื่อง ระบบจะส่งการแจ้งเตือนไปยังหน่วยงานเหล่านี้ตามประเภทปัญหา ({CATEGORIES.find((c) => c.id === category)?.label}) และพื้นที่ ต.{subDistrict || 'ปราสาท'}:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {recommended.map((agency) => (
                      <div
                        key={agency.id}
                        className="bg-white/95 p-3 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 truncate">{agency.name}</p>
                          <p className="text-[10px] text-slate-500 line-clamp-1">{agency.responsibility}</p>
                        </div>
                        {agency.hasVerifiedPhone && agency.phone ? (
                          <a
                            href={`tel:${agency.phone.replace(/[^0-9]/g, '')}`}
                            className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shrink-0 shadow-2xs"
                            title={`โทรติดต่อ ${agency.name}`}
                          >
                            <Phone size={12} />
                            <span>โทร {agency.phoneDisplay || agency.phone}</span>
                          </a>
                        ) : (
                          <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-1 rounded shrink-0">
                            ประสานศูนย์ดำรงธรรม
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
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

          {/* Step 4: Photo Upload (User Requirement 5 & 9: Real photos only, no AI) */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-teal-600 text-white text-xs flex items-center justify-center font-bold">
                  4
                </span>
                <span>แนบภาพปัญหาจากสถานที่จริง *</span>
              </label>
              <span className="text-xs text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 font-medium">
                📷 ภาพถ่ายจริงเท่านั้น (ห้ามสร้างด้วย AI)
              </span>
            </div>

            {/* Photo preview & picker */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-6">
                <div className="relative rounded-2xl overflow-hidden border border-slate-300 bg-slate-100 h-52 flex items-center justify-center group">
                  {imageUrl ? (
                    <>
                      <img
                        src={isCustomImage && customImageUrl ? customImageUrl : imageUrl}
                        alt="ภาพจากผู้แจ้ง"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2 left-2 bg-emerald-900/90 text-white px-3 py-1 rounded-lg text-xs font-semibold backdrop-blur-xs flex items-center gap-1.5 shadow-md border border-white/20">
                        <Camera size={13} className="text-amber-300" />
                        <span>ภาพจากผู้แจ้ง</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400">
                      <Camera size={36} className="text-slate-300 mb-2" />
                      <p className="text-xs font-bold text-slate-600">ยังไม่มีภาพจากพื้นที่</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        สามารถอัปโหลดภาพถ่ายจริง หรือส่งเรื่องก่อนได้
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="sm:col-span-6 flex flex-col justify-between space-y-3">
                {/* File Upload from Machine / Camera */}
                <div className="border-2 border-dashed border-teal-300 rounded-2xl p-4 text-center bg-teal-50/40 space-y-2.5">
                  <div className="flex items-center justify-center gap-1.5 text-teal-800 text-xs font-bold">
                    <Upload size={16} className="text-teal-700" />
                    <span>อัปโหลดภาพถ่ายจริงจากเครื่อง หรือถ่ายรูป</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    รองรับไฟล์ JPG, PNG, WebP, GIF ระบบปรับขนาดและบีบอัดอัตโนมัติ ไม่เปลืองเน็ต
                  </p>

                  {/* Upload feedback */}
                  {isUploading && (
                    <div className="p-2 bg-teal-100/70 border border-teal-200 rounded-xl text-xs text-teal-800 flex items-center justify-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-teal-700 border-t-transparent rounded-full animate-spin" />
                      <span>กำลังประมวลผลและย่อขนาดรูปภาพ...</span>
                    </div>
                  )}

                  {uploadMessage && !isUploading && (
                    <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-center gap-1.5">
                      <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                      <span>{uploadMessage}</span>
                    </div>
                  )}

                  {uploadError && !isUploading && (
                    <div className="p-2 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center justify-center gap-1.5">
                      <AlertCircle size={14} className="text-rose-600 shrink-0" />
                      <span>{uploadError}</span>
                    </div>
                  )}

                  {/* Dual Action Buttons: 1) Device Gallery/Files, 2) Live Camera */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <label className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-teal-500 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold cursor-pointer transition-colors shadow-2xs">
                      <Upload size={14} />
                      <span>📁 เลือกรูปจากเครื่อง</span>
                      <input
                        type="file"
                        accept="image/*,.jpg,.jpeg,.png,.webp,.gif,.bmp"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>

                    <label className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer transition-colors">
                      <Camera size={14} className="text-slate-600" />
                      <span>📸 ถ่ายรูปสด</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Preset quick picker for realistic issue photography */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                      <Camera size={13} className="text-emerald-600" />
                      <span>เลือกภาพเหตุการณ์จริง ({CATEGORIES.find((c) => c.id === category)?.label})</span>
                      <span className="text-[10px] font-normal text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        ไม่ใช่ภาพ AI
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setImageUrl('');
                        setIsCustomImage(false);
                      }}
                      className="text-[10px] text-slate-500 hover:text-slate-800 underline"
                    >
                      เลือก "ยังไม่มีภาพ"
                    </button>
                  </div>
                  {(() => {
                    const currentCat = CATEGORIES.find((c) => c.id === category);
                    const examples =
                      currentCat?.photoExamples && currentCat.photoExamples.length > 0
                        ? currentCat.photoExamples
                        : (PRESET_PHOTOS[category] || PRESET_PHOTOS.road).map((url, i) => ({
                            url,
                            title: `ภาพจริง ${i + 1}`,
                            description: 'ภาพถ่ายจากสถานที่จริง',
                          }));

                    return (
                      <div className="grid grid-cols-3 gap-2">
                        {examples.map((item, i) => {
                          const isSelected = imageUrl === item.url && !isCustomImage;
                          return (
                            <button
                              key={i}
                              type="button"
                              onClick={() => {
                                setImageUrl(item.url);
                                setIsCustomImage(false);
                                setCustomImageUrl('');
                              }}
                              className={`rounded-xl overflow-hidden border-2 transition-all text-left flex flex-col group cursor-pointer bg-white ${
                                isSelected
                                  ? 'border-emerald-600 ring-2 ring-emerald-200 shadow-xs'
                                  : 'border-slate-200 hover:border-slate-400 opacity-80 hover:opacity-100'
                              }`}
                            >
                              <div className="relative h-16 w-full bg-slate-100 overflow-hidden">
                                <img
                                  src={item.url}
                                  alt={item.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                />
                                <span className="absolute top-1 left-1 bg-black/70 text-[8px] font-bold text-emerald-300 px-1 py-0.5 rounded backdrop-blur-xs flex items-center gap-0.5">
                                  <Camera size={8} />
                                  <span>ภาพจริง</span>
                                </span>
                                {isSelected && (
                                  <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                                    <Check size={10} strokeWidth={3} />
                                  </div>
                                )}
                              </div>
                              <div className="p-1.5">
                                <p className="text-[10px] font-semibold text-slate-800 line-clamp-1 leading-tight">
                                  {item.title}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })()}
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

      {/* Admin Category Photo Edit Modal */}
      <CategoryPhotoEditModal
        category={editingCategory}
        isOpen={Boolean(editingCategory)}
        onClose={() => setEditingCategory(null)}
        onSavePhoto={async (catId, newUrl) => {
          if (onUpdateCategoryPhoto) {
            await onUpdateCategoryPhoto(catId, newUrl);
          }
        }}
        onResetToDefault={async (catId) => {
          if (onResetCategoryPhoto) {
            await onResetCategoryPhoto(catId);
          }
        }}
      />
    </div>
  );
};
