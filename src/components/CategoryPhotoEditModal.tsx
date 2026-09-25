import React, { useState } from 'react';
import {
  X,
  Upload,
  Camera,
  Image as ImageIcon,
  Check,
  RotateCcw,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  FolderOpen,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { CategoryMeta, CategoryType } from '../types';
import { CATEGORIES } from '../data/categories';
import { CategoryIcon } from './CategoryIcon';
import { processAndCompressImage, formatFileSize } from '../utils/imageUpload';

interface CategoryPhotoEditModalProps {
  category: CategoryMeta | null;
  isOpen: boolean;
  onClose: () => void;
  onSavePhoto: (catId: CategoryType, newPhotoUrl: string) => Promise<void> | void;
  onResetToDefault?: (catId: CategoryType) => Promise<void> | void;
}

export const CategoryPhotoEditModal: React.FC<CategoryPhotoEditModalProps> = ({
  category,
  isOpen,
  onClose,
  onSavePhoto,
  onResetToDefault,
}) => {
  if (!isOpen || !category) return null;

  const defaultMeta = CATEGORIES.find((c) => c.id === category.id) || category;
  const defaultPhotoUrl = defaultMeta.realPhotoUrl;

  const [previewUrl, setPreviewUrl] = useState<string>(category.realPhotoUrl);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadInfo, setUploadInfo] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Handle uploaded file
  const handleProcessFile = async (file: File) => {
    setIsProcessing(true);
    setErrorMessage(null);
    setUploadInfo(null);

    try {
      const result = await processAndCompressImage(file, 960, 960, 0.76);
      setPreviewUrl(result.dataUrl);
      setUploadInfo(
        `อัปโหลด ${result.fileName} สำเร็จ (${formatFileSize(result.originalSize)} → ${formatFileSize(result.compressedSize)} ประหยัด ${result.reductionPercentage}%)`
      );
    } catch (err: any) {
      console.error('Failed to process category photo:', err);
      setErrorMessage(err.message || 'เกิดข้อผิดพลาดในการโหลดรูปภาพ');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleSave = async () => {
    if (!previewUrl) return;
    setIsSaving(true);
    try {
      await onSavePhoto(category.id, previewUrl);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'ไม่สามารถบันทึกภาพหมวดหมู่ได้');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    setPreviewUrl(defaultPhotoUrl);
    setUploadInfo('รีเซ็ตเป็นภาพถ่ายตั้งต้นของระบบเรียบร้อย (กดบันทึกเพื่อยืนยัน)');
    if (onResetToDefault) {
      try {
        await onResetToDefault(category.id);
      } catch (e) {
        console.warn('Reset default failed:', e);
      }
    }
  };

  const hasChanged = previewUrl !== category.realPhotoUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-xs shrink-0"
              style={{ backgroundColor: category.color }}
            >
              <CategoryIcon category={category.id} size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900">
                  เปลี่ยนภาพหมวดหมู่: {category.label}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  สิทธิ์แอดมิน
                </span>
              </div>
              <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                {category.description}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            title="ปิดหน้าต่าง"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5 flex-1">
          {/* Instruction banner */}
          <div className="p-3 bg-teal-50/80 border border-teal-200 rounded-2xl flex items-start gap-2.5 text-xs text-teal-900">
            <Sparkles size={16} className="text-teal-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>อัปโหลดภาพจริงจากเครื่อง:</strong> ภาพนี้จะแสดงบนการ์ดหมวดหมู่ในหน้าหลักและหน้าแจ้งเรื่องของประชาชนทุกคน ระบบจะบีบอัดภาพให้อัตโนมัติ โหลดไวและไม่เปลืองพื้นที่ฐานข้อมูล
            </div>
          </div>

          {/* Current vs New Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Eye size={14} className="text-emerald-700" />
                <span>ตัวอย่างการแสดงผลบนหน้าเว็บประชาชน</span>
              </span>
              {hasChanged && (
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  มีการเลือกภาพใหม่
                </span>
              )}
            </div>

            <div className="relative rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-100 aspect-16/9 sm:aspect-21/9 shadow-inner group">
              <img
                src={previewUrl}
                alt={category.label}
                className="w-full h-full object-cover transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

              {/* Badge overlay simulating real citizen card */}
              <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/75 text-emerald-300 backdrop-blur-xs border border-white/20 flex items-center gap-1">
                  <Camera size={11} className="text-emerald-400" />
                  <span>ภาพจริงชุมชน</span>
                </span>
              </div>

              <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between pointer-events-none">
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-md shrink-0"
                    style={{ backgroundColor: category.color }}
                  >
                    <CategoryIcon category={category.id} size={15} />
                  </div>
                  <span className="text-sm sm:text-base font-extrabold text-white drop-shadow-md">
                    {category.label}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Upload Area: Drag & Drop + Buttons */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-3xl p-5 sm:p-6 text-center transition-all ${
              isDragging
                ? 'border-emerald-500 bg-emerald-50/70 ring-4 ring-emerald-100 scale-[1.01]'
                : 'border-slate-300 bg-slate-50/60 hover:border-emerald-400 hover:bg-slate-50'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2 shadow-2xs">
              <Upload size={24} />
            </div>

            <h4 className="text-sm font-bold text-slate-800">
              ลากไฟล์รูปภาพมาวางที่นี่ หรือกดเลือกจากเครื่อง
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              รองรับไฟล์ JPG, PNG, WebP, GIF จากคอมพิวเตอร์หรือโทรศัพท์มือถือ
            </p>

            {/* Status Feedback */}
            {isProcessing && (
              <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-center gap-2 animate-pulse">
                <RefreshCw size={15} className="animate-spin text-emerald-600" />
                <span className="font-semibold">กำลังอ่านและย่อขนาดรูปภาพจากเครื่อง...</span>
              </div>
            )}

            {uploadInfo && !isProcessing && (
              <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                <span className="font-medium">{uploadInfo}</span>
              </div>
            )}

            {errorMessage && !isProcessing && (
              <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center justify-center gap-2">
                <AlertCircle size={15} className="text-rose-600 shrink-0" />
                <span className="font-medium">{errorMessage}</span>
              </div>
            )}

            {/* Upload Buttons */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
              <label className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-md active:scale-95">
                <FolderOpen size={16} />
                <span>📁 เลือกรูปจากเครื่อง / แกลเลอรี</span>
                <input
                  type="file"
                  accept="image/*,.jpg,.jpeg,.png,.webp,.gif,.bmp"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </label>

              <label className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold cursor-pointer transition-all active:scale-95">
                <Camera size={16} className="text-slate-600" />
                <span>📸 ถ่ายรูปสดด้วยกล้อง</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </label>

              {previewUrl !== defaultPhotoUrl && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
                  title="คืนค่าเป็นรูปถ่ายตั้งต้นของหมวดหมู่นี้"
                >
                  <RotateCcw size={14} />
                  <span>รีเซ็ตเป็นภาพตั้งต้น</span>
                </button>
              )}
            </div>
          </div>

          {/* Preset Photo Examples for this category */}
          {defaultMeta.photoExamples && defaultMeta.photoExamples.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <ImageIcon size={14} className="text-slate-500" />
                <span>หรือเลือกจากชุดภาพตัวอย่างเหตุการณ์จริงของหมวดหมู่นี้:</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {defaultMeta.photoExamples.map((ex, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setPreviewUrl(ex.url);
                      setUploadInfo(`เลือกตัวอย่าง: ${ex.title}`);
                    }}
                    className={`group relative rounded-xl overflow-hidden border-2 aspect-4/3 text-left transition-all cursor-pointer ${
                      previewUrl === ex.url
                        ? 'border-emerald-600 ring-2 ring-emerald-200 scale-[1.02]'
                        : 'border-slate-200 hover:border-emerald-400'
                    }`}
                  >
                    <img
                      src={ex.url}
                      alt={ex.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1.5">
                      <span className="text-[10px] text-white font-medium line-clamp-1">
                        {ex.title}
                      </span>
                    </div>
                    {previewUrl === ex.url && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3 sticky bottom-0 rounded-b-3xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            ยกเลิก
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || isProcessing}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? (
              <>
                <RefreshCw size={15} className="animate-spin" />
                <span>กำลังบันทึกภาพหมวดหมู่...</span>
              </>
            ) : (
              <>
                <Check size={16} />
                <span>บันทึกภาพหมวดหมู่ใหม่</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
