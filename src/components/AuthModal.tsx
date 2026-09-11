import React, { useState } from 'react';
import { X, User, Lock, Mail, Phone, ShieldCheck, Check, Sparkles } from 'lucide-react';
import { User as UserType } from '../types';
import { INITIAL_USERS } from '../data/mockData';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserType;
  onSelectUser: (user: UserType) => void;
  onRegisterUser: (newUser: UserType) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSelectUser,
  onRegisterUser,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRole, setRegRole] = useState<'citizen' | 'officer'>('citizen');

  if (!isOpen) return null;

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regPhone) return;

    const newUser: UserType = {
      id: `usr-${Date.now()}`,
      name: regName.trim(),
      email: regEmail.trim() || `${regPhone}@citizen.th`,
      phone: regPhone.trim(),
      role: regRole,
      department: regRole === 'officer' ? 'ฝ่ายบริการประชาชน' : undefined,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
    };

    onRegisterUser(newUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                เข้าสู่ระบบ / สมัครสมาชิก
              </h3>
              <p className="text-[11px] text-slate-500">Community Care บัญชีผู้ใช้งาน</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab switch */}
        <div className="px-6 pt-4">
          <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('login')}
              className={`py-2 rounded-lg transition-all ${
                activeTab === 'login' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-500'
              }`}
            >
              เข้าสู่ระบบ / สลับบัญชี
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('register')}
              className={`py-2 rounded-lg transition-all ${
                activeTab === 'register' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-500'
              }`}
            >
              ลงทะเบียนใหม่
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {activeTab === 'login' ? (
            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-slate-500 block mb-2">
                  เลือกบัญชีทดสอบเพื่อสลับการทำงานได้ทันที (Demo Accounts):
                </span>
                <div className="space-y-2">
                  {INITIAL_USERS.map((user) => {
                    const isCurrent = currentUser.id === user.id;
                    const isOfficer = user.role === 'officer' || user.role === 'admin';
                    return (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => {
                          onSelectUser(user);
                          onClose();
                        }}
                        className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all ${
                          isCurrent
                            ? 'border-teal-500 bg-teal-50/70 ring-2 ring-teal-500/20'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-white"
                          />
                          <div>
                            <p className="text-xs font-bold text-slate-900">{user.name}</p>
                            <p className="text-[11px] text-slate-500">
                              {user.phone} • {isOfficer ? user.department || 'เจ้าหน้าที่' : 'ประชาชนทั่วไป'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isOfficer ? 'bg-sky-100 text-sky-800' : 'bg-teal-100 text-teal-800'
                            }`}
                          >
                            {isOfficer ? 'เจ้าหน้าที่' : 'ประชาชน'}
                          </span>
                          {isCurrent && <Check size={16} className="text-teal-600" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  บทบาทผู้ใช้งาน:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegRole('citizen')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                      regRole === 'citizen'
                        ? 'bg-teal-50 border-teal-500 text-teal-800 ring-2 ring-teal-500/20'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    ประชาชนทั่วไป
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegRole('officer')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                      regRole === 'officer'
                        ? 'bg-sky-50 border-sky-500 text-sky-800 ring-2 ring-sky-500/20'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    เจ้าหน้าที่เทศบาล
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่อ-นามสกุล *
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="เช่น นายวิชัย มั่นคง"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  เบอร์โทรศัพท์มือถือ *
                </label>
                <input
                  type="tel"
                  required
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="08X-XXX-XXXX"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  อีเมล (ไม่บังคับ)
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-teal-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
                >
                  สร้างบัญชีและเริ่มใช้งาน
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
