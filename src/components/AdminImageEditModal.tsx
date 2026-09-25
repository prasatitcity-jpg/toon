import React, { useState } from 'react';
import {
  X,
  Upload,
  Camera,
  Image as ImageIcon,
  Check,
  Trash2,
  ExternalLink,
  Sparkles,
  Layers,
  ArrowRight,
  Eye,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
  FolderOpen,
} from 'lucide-react';
import { Issue, User } from '../types';
import { CATEGORIES } from '../data/categories';
import { CategoryIcon } from './CategoryIcon';
import { StatusBadge } from './StatusBadge';
import { processAndCompressImage, formatFileSize } from '../utils/imageUpload';

interface AdminImageEditModalProps {
  issue: Issue | null;
  currentUser: User;
  onClose: () => void;
  onSave: (updatedIssue: Issue) => void | Promise<void>;
}

type ImageTab = 'before' | 'after' | 'additional' | 'compare';

export const AdminImageEditModal: React.FC<AdminImageEditModalProps> = ({
  issue,
  currentUser,
  onClose,
  onSave,
}) => {
  if (!issue) return null;

  const categoryMeta = CATEGORIES.find((c) => c.id === issue.category) || CATEGORIES[0];

  // Active sub-tab in the editor
  const [activeTab, setActiveTab] = useState<ImageTab>('before');

  // Form states
  const [beforeImage, setBeforeImage] = useState<string>(issue.imageUrl || '');
  const [beforeCaption, setBeforeCaption] = useState<string>(issue.imageCaption || '');

  const [afterImage, setAfterImage] = useState<string>(issue.afterImageUrl || '');
  const [afterCaption, setAfterCaption] = useState<string>(issue.afterImageCaption || '');

  const [additionalImages, setAdditionalImages] = useState<string[]>(
    issue.additionalImages ? [...issue.additionalImages] : []
  );

  const [adminNote, setAdminNote] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [previewZoom, setPreviewZoom] = useState<string | null>(null);

  // Upload feedback and drag-drop states
  const [uploadingTarget, setUploadingTarget] = useState<'before' | 'after' | 'additional' | null>(null);
  const [uploadSuccessInfo, setUploadSuccessInfo] = useState<{ message: string; target: string } | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOverTarget, setDragOverTarget] = useState<'before' | 'after' | 'additional' | null>(null);

  // Common preset photos for community repairs
  const SAMPLE_REPAIR_PHOTOS = [
    {
      title: 'ถนนลาดยางแอสฟัลต์ซ่อมเสร็จเรียบร้อย',
      url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop&q=80',
    },
    {
      title: 'ถนนคอนกรีตเสริมเหล็กพื้นผิวเรียบเสร็จสมบูรณ์',
      url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&auto=format&fit=crop&q=80',
    },
    {
      title: 'โคมไฟถนนส่องสว่างติดสว่างแล้ว',
      url: 'https://images.unsplash.com/photo-1508873696983-2df5293cb325?w=800&auto=format&fit=crop&q=80',
    },
    {
      title: 'พื้นที่เก็บกวาดขยะสะอาดเรียบร้อย',
      url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&auto=format&fit=crop&q=80',
    },
    {
      title: 'ตัดแต่งกิ่งไม้เปิดทางสัญจรปลอดภัย',
      url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format&fit=crop&q=80',
    },
  ];

  // Category specific preset samples
  const categorySamples = categoryMeta.photoExamples || [];

  // Process uploaded files with automatic compression
  const processUploadedFiles = async (
    files: FileList | File[],
    target: 'before' | 'after' | 'additional'
  ) => {
    if (!files || files.length === 0) return;
    setUploadingTarget(target);
    setUploadError(null);
    setUploadSuccessInfo(null);

    try {
      if (target === 'additional') {
        const results: string[] = [];
        let totalOriginal = 0;
        let totalCompressed = 0;

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const res = await processAndCompressImage(file);
          results.push(res.dataUrl);
          totalOriginal += res.originalSize;
          totalCompressed += res.compressedSize;
        }

        setAdditionalImages((prev) => [...prev, ...results]);
        setUploadSuccessInfo({
          target,
          message: `เพิ่ม ${results.length} รูปจากเครื่องสำเร็จ (ขนาดรวม ${formatFileSize(totalOriginal)} → ${formatFileSize(totalCompressed)})`,
        });
      } else {
        const file = files[0];
        const res = await processAndCompressImage(file);
        if (target === 'before') {
          setBeforeImage(res.dataUrl);
        } else if (target === 'after') {
          setAfterImage(res.dataUrl);
        }
        setUploadSuccessInfo({
          target,
          message: `อัปโหลด ${res.fileName} จากเครื่องสำเร็จ (${formatFileSize(res.originalSize)} → ${formatFileSize(res.compressedSize)} ประหยัด ${res.reductionPercentage}%)`,
        });
      }
    } catch (err: any) {
      console.error('Image upload failed:', err);
      setUploadError(err.message || 'เกิดข้อผิดพลาดในการอัปโหลดรูปภาพจากอุปกรณ์');
    } finally {
      setUploadingTarget(null);
    }
  };

  // File input change handler
  const handleFileInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'before' | 'after' | 'additional'
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      processUploadedFiles(e.target.files, target);
      e.target.value = '';
    }
  };

  // Drag and drop handlers
  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    target: 'before' | 'after' | 'additional'
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverTarget(null);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processUploadedFiles(e.dataTransfer.files, target);
    }
  };

  const handleDragOver = (
    e: React.DragEvent<HTMLDivElement>,
    target: 'before' | 'after' | 'additional'
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverTarget(target);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverTarget(null);
  };

  // Add URL image
  const handleAddUrlImage = (target: 'before' | 'after' | 'additional') => {
    if (!urlInput.trim()) return;
    const url = urlInput.trim();

    if (target === 'before') {
      setBeforeImage(url);
    } else if (target === 'after') {
      setAfterImage(url);
    } else if (target === 'additional') {
      setAdditionalImages((prev) => [...prev, url]);
    }
    setUrlInput('');
  };

  // Remove additional image
  const handleRemoveAdditionalImage = (index: number) => {
    setAdditionalImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Save changes
  const handleSave = async () => {
    setIsSaving(true);
    const now = new Date().toISOString();

    const timeline = [...issue.timeline];
    const imageChangesDesc: string[] = [];

    if (beforeImage !== issue.imageUrl) {
      imageChangesDesc.push('แก้ไขภาพที่ประชาชนแจ้ง');
    }
    if (afterImage !== (issue.afterImageUrl || '')) {
      imageChangesDesc.push(afterImage ? 'เปลี่ยนภาพหลังดำเนินการ' : 'ลบภาพหลังดำเนินการ');
    }
    if (additionalImages.length !== (issue.additionalImages?.length || 0)) {
      imageChangesDesc.push(`ปรับรูปภาพเพิ่มเติม (${additionalImages.length} รูป)`);
    }

    if (imageChangesDesc.length > 0 || adminNote.trim()) {
      timeline.push({
        id: `tl-img-${Date.now()}`,
        status: issue.status,
        title: `แอดมินแก้ไขข้อมูลรูปภาพ (${imageChangesDesc.join(', ') || 'อัปเดตรูปภาพ'})`,
        note: adminNote.trim() ? adminNote.trim() : undefined,
        timestamp: now,
        actor: currentUser.name || 'แอดมินศูนย์รับเรื่อง',
        actorRole: 'officer',
        photoUrl:
          afterImage && !afterImage.startsWith('data:')
            ? afterImage
            : beforeImage && !beforeImage.startsWith('data:')
            ? beforeImage
            : undefined,
      });
    }

    const updatedIssue: Issue = {
      ...issue,
      imageUrl: beforeImage,
      ...(afterImage ? { afterImageUrl: afterImage } : { afterImageUrl: undefined }),
      additionalImages: additionalImages.length > 0 ? additionalImages : undefined,
      imageCaption: beforeCaption.trim() ? beforeCaption.trim() : undefined,
      afterImageCaption: afterCaption.trim() ? afterCaption.trim() : undefined,
      updatedAt: now,
      timeline,
    };

    try {
      await onSave(updatedIssue);
      setIsSaving(false);
      onClose();
    } catch (err) {
      console.error('Failed to save image changes:', err);
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/70 backdrop-blur-xs">
      <div
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-6 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-linear-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
              style={{ backgroundColor: categoryMeta.color }}
            >
              <CategoryIcon category={issue.category} size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-teal-400/20 text-teal-300 border border-teal-400/30">
                  {issue.ticketCode}
                </span>
                <span className="text-xs bg-slate-700/80 text-slate-200 px-2 py-0.5 rounded-md font-medium">
                  {categoryMeta.label}
                </span>
                <StatusBadge status={issue.status} size="sm" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-1 line-clamp-1">
                แก้ไขข้อมูลรูปภาพและสื่อประกอบ: {issue.title}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-700/60 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-2 pt-3 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('before')}
            className={`pb-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'before'
                ? 'border-teal-600 text-teal-700 bg-white rounded-t-xl shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera size={14} className={activeTab === 'before' ? 'text-teal-600' : 'text-slate-400'} />
            <span>1. ภาพที่ประชาชนแจ้ง (ภาพก่อนซ่อม)</span>
            {beforeImage && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('after')}
            className={`pb-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'after'
                ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-xl shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 size={14} className={activeTab === 'after' ? 'text-emerald-600' : 'text-slate-400'} />
            <span>2. ภาพหลังดำเนินการ (ผลงานซ่อม)</span>
            {afterImage && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('additional')}
            className={`pb-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'additional'
                ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-xl shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers size={14} className={activeTab === 'additional' ? 'text-indigo-600' : 'text-slate-400'} />
            <span>3. ภาพเพิ่มเติม ({additionalImages.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('compare')}
            className={`pb-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'compare'
                ? 'border-sky-600 text-sky-700 bg-white rounded-t-xl shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye size={14} className={activeTab === 'compare' ? 'text-sky-600' : 'text-slate-400'} />
            <span>4. ดูเปรียบเทียบก่อน-หลัง</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1 bg-slate-50/50">
          {/* ========================================================================= */}
          {/* TAB 1: BEFORE IMAGE (ภาพที่ประชาชนแจ้ง) */}
          {/* ========================================================================= */}
          {activeTab === 'before' && (
            <div className="space-y-6">
              <div className="bg-amber-50/70 border border-amber-200/80 p-3.5 rounded-2xl flex items-center justify-between text-xs text-amber-900">
                <div className="flex items-center gap-2">
                  <Camera size={16} className="text-amber-700 shrink-0" />
                  <span>
                    <strong>ภาพที่ประชาชนแจ้ง:</strong> รูปภาพหลักที่แสดงสภาพปัญหาจุดเกิดเหตุ
                    แอดมินสามารถเปลี่ยนรูปภาพ แนบภาพถ่ายใหม่ หรือใส่ภาพตัวอย่างจริงได้
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Image Preview Card */}
                <div className="md:col-span-6 space-y-3">
                  <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                    <div className="px-3 py-2 bg-slate-800 text-white text-xs font-semibold flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <ImageIcon size={14} className="text-amber-400" />
                        <span>ตัวอย่างภาพปัจจุบัน</span>
                      </span>
                      {beforeImage && (
                        <button
                          type="button"
                          onClick={() => setPreviewZoom(beforeImage)}
                          className="text-[10px] text-teal-300 hover:text-teal-100 flex items-center gap-1"
                        >
                          <Eye size={11} /> ขยายดูภาพเต็ม
                        </button>
                      )}
                    </div>

                    <div className="relative h-64 bg-slate-100 flex items-center justify-center overflow-hidden">
                      {beforeImage ? (
                        <img
                          src={beforeImage}
                          alt="ภาพที่ประชาชนแจ้ง"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-6 text-slate-400">
                          <ImageIcon size={44} className="mx-auto text-slate-300 mb-2" />
                          <p className="text-xs font-bold text-slate-600">ยังไม่มีรูปภาพ</p>
                          <p className="text-[11px] text-slate-400 mt-1">
                            เลือกอัปโหลดรูปภาพ หรือเลือกจากภาพตัวอย่างด้านขวา
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-500 truncate">
                        {beforeImage.startsWith('data:') ? 'ภาพถ่ายจากเครื่อง / กล้อง' : beforeImage || 'ไม่มีภาพ'}
                      </span>
                      {beforeImage && (
                        <button
                          type="button"
                          onClick={() => setBeforeImage('')}
                          className="px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 flex items-center gap-1 shrink-0"
                        >
                          <Trash2 size={12} /> ลบรูปภาพ
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Caption */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      คำอธิบาย / รายละเอียดประกอบภาพ:
                    </label>
                    <input
                      type="text"
                      value={beforeCaption}
                      onChange={(e) => setBeforeCaption(e.target.value)}
                      placeholder="เช่น สภาพผิวถนนแตกลึกประมาณ 15 ซม. ใกล้ปากซอย 2"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-teal-500 shadow-2xs"
                    />
                  </div>
                </div>

                {/* Image Change & Upload Actions */}
                <div className="md:col-span-6 space-y-4">
                  {/* Upload from Device / Machine / Drag-and-Drop */}
                  <div
                    onDragOver={(e) => handleDragOver(e, 'before')}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, 'before')}
                    className={`bg-white p-4 rounded-2xl border-2 transition-all space-y-3 ${
                      dragOverTarget === 'before'
                        ? 'border-teal-500 bg-teal-50/60 ring-4 ring-teal-100 scale-[1.01]'
                        : 'border-slate-200 shadow-2xs hover:border-teal-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Upload size={14} className="text-teal-600" />
                        <span>วิธีที่ 1: อัปโหลดรูปภาพจากเครื่อง / ลากวางไฟล์</span>
                      </h4>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                        ⚡ บีบอัดเร็วทันใจ
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      เลือกรูปภาพจากเครื่องคอมพิวเตอร์ มือถือ หรือลากไฟล์มาวาง รองรับ JPG, PNG, WebP, GIF ระบบปรับขนาดอัตโนมัติ ไม่เปลืองเนื้อที่
                    </p>

                    {/* Progress indicator */}
                    {uploadingTarget === 'before' && (
                      <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-center gap-2.5 text-xs text-teal-800 animate-pulse">
                        <RefreshCw size={15} className="animate-spin text-teal-600 shrink-0" />
                        <span className="font-semibold">กำลังอ่านและย่อขนาดรูปภาพจากเครื่อง...</span>
                      </div>
                    )}

                    {/* Success message */}
                    {uploadSuccessInfo && uploadSuccessInfo.target === 'before' && (
                      <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800">
                        <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                        <span className="font-medium">{uploadSuccessInfo.message}</span>
                      </div>
                    )}

                    {/* Error message */}
                    {uploadError && uploadingTarget === null && (
                      <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
                        <AlertCircle size={15} className="text-rose-600 shrink-0" />
                        <span className="font-medium">{uploadError}</span>
                      </div>
                    )}

                    {/* Dual Action Buttons: 1) Local Device/Gallery, 2) Camera */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <label className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border-2 border-dashed border-teal-500 bg-teal-50/70 hover:bg-teal-100/70 text-teal-800 text-xs font-bold cursor-pointer transition-colors text-center shadow-2xs">
                        <FolderOpen size={16} className="text-teal-700 shrink-0" />
                        <span>📁 เลือกรูปจากเครื่อง / แกลเลอรี</span>
                        <input
                          type="file"
                          accept="image/*,.jpg,.jpeg,.png,.webp,.gif,.bmp"
                          onChange={(e) => handleFileInputChange(e, 'before')}
                          className="hidden"
                        />
                      </label>

                      <label className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer transition-colors text-center">
                        <Camera size={16} className="text-slate-600 shrink-0" />
                        <span>📸 ถ่ายภาพสดด้วยกล้อง</span>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={(e) => handleFileInputChange(e, 'before')}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Enter Direct URL */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <ExternalLink size={14} className="text-indigo-600" />
                      <span>วิธีที่ 2: วางลิงก์รูปภาพโดยตรง (Image URL)</span>
                    </h4>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="flex-1 text-xs p-2 rounded-xl border border-slate-300 bg-white focus:outline-teal-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddUrlImage('before')}
                        disabled={!urlInput.trim()}
                        className="px-3 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl transition-colors cursor-pointer"
                      >
                        ใส่รูปภาพ
                      </button>
                    </div>
                  </div>

                  {/* Presets by Category */}
                  {categorySamples.length > 0 && (
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
                      <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Sparkles size={14} className="text-amber-500" />
                        <span>วิธีที่ 3: เลือกจากคลังภาพตัวอย่างหมวดหมู่นี้ ({categoryMeta.label})</span>
                      </h4>
                      <div className="grid grid-cols-3 gap-2">
                        {categorySamples.map((sample, idx) => (
                          <div
                            key={idx}
                            onClick={() => {
                              setBeforeImage(sample.url);
                              if (sample.description) setBeforeCaption(sample.description);
                            }}
                            className={`group relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all aspect-4/3 ${
                              beforeImage === sample.url
                                ? 'border-teal-600 ring-2 ring-teal-200 scale-102'
                                : 'border-slate-200 hover:border-teal-400'
                            }`}
                          >
                            <img
                              src={sample.url}
                              alt={sample.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-slate-900/80 via-transparent to-transparent flex items-end p-1.5">
                              <span className="text-[10px] text-white font-medium line-clamp-1">
                                {sample.title}
                              </span>
                            </div>
                            {beforeImage === sample.url && (
                              <div className="absolute top-1 right-1 bg-teal-600 text-white p-1 rounded-full">
                                <Check size={10} strokeWidth={3} />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: AFTER IMAGE (ภาพหลังดำเนินการ) */}
          {/* ========================================================================= */}
          {activeTab === 'after' && (
            <div className="space-y-6">
              <div className="bg-emerald-50/70 border border-emerald-200/80 p-3.5 rounded-2xl flex items-center justify-between text-xs text-emerald-900">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
                  <span>
                    <strong>ภาพหลังดำเนินการ (ผลงานแก้ไข):</strong> รูปภาพแสดงผลงานการเข้าซ่อมแซม
                    บำรุงรักษา หรือแก้ไขจุดเกิดเหตุแล้วเสร็จ เพื่อแจ้งผลต่อประชาชนและบันทึกประวัติ
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Image Preview Card */}
                <div className="md:col-span-6 space-y-3">
                  <div className="border border-emerald-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                    <div className="px-3 py-2 bg-emerald-800 text-white text-xs font-semibold flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 size={14} className="text-emerald-300" />
                        <span>ตัวอย่างภาพผลงานปัจจุบัน</span>
                      </span>
                      {afterImage && (
                        <button
                          type="button"
                          onClick={() => setPreviewZoom(afterImage)}
                          className="text-[10px] text-emerald-200 hover:text-white flex items-center gap-1"
                        >
                          <Eye size={11} /> ขยายดูภาพเต็ม
                        </button>
                      )}
                    </div>

                    <div className="relative h-64 bg-slate-100 flex items-center justify-center overflow-hidden">
                      {afterImage ? (
                        <img
                          src={afterImage}
                          alt="ภาพหลังดำเนินการ"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-6 text-slate-400">
                          <CheckCircle2 size={44} className="mx-auto text-slate-300 mb-2" />
                          <p className="text-xs font-bold text-slate-600">ยังไม่มีภาพหลังดำเนินการ</p>
                          <p className="text-[11px] text-slate-400 mt-1">
                            เลือกอัปโหลดรูปภาพผลงาน หรือเลือกจากตัวอย่างงานซ่อมด้านขวา
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-500 truncate">
                        {afterImage.startsWith('data:') ? 'ภาพถ่ายจากเครื่อง / กล้อง' : afterImage || 'ยังไม่ได้แนบภาพ'}
                      </span>
                      {afterImage && (
                        <button
                          type="button"
                          onClick={() => setAfterImage('')}
                          className="px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 flex items-center gap-1 shrink-0"
                        >
                          <Trash2 size={12} /> ลบรูปภาพผลงาน
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Caption */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      คำอธิบายผลงานการแก้ไข:
                    </label>
                    <input
                      type="text"
                      value={afterCaption}
                      onChange={(e) => setAfterCaption(e.target.value)}
                      placeholder="เช่น ทีมช่างโยธาเทศบาลตำบลกังแอนลงพื้นที่ปูแอสฟัลต์เรียบร้อย"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-teal-500 shadow-2xs"
                    />
                  </div>
                </div>

                {/* Upload & Choose After Image */}
                <div className="md:col-span-6 space-y-4">
                  {/* Upload from Device / Machine / Drag-and-Drop */}
                  <div
                    onDragOver={(e) => handleDragOver(e, 'after')}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, 'after')}
                    className={`bg-white p-4 rounded-2xl border-2 transition-all space-y-3 ${
                      dragOverTarget === 'after'
                        ? 'border-emerald-500 bg-emerald-50/60 ring-4 ring-emerald-100 scale-[1.01]'
                        : 'border-slate-200 shadow-2xs hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Upload size={14} className="text-emerald-600" />
                        <span>วิธีที่ 1: อัปโหลดภาพผลงานจากเครื่อง / ลากวางไฟล์</span>
                      </h4>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        ⚡ บีบอัดเร็วทันใจ
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      ถ่ายรูปหน้างานหลังช่างซ่อมเสร็จ หรือเลือกภาพผลงานจากอุปกรณ์/คอมพิวเตอร์ รองรับ JPG, PNG, WebP
                    </p>

                    {/* Progress indicator */}
                    {uploadingTarget === 'after' && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800 animate-pulse">
                        <RefreshCw size={15} className="animate-spin text-emerald-600 shrink-0" />
                        <span className="font-semibold">กำลังอ่านและย่อขนาดภาพผลงานจากเครื่อง...</span>
                      </div>
                    )}

                    {/* Success message */}
                    {uploadSuccessInfo && uploadSuccessInfo.target === 'after' && (
                      <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800">
                        <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                        <span className="font-medium">{uploadSuccessInfo.message}</span>
                      </div>
                    )}

                    {/* Error message */}
                    {uploadError && uploadingTarget === null && (
                      <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
                        <AlertCircle size={15} className="text-rose-600 shrink-0" />
                        <span className="font-medium">{uploadError}</span>
                      </div>
                    )}

                    {/* Dual Action Buttons: 1) Local Device/Gallery, 2) Camera */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <label className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border-2 border-dashed border-emerald-500 bg-emerald-50/70 hover:bg-emerald-100/70 text-emerald-800 text-xs font-bold cursor-pointer transition-colors text-center shadow-2xs">
                        <FolderOpen size={16} className="text-emerald-700 shrink-0" />
                        <span>📁 เลือกรูปผลงานจากเครื่อง</span>
                        <input
                          type="file"
                          accept="image/*,.jpg,.jpeg,.png,.webp,.gif,.bmp"
                          onChange={(e) => handleFileInputChange(e, 'after')}
                          className="hidden"
                        />
                      </label>

                      <label className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer transition-colors text-center">
                        <Camera size={16} className="text-slate-600 shrink-0" />
                        <span>📸 ถ่ายภาพสดหน้างาน</span>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={(e) => handleFileInputChange(e, 'after')}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Enter Direct URL */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <ExternalLink size={14} className="text-indigo-600" />
                      <span>วิธีที่ 2: วางลิงก์รูปผลงานโดยตรง (Image URL)</span>
                    </h4>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="flex-1 text-xs p-2 rounded-xl border border-slate-300 bg-white focus:outline-teal-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddUrlImage('after')}
                        disabled={!urlInput.trim()}
                        className="px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl transition-colors cursor-pointer"
                      >
                        ใส่รูปผลงาน
                      </button>
                    </div>
                  </div>

                  {/* Sample Repair Photos */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Sparkles size={14} className="text-emerald-600" />
                      <span>วิธีที่ 3: เลือกภาพตัวอย่างงานซ่อมแซมสำเร็จ</span>
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      {SAMPLE_REPAIR_PHOTOS.map((sample, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setAfterImage(sample.url);
                            setAfterCaption(sample.title);
                          }}
                          className={`group relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all aspect-4/3 ${
                            afterImage === sample.url
                              ? 'border-emerald-600 ring-2 ring-emerald-200 scale-102'
                              : 'border-slate-200 hover:border-emerald-400'
                          }`}
                        >
                          <img
                            src={sample.url}
                            alt={sample.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-linear-to-t from-slate-900/80 via-transparent to-transparent flex items-end p-1.5">
                            <span className="text-[10px] text-white font-medium line-clamp-1">
                              {sample.title}
                            </span>
                          </div>
                          {afterImage === sample.url && (
                            <div className="absolute top-1 right-1 bg-emerald-600 text-white p-1 rounded-full">
                              <Check size={10} strokeWidth={3} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: ADDITIONAL PHOTOS (ภาพเพิ่มเติม) */}
          {/* ========================================================================= */}
          {activeTab === 'additional' && (
            <div className="space-y-6">
              {/* Header with dual upload actions */}
              <div className="bg-indigo-50/80 border border-indigo-200/90 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-indigo-950">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <Layers size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">รูปภาพเพิ่มเติมประกอบคำร้อง</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      แนบภาพถ่ายมุมอื่น ๆ ภาพขณะซ่อม หรือเอกสารหลักฐาน เลือกได้หลายไฟล์พร้อมกันจากเครื่อง
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <label className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-2xs">
                    <FolderOpen size={15} />
                    <span>📁 เลือกรูปจากเครื่อง (เลือกได้หลายภาพ)</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*,.jpg,.jpeg,.png,.webp,.gif,.bmp"
                      onChange={(e) => handleFileInputChange(e, 'additional')}
                      className="hidden"
                    />
                  </label>

                  <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-indigo-50 text-indigo-800 border border-indigo-300 rounded-xl text-xs font-semibold cursor-pointer transition-colors">
                    <Camera size={15} />
                    <span>📸 ถ่ายรูป</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => handleFileInputChange(e, 'additional')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Drag and Drop Zone for Additional Photos */}
              <div
                onDragOver={(e) => handleDragOver(e, 'additional')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'additional')}
                className={`p-4 rounded-2xl border-2 border-dashed transition-all text-center ${
                  dragOverTarget === 'additional'
                    ? 'border-indigo-500 bg-indigo-50/80 ring-4 ring-indigo-100 scale-[1.01]'
                    : 'border-indigo-200 bg-indigo-50/30 hover:border-indigo-400'
                }`}
              >
                <Upload size={22} className="mx-auto text-indigo-600 mb-1" />
                <p className="text-xs font-bold text-slate-800">
                  ลากไฟล์รูปภาพมาวางที่นี่ หรือกดปุ่ม &quot;เลือกรูปจากเครื่อง&quot; ด้านบน
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  เลือกครั้งละหลายรูปได้ ระบบจะบีบอัดและปรับคุณภาพให้อัตโนมัติ ปลอดภัยต่อฐานข้อมูล
                </p>
              </div>

              {/* Progress and status */}
              {uploadingTarget === 'additional' && (
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center gap-2.5 text-xs text-indigo-800 animate-pulse">
                  <RefreshCw size={15} className="animate-spin text-indigo-600 shrink-0" />
                  <span className="font-semibold">กำลังประมวลผลและย่อขนาดรูปภาพจากเครื่อง...</span>
                </div>
              )}

              {uploadSuccessInfo && uploadSuccessInfo.target === 'additional' && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800">
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                  <span className="font-medium">{uploadSuccessInfo.message}</span>
                </div>
              )}

              {uploadError && uploadingTarget === null && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
                  <AlertCircle size={15} className="text-rose-600 shrink-0" />
                  <span className="font-medium">{uploadError}</span>
                </div>
              )}

              {/* Gallery of Additional Images */}
              {additionalImages.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {additionalImages.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className="group relative bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-2xs aspect-4/3 flex flex-col justify-between"
                    >
                      <img
                        src={imgUrl}
                        alt={`ภาพเพิ่มเติมที่ ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewZoom(imgUrl)}
                          className="p-1.5 bg-white/90 text-slate-800 rounded-lg hover:bg-white text-xs font-semibold cursor-pointer"
                          title="ดูภาพเต็ม"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveAdditionalImage(idx)}
                          className="p-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 text-xs font-semibold cursor-pointer"
                          title="ลบภาพนี้"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="absolute bottom-1 left-1 bg-slate-900/70 text-white text-[10px] px-1.5 py-0.5 rounded font-mono">
                        ภาพที่ {idx + 1}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-10 text-center text-slate-500">
                  <FolderOpen size={40} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-bold text-slate-700">ยังไม่มีรูปภาพเพิ่มเติม</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                    ท่านสามารถอัปโหลดภาพมุมอื่น ๆ จากเครื่อง หรือเอกสารประกอบคำร้องได้หลายภาพพร้อมกัน
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl cursor-pointer transition-colors shadow-2xs">
                      <FolderOpen size={15} />
                      <span>📁 เลือกไฟล์จากเครื่อง (ได้หลายรูป)</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*,.jpg,.jpeg,.png,.webp,.gif,.bmp"
                        onChange={(e) => handleFileInputChange(e, 'additional')}
                        className="hidden"
                      />
                    </label>

                    <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer transition-colors">
                      <Camera size={15} />
                      <span>📸 ถ่ายรูป</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => handleFileInputChange(e, 'additional')}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* Paste URL for additional */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ExternalLink size={14} className="text-indigo-600" />
                  <span>หรือใส่ลิงก์รูปภาพเพิ่มเติม (Image URL)</span>
                </h4>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 text-xs p-2 rounded-xl border border-slate-300 bg-white focus:outline-teal-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddUrlImage('additional')}
                    disabled={!urlInput.trim()}
                    className="px-3.5 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl transition-colors cursor-pointer"
                  >
                    เพิ่มรูปภาพ
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: COMPARE BEFORE & AFTER */}
          {/* ========================================================================= */}
          {activeTab === 'compare' && (
            <div className="space-y-6">
              <div className="bg-sky-50/70 border border-sky-200/80 p-3.5 rounded-2xl flex items-center justify-between text-xs text-sky-900">
                <div className="flex items-center gap-2">
                  <Eye size={16} className="text-sky-700 shrink-0" />
                  <span>
                    <strong>การเปรียบเทียบภาพ ก่อน - หลัง:</strong> ตรวจสอบความถูกต้องของผลงานการแก้ไข
                    เปรียบเทียบสภาพปัญหากับผลงานที่ทีมช่างได้ดำเนินการ
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Before */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                  <div className="px-4 py-2.5 bg-slate-800 text-white text-xs font-bold flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Camera size={14} className="text-amber-400" />
                      <span>ก่อนดำเนินการ (ภาพที่แจ้ง)</span>
                    </span>
                    <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded text-amber-300">
                      สภาพปัญหา
                    </span>
                  </div>
                  <div className="h-64 sm:h-72 bg-slate-100 flex items-center justify-center overflow-hidden">
                    {beforeImage ? (
                      <img
                        src={beforeImage}
                        alt="ภาพก่อนดำเนินการ"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-6 text-slate-400">
                        <ImageIcon size={40} className="mx-auto text-slate-300 mb-1" />
                        <span className="text-xs">ไม่มีรูปภาพ</span>
                      </div>
                    )}
                  </div>
                  {beforeCaption && (
                    <div className="p-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-600">
                      📝 {beforeCaption}
                    </div>
                  )}
                </div>

                {/* After */}
                <div className="border border-emerald-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                  <div className="px-4 py-2.5 bg-emerald-800 text-white text-xs font-bold flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 size={14} className="text-emerald-300" />
                      <span>หลังดำเนินการ (ผลงานแก้ไข)</span>
                    </span>
                    <span className="text-[10px] bg-emerald-700 px-2 py-0.5 rounded text-emerald-100">
                      ผลงานสำเร็จ
                    </span>
                  </div>
                  <div className="h-64 sm:h-72 bg-emerald-50/40 flex items-center justify-center overflow-hidden">
                    {afterImage ? (
                      <img
                        src={afterImage}
                        alt="ภาพหลังดำเนินการ"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-6 text-slate-400">
                        <CheckCircle2 size={40} className="mx-auto text-slate-300 mb-1" />
                        <span className="text-xs">ยังไม่มีภาพผลงานหลังแก้ไข</span>
                      </div>
                    )}
                  </div>
                  {afterCaption && (
                    <div className="p-3 bg-emerald-50/80 border-t border-emerald-100 text-xs text-emerald-800">
                      ✅ {afterCaption}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Admin Audit Log Note */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              บันทึกหมายเหตุการแก้ไขรูปภาพของแอดมิน (จะถูกบันทึกลงใน Timeline ปัญหา):
            </label>
            <input
              type="text"
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="เช่น ได้เปลี่ยนรูปภาพให้ชัดเจนขึ้นจากการลงพื้นที่จริงของ อบต., แนบภาพผลงานซ่อมเสร็จสิ้น..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-teal-500"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            ยกเลิก
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check size={16} />
              )}
              <span>บันทึกการแก้ไขรูปภาพลงฐานข้อมูล</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox Zoom Modal */}
      {previewZoom && (
        <div
          className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setPreviewZoom(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={previewZoom}
              alt="ขยายรูปภาพ"
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
            />
            <button
              type="button"
              onClick={() => setPreviewZoom(null)}
              className="absolute -top-3 -right-3 bg-white text-slate-900 p-2 rounded-full shadow-lg hover:bg-slate-100"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
