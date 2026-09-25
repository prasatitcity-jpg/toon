import React, { useState } from 'react';
import {
  X,
  MapPin,
  Calendar,
  User as UserIcon,
  Phone,
  Mail,
  Building,
  CheckCircle,
  Clock,
  Wrench,
  Archive,
  ArrowRight,
  Upload,
  Camera,
  Image as ImageIcon,
  Share2,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { Issue, IssueStatus, User, ContactLogEntry } from '../types';
import { CATEGORIES, STATUSES, DEPARTMENTS } from '../data/categories';
import { CategoryIcon } from './CategoryIcon';
import { StatusBadge } from './StatusBadge';
import { formatThaiDate } from '../utils/storage';
import { MessageSquare, PhoneCall, MessageCircle, Users, CheckCircle2 } from 'lucide-react';
import { AdminImageEditModal } from './AdminImageEditModal';
import { processAndCompressImage } from '../utils/imageUpload';

interface IssueDetailModalProps {
  issue: Issue | null;
  onClose: () => void;
  currentUser: User;
  onUpdateIssue?: (updated: Issue) => void;
}

export const IssueDetailModal: React.FC<IssueDetailModalProps> = ({
  issue,
  onClose,
  currentUser,
  onUpdateIssue,
}) => {
  if (!issue) return null;

  const categoryMeta = CATEGORIES.find((c) => c.id === issue.category) || CATEGORIES[0];
  const isOfficer =
    currentUser.role === 'officer' ||
    currentUser.role === 'admin' ||
    currentUser.role === 'super_admin';

  const [isImageEditModalOpen, setIsImageEditModalOpen] = useState(false);

  // Officer editing state
  const [selectedStatus, setSelectedStatus] = useState<IssueStatus>(issue.status);
  const [officerNoteInput, setOfficerNoteInput] = useState('');
  const [afterImageInput, setAfterImageInput] = useState(issue.afterImageUrl || '');
  const [assignedDept, setAssignedDept] = useState(issue.assignedDepartment || DEPARTMENTS[0]);
  const [assignedOfficerName, setAssignedOfficerName] = useState(
    issue.assignedOfficer || currentUser.name
  );
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // Requirement 6: Officer citizen contact log state
  const [contactChannel, setContactChannel] = useState<'phone' | 'line' | 'onsite' | 'other'>('phone');
  const [contactNotes, setContactNotes] = useState('');

  // Preset sample after-repair photos for fast testing
  const SAMPLE_AFTER_PHOTOS = [
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1584467735815-f778f274e296?w=800&auto=format&fit=crop&q=80',
  ];

  const handleOfficerFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await processAndCompressImage(file);
      setAfterImageInput(res.dataUrl);
    } catch (err) {
      console.error('Officer photo upload failed:', err);
    }
  };

  const handleCopyTicket = () => {
    navigator.clipboard?.writeText(issue.ticketCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveOfficerUpdate = () => {
    if (!onUpdateIssue) return;
    setIsSaving(true);

    const now = new Date().toISOString();
    const isStatusChanged = selectedStatus !== issue.status;
    const hasNewNote = officerNoteInput.trim().length > 0;

    const newTimeline = [...issue.timeline];

    if (isStatusChanged || hasNewNote) {
      const statusObj = STATUSES.find((s) => s.id === selectedStatus);
      newTimeline.push({
        id: `tl-${Date.now()}`,
        status: selectedStatus,
        title: isStatusChanged
          ? `เปลี่ยนสถานะเป็น "${statusObj?.label || selectedStatus}"`
          : 'บันทึกความคืบหน้าจากเจ้าหน้าที่',
        note: officerNoteInput.trim() || undefined,
        timestamp: now,
        actor: currentUser.name,
        actorRole: 'officer',
        photoUrl:
          afterImageInput && !afterImageInput.startsWith('data:')
            ? afterImageInput
            : undefined,
      });
    }

    // Save contact log entry if officer provided notes
    const newContactLog = [...(issue.contactLog || [])];
    if (contactNotes.trim()) {
      newContactLog.push({
        id: `contact-${Date.now()}`,
        timestamp: now,
        officerName: currentUser.name,
        channel: contactChannel,
        notes: contactNotes.trim(),
      });
    }

    const updated: Issue = {
      ...issue,
      status: selectedStatus,
      assignedDepartment: assignedDept,
      assignedOfficer: assignedOfficerName,
      ...(afterImageInput || issue.afterImageUrl
        ? { afterImageUrl: afterImageInput || issue.afterImageUrl }
        : {}),
      ...(officerNoteInput.trim() || issue.officerNotes
        ? { officerNotes: officerNoteInput.trim() || issue.officerNotes }
        : {}),
      contactLog: newContactLog,
      updatedAt: now,
      timeline: newTimeline,
    };

    setTimeout(() => {
      onUpdateIssue(updated);
      setIsSaving(false);
      setOfficerNoteInput('');
      setContactNotes('');
    }, 400);
  };

  // Status progress steps
  const statusSteps: IssueStatus[] = ['pending', 'acknowledged', 'in_progress', 'resolved', 'closed'];
  const currentStepIndex = statusSteps.indexOf(issue.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-xs">
      <div
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-8 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
              style={{ backgroundColor: categoryMeta.color }}
            >
              <CategoryIcon category={issue.category} size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-teal-100/70 text-teal-800 border border-teal-200">
                  {issue.ticketCode}
                </span>
                <StatusBadge status={issue.status} size="sm" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5 leading-snug line-clamp-1">
                {issue.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyTicket}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              title="คัดลอกรหัสปัญหา"
            >
              {copied ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} />}
              <span>{copied ? 'คัดลอกแล้ว' : 'แชร์รหัส'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* Progress Timeline Stepper */}
          <div className="bg-slate-50/90 p-4 sm:p-5 rounded-2xl border border-slate-200/80">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
              ขั้นตอนการดำเนินการ (Status Lifecycle)
            </h4>
            <div className="relative flex items-center justify-between max-w-2xl mx-auto">
              {/* Connecting Line */}
              <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 bg-slate-200 z-0" />
              <div
                className="absolute left-4 top-1/2 -translate-y-1/2 h-1 bg-teal-500 transition-all duration-500 z-0"
                style={{
                  width: `${(Math.max(0, currentStepIndex) / (statusSteps.length - 1)) * 90}%`,
                }}
              />

              {statusSteps.map((s, idx) => {
                const stepMeta = STATUSES.find((item) => item.id === s)!;
                const isPassed = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div key={s} className="relative z-10 flex flex-col items-center">
                    <div
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all shadow-xs ${
                        isCurrent
                          ? 'bg-teal-600 text-white ring-4 ring-teal-100 scale-110'
                          : isPassed
                          ? 'bg-teal-500 text-white'
                          : 'bg-white text-slate-400 border-2 border-slate-300'
                      }`}
                    >
                      {isPassed ? <Check size={16} strokeWidth={3} /> : idx + 1}
                    </div>
                    <span
                      className={`text-[11px] sm:text-xs mt-1.5 font-medium text-center whitespace-nowrap ${
                        isCurrent ? 'text-teal-700 font-bold' : isPassed ? 'text-slate-700' : 'text-slate-400'
                      }`}
                    >
                      {stepMeta.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Details & Media Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Col: Photos */}
            <div className="lg:col-span-5 space-y-4">
              {/* Requirement 5: ภาพที่ประชาชนแจ้ง */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-100">
                <div className="px-3 py-2 bg-slate-800 text-white text-xs font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Camera size={14} className="text-amber-400" />
                    <span>ภาพที่ประชาชนแจ้ง</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    {isOfficer && (
                      <button
                        type="button"
                        onClick={() => setIsImageEditModalOpen(true)}
                        className="text-[10px] bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded flex items-center gap-1 transition-colors cursor-pointer"
                        title="แอดมินแก้ไขหรือเปลี่ยนรูปภาพนี้"
                      >
                        <Camera size={10} />
                        <span>แก้ไขรูป</span>
                      </button>
                    )}
                    <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded">
                      ภาพถ่ายจริงจากพื้นที่
                    </span>
                  </div>
                </div>
                {issue.imageUrl ? (
                  <img
                    src={issue.imageUrl}
                    alt={issue.title}
                    className="w-full h-52 sm:h-60 object-cover hover:scale-102 transition-transform duration-300"
                  />
                ) : (
                  <div className="h-52 sm:h-60 flex flex-col items-center justify-center p-6 text-center text-slate-400 bg-slate-50">
                    <ImageIcon size={36} className="text-slate-300 mb-2" />
                    <p className="text-xs font-bold text-slate-600">ยังไม่มีภาพจากพื้นที่</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      ผู้แจ้งไม่ได้แนบภาพถ่ายมาในขณะสร้างคำร้อง
                    </p>
                    {isOfficer && (
                      <button
                        type="button"
                        onClick={() => setIsImageEditModalOpen(true)}
                        className="mt-2.5 px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        + ใส่รูปภาพจุดเกิดเหตุ
                      </button>
                    )}
                  </div>
                )}
                {issue.imageCaption && (
                  <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-600">
                    📝 {issue.imageCaption}
                  </div>
                )}
              </div>

              {/* Requirement 5: ภาพหลังดำเนินการ */}
              <div className="border border-emerald-200 rounded-2xl overflow-hidden bg-emerald-50/40">
                <div className="px-3 py-2 bg-emerald-800 text-white text-xs font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle size={14} className="text-emerald-300" />
                    <span>ภาพหลังดำเนินการ</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    {isOfficer && (
                      <button
                        type="button"
                        onClick={() => setIsImageEditModalOpen(true)}
                        className="text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/40 px-2 py-0.5 rounded flex items-center gap-1 transition-colors cursor-pointer"
                        title="แอดมินเปลี่ยนหรือใส่รูปภาพผลงาน"
                      >
                        <Camera size={10} />
                        <span>{issue.afterImageUrl ? 'เปลี่ยนรูป' : 'ใส่รูปผลงาน'}</span>
                      </button>
                    )}
                    <span className="text-[10px] bg-emerald-700 px-1.5 py-0.5 rounded text-white">
                      ผลงานแก้ไข
                    </span>
                  </div>
                </div>
                {issue.afterImageUrl ? (
                  <img
                    src={issue.afterImageUrl}
                    alt="ภาพหลังดำเนินการ"
                    className="w-full h-52 sm:h-60 object-cover"
                  />
                ) : (
                  <div className="h-44 sm:h-48 flex flex-col items-center justify-center p-6 text-center text-slate-400 bg-white">
                    <ImageIcon size={32} className="text-slate-300 mb-2" />
                    <p className="text-xs font-bold text-slate-600">ยังไม่มีภาพผลงานหลังแก้ไข</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {isOfficer
                        ? 'เจ้าหน้าที่/แอดมินสามารถแนบรูปถ่ายจริงหลังซ่อมเสร็จได้ที่นี่'
                        : 'อยู่ระหว่างดำเนินการโดยหน่วยงานที่เกี่ยวข้อง'}
                    </p>
                    {isOfficer && (
                      <button
                        type="button"
                        onClick={() => setIsImageEditModalOpen(true)}
                        className="mt-2.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        + ใส่รูปผลงานซ่อม
                      </button>
                    )}
                  </div>
                )}
                {issue.afterImageCaption && (
                  <div className="px-3 py-1.5 bg-emerald-50 border-t border-emerald-200 text-[11px] text-emerald-800">
                    ✅ {issue.afterImageCaption}
                  </div>
                )}
              </div>

              {/* Additional Photos Section if present */}
              {issue.additionalImages && issue.additionalImages.length > 0 && (
                <div className="border border-indigo-200 rounded-2xl overflow-hidden bg-indigo-50/30 p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-indigo-900">
                    <span className="flex items-center gap-1.5">
                      <ImageIcon size={14} className="text-indigo-600" />
                      <span>รูปภาพเพิ่มเติม ({issue.additionalImages.length} ภาพ)</span>
                    </span>
                    {isOfficer && (
                      <button
                        type="button"
                        onClick={() => setIsImageEditModalOpen(true)}
                        className="text-[10px] text-indigo-700 hover:text-indigo-900 font-bold"
                      >
                        จัดการรูปภาพ
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {issue.additionalImages.map((imgUrl, i) => (
                      <a
                        key={i}
                        href={imgUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg overflow-hidden border border-indigo-200 aspect-4/3 block hover:opacity-90"
                      >
                        <img
                          src={imgUrl}
                          alt={`ภาพเพิ่มเติม ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Location Pin Card */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-start gap-2 text-slate-700">
                  <MapPin size={16} className="text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900 block">สถานที่เกิดเหตุ</span>
                    <span className="text-slate-600">{issue.locationName}</span>
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 pl-6 font-mono">
                  พิกัด: {issue.latitude.toFixed(4)}, {issue.longitude.toFixed(4)}
                </div>
              </div>
            </div>

            {/* Right Col: Info, Timeline, and Officer Box */}
            <div className="lg:col-span-7 space-y-5">
              {/* Description & Category */}
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                    style={{ backgroundColor: `${categoryMeta.color}15`, color: categoryMeta.color }}
                  >
                    ประเภท: {categoryMeta.label}
                  </span>
                  {issue.urgency === 'urgent' && (
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-100 text-rose-800 flex items-center gap-1">
                      <AlertTriangle size={12} /> ความเร่งด่วนสูงสุด
                    </span>
                  )}
                  <span className="text-xs text-slate-500 flex items-center gap-1 ml-auto">
                    <Calendar size={13} /> {formatThaiDate(issue.createdAt)}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2">{issue.title}</h3>
                <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200/70 whitespace-pre-line">
                  {issue.description}
                </p>
              </div>

              {/* Reporter Info & Assigned Dept */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-semibold text-slate-500 block mb-1">ข้อมูลผู้แจ้งเรื่อง</span>
                  <div className="space-y-1 text-slate-800">
                    <div className="flex items-center gap-1.5 font-medium">
                      <UserIcon size={13} className="text-slate-500" />
                      <span>{issue.reporterName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Phone size={13} className="text-slate-500" />
                      <span>{issue.reporterPhone}</span>
                    </div>
                    {issue.reporterEmail && (
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Mail size={13} className="text-slate-500" />
                        <span>{issue.reporterEmail}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-semibold text-slate-500 block mb-1">หน่วยงานรับผิดชอบ</span>
                  <div className="space-y-1 text-slate-800">
                    <div className="flex items-center gap-1.5 font-medium text-teal-800">
                      <Building size={13} className="text-teal-600" />
                      <span>{issue.assignedDepartment || 'อยู่ระหว่างจัดสรรหน่วยงาน'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Wrench size={13} className="text-slate-500" />
                      <span>ผู้รับเรื่อง: {issue.assignedOfficer || 'เจ้าหน้าที่ส่วนกลาง'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline Log */}
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  บันทึกประวัติการดำเนินงาน (Activity Timeline)
                </h4>
                <div className="space-y-3 pl-3 border-l-2 border-teal-200">
                  {issue.timeline.map((item) => (
                    <div key={item.id} className="relative pl-3 text-xs">
                      <div className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-teal-500 ring-2 ring-white" />
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-800">{item.title}</span>
                        <span className="text-[11px] text-slate-400 shrink-0">
                          {formatThaiDate(item.timestamp)}
                        </span>
                      </div>
                      {item.note && (
                        <p className="text-slate-600 mt-1 bg-white p-2 rounded-lg border border-slate-100 text-xs">
                          {item.note}
                        </p>
                      )}
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        โดย: <span className="font-medium text-slate-600">{item.actor}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* User Requirement 6: บันทึกประวัติการติดต่อประชาชน */}
              <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare size={15} className="text-teal-700" />
                    <h4 className="text-xs font-bold text-slate-800">
                      บันทึกประวัติการติดต่อประชาชน ({issue.contactLog?.length || 0} รายการ)
                    </h4>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">
                    โทร / LINE / ลงพื้นที่
                  </span>
                </div>

                {issue.contactLog && issue.contactLog.length > 0 ? (
                  <div className="space-y-2">
                    {issue.contactLog.map((log) => {
                      const channelBadge =
                        log.channel === 'phone'
                          ? { label: 'โทรศัพท์', icon: PhoneCall, color: 'bg-emerald-100 text-emerald-800 border-emerald-300' }
                          : log.channel === 'line'
                          ? { label: 'LINE Official', icon: MessageCircle, color: 'bg-green-100 text-green-800 border-green-300' }
                          : log.channel === 'onsite'
                          ? { label: 'ลงพื้นที่พบประชาชน', icon: Users, color: 'bg-amber-100 text-amber-900 border-amber-300' }
                          : { label: 'อื่น ๆ', icon: MessageSquare, color: 'bg-slate-100 text-slate-700 border-slate-300' };

                      const ChannelIcon = channelBadge.icon;

                      return (
                        <div
                          key={log.id}
                          className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs shadow-2xs space-y-1"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${channelBadge.color}`}>
                                <ChannelIcon size={11} />
                                <span>{channelBadge.label}</span>
                              </span>
                              <span className="font-semibold text-slate-800 text-[11px]">
                                โดย: {log.officerName}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400">
                              {formatThaiDate(log.timestamp)}
                            </span>
                          </div>
                          <p className="text-slate-700 text-xs pl-1 whitespace-pre-line leading-relaxed">
                            {log.notes}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-3 text-center bg-white rounded-xl border border-dashed border-slate-200 text-[11px] text-slate-400">
                    ยังไม่มีการบันทึกประวัติการติดต่อประชาชนในคำร้องนี้
                  </div>
                )}
              </div>

              {/* Officer Action Panel (Only if Officer/Admin) */}
              {isOfficer && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-50 to-teal-50 border border-sky-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wrench className="text-sky-600" size={18} />
                      <h4 className="text-sm font-bold text-slate-900">
                        แผงจัดการสำหรับเจ้าหน้าที่ (Officer Actions)
                      </h4>
                    </div>
                    <span className="text-[11px] bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full font-semibold">
                      สิทธิ์เจ้าหน้าที่
                    </span>
                  </div>

                  {/* Status selection */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ปรับเปลี่ยนสถานะปัญหา:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {STATUSES.map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setSelectedStatus(st.id)}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all text-left flex items-center justify-between ${
                            selectedStatus === st.id
                              ? 'bg-sky-600 text-white border-sky-700 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-sky-300'
                          }`}
                        >
                          <span>{st.label}</span>
                          {selectedStatus === st.id && <Check size={14} />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Department & Officer */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        หน่วยงานผู้รับผิดชอบ:
                      </label>
                      <select
                        value={assignedDept}
                        onChange={(e) => setAssignedDept(e.target.value)}
                        className="w-full text-xs p-2 rounded-xl border border-slate-300 bg-white focus:outline-teal-500"
                      >
                        {DEPARTMENTS.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        เจ้าหน้าที่ผู้รับผิดชอบ:
                      </label>
                      <input
                        type="text"
                        value={assignedOfficerName}
                        onChange={(e) => setAssignedOfficerName(e.target.value)}
                        className="w-full text-xs p-2 rounded-xl border border-slate-300 bg-white focus:outline-teal-500"
                        placeholder="ชื่อเจ้าหน้าที่"
                      />
                    </div>
                  </div>

                  {/* After photo URL / File Upload / Presets */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-slate-700">
                        ภาพหลังดำเนินการ (รองรับ JPG, JPEG, PNG, WebP):
                      </label>
                      <div className="flex items-center gap-1.5">
                        <label className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-lg border border-emerald-200 cursor-pointer transition-colors shadow-2xs">
                          <Upload size={12} className="text-emerald-700" />
                          <span>📁 เลือกรูปจากเครื่อง</span>
                          <input
                            type="file"
                            accept="image/*,.jpg,.jpeg,.png,.webp,.gif,.bmp"
                            onChange={handleOfficerFileUpload}
                            className="hidden"
                          />
                        </label>
                        <label className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium rounded-lg border border-slate-300 cursor-pointer transition-colors">
                          <Camera size={12} className="text-slate-600" />
                          <span>📸 ถ่ายรูป</span>
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handleOfficerFileUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={afterImageInput}
                        onChange={(e) => setAfterImageInput(e.target.value)}
                        placeholder="วางลิงก์รูปถ่ายผลงาน หรือกดปุ่ม 'อัปโหลดรูปถ่ายจริง' จากกล้อง/เครื่อง"
                        className="flex-1 text-xs p-2 rounded-xl border border-slate-300 bg-white focus:outline-teal-500"
                      />
                      {afterImageInput && (
                        <button
                          type="button"
                          onClick={() => setAfterImageInput('')}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs"
                        >
                          ลบรูป
                        </button>
                      )}
                    </div>

                    {/* Quick presets */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] text-slate-500">ภาพตัวอย่างจริง:</span>
                      {SAMPLE_AFTER_PHOTOS.map((url, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setAfterImageInput(url)}
                          className="text-[10px] px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-600 hover:text-teal-700 hover:border-teal-400"
                        >
                          ภาพงานซ่อม {i + 1}
                        </button>
                      ))}
                    </div>

                    {/* Dedicated Admin Full Image Editor Trigger */}
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setIsImageEditModalOpen(true)}
                        className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Camera size={13} />
                        <span>เปิดเครื่องมือแก้ไขรูปภาพฉบับเต็ม (เปลี่ยนรูป / ใส่รูปภาพ / แนบภาพเพิ่มเติม)</span>
                      </button>
                    </div>
                  </div>

                  {/* Note input */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      เพิ่มหมายเหตุ / รายละเอียดการเข้าซ่อมแซม:
                    </label>
                    <textarea
                      rows={2}
                      value={officerNoteInput}
                      onChange={(e) => setOfficerNoteInput(e.target.value)}
                      placeholder="เช่น ได้ส่งทีมช่างเข้าซ่อมแซมแล้วเสร็จ, อยู่ระหว่างรออะไหล่ หรือประชาสัมพันธ์ให้ประชาชนทราบ..."
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-teal-500"
                    />
                  </div>

                  {/* Requirement 6: บันทึกการติดต่อประชาชน */}
                  <div className="p-3 bg-white rounded-xl border border-sky-200 space-y-2.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <MessageSquare size={13} className="text-sky-700" />
                        <span>บันทึกการติดต่อประชาชน (เพิ่มประวัติใหม่)</span>
                      </label>
                      <span className="text-[10px] text-slate-400">ระบุช่องทางและผลการสื่อสาร</span>
                    </div>

                    {/* Channel buttons */}
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setContactChannel('phone')}
                        className={`py-1.5 px-2 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                          contactChannel === 'phone'
                            ? 'bg-emerald-600 text-white border-emerald-700'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <PhoneCall size={12} />
                        <span>โทรศัพท์</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setContactChannel('line')}
                        className={`py-1.5 px-2 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                          contactChannel === 'line'
                            ? 'bg-green-600 text-white border-green-700'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <MessageCircle size={12} />
                        <span>LINE</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setContactChannel('onsite')}
                        className={`py-1.5 px-2 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                          contactChannel === 'onsite'
                            ? 'bg-amber-600 text-white border-amber-700'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <Users size={12} />
                        <span>ลงพื้นที่</span>
                      </button>
                    </div>

                    <textarea
                      rows={2}
                      value={contactNotes}
                      onChange={(e) => setContactNotes(e.target.value)}
                      placeholder="บันทึกข้อความ เช่น ได้โทรแจ้งประชาชนว่าช่างจะเข้าไปดูหน้างานช่วงบ่าย หรือ นัดหมายตรวจจุด..."
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-teal-500"
                    />
                  </div>

                  {/* Save button */}
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={handleSaveOfficerUpdate}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50"
                    >
                      {isSaving ? (
                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Check size={16} />
                      )}
                      <span>บันทึกการอัปเดตและแจ้งเตือน</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            อัปเดตล่าสุด: {formatThaiDate(issue.updatedAt)}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>

      {/* Admin Image Edit Modal */}
      {isImageEditModalOpen && (
        <AdminImageEditModal
          issue={issue}
          currentUser={currentUser}
          onClose={() => setIsImageEditModalOpen(false)}
          onSave={async (updated) => {
            if (onUpdateIssue) {
              await onUpdateIssue(updated);
            }
            setIsImageEditModalOpen(false);
          }}
        />
      )}
    </div>
  );
};
