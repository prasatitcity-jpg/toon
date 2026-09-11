import React, { useState } from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Shield,
  FileText,
  Clock,
  CheckCircle2,
  LogOut,
  Edit2,
  Save,
  Building,
} from 'lucide-react';
import { User as UserType, Issue } from '../types';
import { PRASAT_SUB_DISTRICTS } from '../data/prasatLocations';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserType;
  userIssues: Issue[];
  onUpdateUser: (updated: UserType) => void;
  onLogout: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  userIssues,
  onUpdateUser,
  onLogout,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone);
  const [email, setEmail] = useState(currentUser.email);
  const [subDistrict, setSubDistrict] = useState(currentUser.subDistrict || 'กังแอน');
  const [village, setVillage] = useState(currentUser.village || 'หมู่ 1 บ้านปะอาว');

  if (!isOpen) return null;

  const isOfficer = currentUser.role === 'officer' || currentUser.role === 'admin';
  const pendingCount = userIssues.filter((i) => i.status === 'pending' || i.status === 'acknowledged').length;
  const inProgressCount = userIssues.filter((i) => i.status === 'in_progress').length;
  const resolvedCount = userIssues.filter((i) => i.status === 'resolved' || i.status === 'closed').length;

  const currentSdData = PRASAT_SUB_DISTRICTS.find((s) => s.name === subDistrict);
  const availableVillages = currentSdData ? currentSdData.villages : [];

  const handleSave = () => {
    onUpdateUser({
      ...currentUser,
      name: name.trim() || currentUser.name,
      phone: phone.trim() || currentUser.phone,
      email: email.trim() || currentUser.email,
      subDistrict,
      village,
    });
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-teal-900 to-emerald-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center ring-2 ring-white/20">
              <User size={24} className="text-amber-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold leading-snug">{currentUser.name}</h3>
              <p className="text-xs text-teal-200">
                {isOfficer ? `เจ้าหน้าที่ • ${currentUser.department || 'อ.ปราสาท'}` : 'ประชาชนชาวอำเภอปราสาท'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* User Stats in Prasat Community Care */}
        <div className="p-6 bg-slate-50 border-b border-slate-200">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
            {isOfficer ? 'สถิติการรับผิดชอบงาน' : 'สถิติการแจ้งปัญหาของฉัน'}
          </span>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs text-center">
              <span className="text-xs font-semibold text-amber-700 block">รอรับเรื่อง</span>
              <p className="text-xl font-bold text-slate-900 mt-0.5">{pendingCount}</p>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs text-center">
              <span className="text-xs font-semibold text-sky-700 block">กำลังดำเนินการ</span>
              <p className="text-xl font-bold text-slate-900 mt-0.5">{inProgressCount}</p>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs text-center">
              <span className="text-xs font-semibold text-emerald-700 block">แก้ไขสำเร็จ</span>
              <p className="text-xl font-bold text-slate-900 mt-0.5">{resolvedCount}</p>
            </div>
          </div>
        </div>

        {/* Profile Details Form */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">ข้อมูลส่วนตัว</h4>
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-900"
              >
                <Edit2 size={13} />
                <span>แก้ไขข้อมูล</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSave}
                className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-900"
              >
                <Save size={13} />
                <span>บันทึกข้อมูล</span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            {/* Name */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-0.5">ชื่อ-นามสกุล</label>
              {isEditing ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              ) : (
                <p className="text-xs font-semibold text-slate-900">{currentUser.name}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-0.5">เบอร์โทรศัพท์ติดต่อ</label>
              {isEditing ? (
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              ) : (
                <p className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                  <Phone size={13} className="text-slate-400" />
                  <span>{currentUser.phone}</span>
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-0.5">อีเมล</label>
              {isEditing ? (
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              ) : (
                <p className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                  <Mail size={13} className="text-slate-400" />
                  <span>{currentUser.email}</span>
                </p>
              )}
            </div>

            {/* Sub-district & Village in Prasat, Surin */}
            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-0.5">ตำบลประจำตัว</label>
                {isEditing ? (
                  <select
                    value={subDistrict}
                    onChange={(e) => {
                      setSubDistrict(e.target.value);
                      const sd = PRASAT_SUB_DISTRICTS.find((s) => s.name === e.target.value);
                      if (sd && sd.villages.length > 0) {
                        setVillage(`หมู่ ${sd.villages[0].moo} ${sd.villages[0].name}`);
                      }
                    }}
                    className="w-full px-2 py-1 text-xs rounded-lg border border-slate-300 bg-white"
                  >
                    {PRASAT_SUB_DISTRICTS.map((sd) => (
                      <option key={sd.id} value={sd.name}>
                        ต.{sd.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs font-semibold text-slate-900">
                    ต.{currentUser.subDistrict || 'กังแอน'}
                  </p>
                )}
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-0.5">หมู่บ้าน</label>
                {isEditing ? (
                  <select
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    className="w-full px-2 py-1 text-xs rounded-lg border border-slate-300 bg-white"
                  >
                    {availableVillages.map((v) => {
                      const vLabel = `หมู่ ${v.moo} ${v.name}`;
                      return (
                        <option key={v.moo} value={vLabel}>
                          {vLabel}
                        </option>
                      );
                    })}
                  </select>
                ) : (
                  <p className="text-xs font-semibold text-slate-900">
                    {currentUser.village || 'หมู่ 1 บ้านปะอาว'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors border border-rose-200"
          >
            <LogOut size={15} />
            <span>ออกจากระบบ</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};
