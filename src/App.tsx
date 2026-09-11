import React, { useState, useEffect } from 'react';
import { Issue, IssueStatus, User } from './types';
import {
  getStoredIssues,
  saveStoredIssues,
  getStoredCurrentUser,
  saveStoredCurrentUser,
  resetToDemoData,
} from './utils/storage';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { ReportIssueView } from './components/ReportIssueView';
import { CitizenTrackView } from './components/CitizenTrackView';
import { OfficerDashboard } from './components/OfficerDashboard';
import { MapView } from './components/MapView';
import { DashboardView } from './components/DashboardView';
import { IssueDetailModal } from './components/IssueDetailModal';
import { AuthModal } from './components/AuthModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { INITIAL_USERS } from './data/mockData';
import {
  PhoneCall,
  Mail,
  Shield,
  Heart,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export default function App() {
  const [issues, setIssues] = useState<Issue[]>(() => getStoredIssues());
  const [currentUser, setCurrentUser] = useState<User>(() => getStoredCurrentUser());
  const [currentTab, setCurrentTab] = useState<
    'home' | 'report' | 'track' | 'map' | 'dashboard' | 'officer'
  >('home');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync state to localStorage
  useEffect(() => {
    saveStoredIssues(issues);
  }, [issues]);

  useEffect(() => {
    saveStoredCurrentUser(currentUser);
  }, [currentUser]);

  // Toast trigger helper
  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Handlers
  const handleAddNewIssue = (newIssue: Issue) => {
    setIssues((prev) => [newIssue, ...prev]);
    addToast(
      'success',
      'แจ้งปัญหาสำเร็จ!',
      `รหัส Ticket ของคุณคือ ${newIssue.ticketCode} สามารถติดตามความคืบหน้าได้ตลอดเวลา`
    );
  };

  const handleUpdateIssue = (updated: Issue) => {
    setIssues((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    setSelectedIssue(updated);
    addToast('success', 'บันทึกข้อมูลเรียบร้อย', `อัปเดตสถานะและรายละเอียดของ ${updated.ticketCode} แล้ว`);
  };

  const handleQuickUpdateStatus = (issueId: string, newStatus: IssueStatus) => {
    const target = issues.find((i) => i.id === issueId);
    if (!target) return;

    const now = new Date().toISOString();
    const updated: Issue = {
      ...target,
      status: newStatus,
      updatedAt: now,
      timeline: [
        ...target.timeline,
        {
          id: `tl-${Date.now()}`,
          status: newStatus,
          title: `เจ้าหน้าที่ปรับสถานะเป็น "${newStatus}"`,
          timestamp: now,
          actor: currentUser.name,
          actorRole: 'officer',
        },
      ],
    };

    setIssues((prev) => prev.map((i) => (i.id === issueId ? updated : i)));
    addToast('info', 'อัปเดตสถานะแล้ว', `${updated.ticketCode} เปลี่ยนสถานะเรียบร้อย`);
  };

  const handleSwitchRole = (role: 'citizen' | 'officer') => {
    if (role === 'officer') {
      const officerUser = INITIAL_USERS.find((u) => u.role === 'officer') || INITIAL_USERS[1];
      setCurrentUser(officerUser);
      setCurrentTab('officer');
      addToast('info', 'สลับสู่โหมดเจ้าหน้าที่', `เข้าใช้งานในชื่อ ${officerUser.name} (${officerUser.department})`);
    } else {
      const citizenUser = INITIAL_USERS.find((u) => u.role === 'citizen') || INITIAL_USERS[0];
      setCurrentUser(citizenUser);
      addToast('info', 'สลับสู่โหมดประชาชน', `เข้าใช้งานในชื่อ ${citizenUser.name}`);
    }
  };

  const handleResetData = () => {
    const result = resetToDemoData();
    setIssues(result.issues);
    setCurrentUser(result.user);
    setSelectedIssue(null);
    addToast('info', 'รีเซ็ตข้อมูลแล้ว', 'กู้คืนข้อมูลตัวอย่างปัญหาชุมชนและบัญชีทดสอบเรียบร้อย');
  };

  const pendingCount = issues.filter((i) => i.status === 'pending').length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans">
      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Main Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onSwitchRole={handleSwitchRole}
        onResetData={handleResetData}
        pendingCount={pendingCount}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <HomeView
            issues={issues}
            onNavigate={setCurrentTab}
            onSelectIssue={(issue) => setSelectedIssue(issue)}
            onQuickSearch={() => setCurrentTab('track')}
          />
        )}

        {currentTab === 'report' && (
          <ReportIssueView
            currentUser={currentUser}
            existingIssues={issues}
            onSubmitIssue={handleAddNewIssue}
            onCancel={() => setCurrentTab('home')}
            onViewIssue={(issue) => {
              setSelectedIssue(issue);
              setCurrentTab('track');
            }}
          />
        )}

        {currentTab === 'track' && (
          <CitizenTrackView
            issues={issues}
            currentUser={currentUser}
            onSelectIssue={(issue) => setSelectedIssue(issue)}
            onNavigateReport={() => setCurrentTab('report')}
          />
        )}

        {currentTab === 'map' && (
          <MapView
            issues={issues}
            onSelectIssue={(issue) => setSelectedIssue(issue)}
            onReportAtLocation={(lat, lng) => {
              setCurrentTab('report');
            }}
          />
        )}

        {currentTab === 'dashboard' && <DashboardView issues={issues} />}

        {currentTab === 'officer' && (
          <OfficerDashboard
            issues={issues}
            currentUser={currentUser}
            onSelectIssue={(issue) => setSelectedIssue(issue)}
            onQuickUpdateStatus={handleQuickUpdateStatus}
          />
        )}
      </main>

      {/* Issue Detail / Tracking & Officer Modal */}
      {selectedIssue && (
        <IssueDetailModal
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
          currentUser={currentUser}
          onUpdateIssue={handleUpdateIssue}
        />
      )}

      {/* Auth / Account Switch Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onSelectUser={(user) => {
          setCurrentUser(user);
          addToast('success', 'เข้าสู่ระบบสำเร็จ', `ยินดีต้อนรับ ${user.name}`);
        }}
        onRegisterUser={(newUser) => {
          setCurrentUser(newUser);
          addToast('success', 'ลงทะเบียนสำเร็จ', `สร้างบัญชีสำหรับ ${newUser.name} เรียบร้อย`);
        }}
      />

      {/* Global Footer - Prasat Community Care */}
      <footer className="bg-white border-t border-emerald-900/10 mt-auto text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-800 to-amber-600 flex items-center justify-center text-white font-bold shadow-xs">
                  <span className="text-base">🐘</span>
                </div>
                <div>
                  <span className="font-bold text-sm text-emerald-950 block">Prasat Community Care</span>
                  <span className="text-[10px] text-emerald-700 font-medium">อำเภอปราสาท จังหวัดสุรินทร์</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                “ชุมชนเล็ก ๆ ของสุรินทร์ที่ช่วยกันดูแลบ้านของเรา” ระบบรับแจ้งปัญหาและข้อร้องทุกข์ของประชาชน ครอบคลุม 18 ตำบล 241 หมู่บ้าน
              </p>
            </div>

            <div>
              <h4 className="font-bold text-emerald-950 mb-2">บริการหลัก</h4>
              <ul className="space-y-1.5">
                <li>
                  <button type="button" onClick={() => setCurrentTab('report')} className="hover:text-emerald-700">
                    แจ้งปัญหาและเรื่องร้องทุกข์
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => setCurrentTab('track')} className="hover:text-emerald-700">
                    ติดตามสถานะคำร้อง (Ticket)
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => setCurrentTab('map')} className="hover:text-emerald-700">
                    แผนที่ตำแหน่งปัญหาใน อ.ปราสาท
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => setCurrentTab('dashboard')} className="hover:text-emerald-700">
                    สถิติและผลการดำเนินงาน 18 ตำบล
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-emerald-950 mb-2">พื้นที่ให้บริการใน อ.ปราสาท</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                ต.กังแอน • ต.บ้านพลวง • ต.ทมอ • ต.บักได • ต.ตาเบา • ต.เชื้อเพลิง • ต.ปราสาททนง • ต.ตานี • ต.บ้านไพล • ต.สมุด • ต.ประทัดบุ • ต.โคกสะอาด • ต.ไพล • ต.ปรือ • ต.ทุ่งมน • ต.หนองใหญ่ • ต.กันตรวจระมวล • ต.โคกยาง
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-emerald-950 mb-1">ติดต่อศูนย์บริการร่วม อ.ปราสาท</h4>
              <div className="flex items-center gap-2 text-slate-700">
                <PhoneCall size={14} className="text-emerald-700" />
                <span className="font-semibold">สายด่วนร้องทุกข์ 044-551-234</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <Mail size={14} className="text-emerald-700" />
                <span>prasat.care@surin.go.th</span>
              </div>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleResetData}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-[11px] font-medium transition-colors border border-emerald-200"
                >
                  <RotateCcw size={12} />
                  <span>รีเซ็ตข้อมูลตัวอย่างทั้งหมด</span>
                </button>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
            <p>© 2026 Prasat Community Care • ระบบแจ้งปัญหาชุมชนออนไลน์ อำเภอปราสาท จ.สุรินทร์</p>
            <p className="flex items-center gap-1">
              <span>สร้างด้วยความใส่ใจเพื่อชาวสุรินทร์</span>
              <Heart size={12} className="text-amber-600 fill-amber-600" />
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
