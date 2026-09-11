import React, { useState, useEffect } from 'react';
import { Issue, IssueStatus, User, TicketNotification, AppTab } from './types';
import {
  getStoredIssues,
  saveStoredIssues,
  getStoredCurrentUser,
  saveStoredCurrentUser,
  getStoredIsLoggedIn,
  saveStoredIsLoggedIn,
  resetToDemoData,
} from './utils/storage';
import {
  getStoredNotifications,
  saveStoredNotifications,
  playNotificationSound,
  sendBrowserPushNotification,
  STATUS_LABEL_MAP,
} from './utils/notification';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { ReportIssueView } from './components/ReportIssueView';
import { CitizenTrackView } from './components/CitizenTrackView';
import { MyHistoryView } from './components/MyHistoryView';
import { HotlinesView } from './components/HotlinesView';
import { OnlineMembersView } from './components/OnlineMembersView';
import { OfficerDashboard } from './components/OfficerDashboard';
import { MapView } from './components/MapView';
import { DashboardView } from './components/DashboardView';
import { IssueDetailModal } from './components/IssueDetailModal';
import { TicketStatusModal } from './components/TicketStatusModal';
import { LoginView } from './components/LoginView';
import { ProfileModal } from './components/ProfileModal';
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
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => getStoredIsLoggedIn());
  const [issues, setIssues] = useState<Issue[]>(() => getStoredIssues());
  const [currentUser, setCurrentUser] = useState<User>(() => getStoredCurrentUser());
  const [notifications, setNotifications] = useState<TicketNotification[]>(() =>
    getStoredNotifications()
  );
  const [currentTab, setCurrentTab] = useState<AppTab>(() => {
    const user = getStoredCurrentUser();
    return user.role === 'officer' ? 'officer' : 'home';
  });
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [activeModalNotification, setActiveModalNotification] =
    useState<TicketNotification | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Enforce role separation: citizen must not access officer views
  useEffect(() => {
    if (currentUser.role === 'citizen' && currentTab === 'officer') {
      setCurrentTab('home');
      addToast(
        'error',
        'สงวนสิทธิ์เฉพาะเจ้าหน้าที่',
        'ห้ามประชาชนเข้าถึง Dashboard และข้อมูลการจัดการของเจ้าหน้าที่'
      );
    }
  }, [currentUser.role, currentTab]);

  // Sync state to localStorage
  useEffect(() => {
    saveStoredIssues(issues);
  }, [issues]);

  useEffect(() => {
    saveStoredCurrentUser(currentUser);
  }, [currentUser]);

  useEffect(() => {
    saveStoredNotifications(notifications);
  }, [notifications]);

  // Toast trigger helper
  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Notification Dispatcher
  const dispatchStatusNotification = (
    issue: Issue,
    oldStatus: IssueStatus,
    newStatus: IssueStatus,
    officerNotes?: string,
    afterImageUrl?: string
  ) => {
    const now = new Date().toISOString();
    const newNotif: TicketNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      ticketId: issue.id,
      ticketCode: issue.ticketCode,
      issueTitle: issue.title,
      oldStatus,
      newStatus,
      updatedAt: now,
      officerName: currentUser.role === 'officer' ? currentUser.name : 'เจ้าหน้าที่ศูนย์บริการร่วม อ.ปราสาท',
      officerNotes:
        officerNotes ||
        `เจ้าหน้าที่ฝ่ายปฏิบัติการได้ทำการปรับปรุงสถานะเป็น "${STATUS_LABEL_MAP[newStatus]}"`,
      afterImageUrl: afterImageUrl || issue.afterImageUrl,
      subDistrict: issue.subDistrict,
      village: issue.village,
      isRead: false,
      reporterName: issue.reporterName,
      reporterPhone: issue.reporterPhone,
    };

    // Update notifications list
    setNotifications((prev) => [newNotif, ...prev]);

    // Play subtle chime sound
    playNotificationSound();

    // Trigger Browser Push Notification
    sendBrowserPushNotification(
      `อัปเดต Ticket: ${issue.ticketCode}`,
      `สถานะเปลี่ยนเป็น "${STATUS_LABEL_MAP[newStatus]}" - ${issue.title}`,
      issue.ticketCode
    );

    // Pop up Alert Modal
    setActiveModalNotification(newNotif);
    setIsStatusModalOpen(true);
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
    const oldIssue = issues.find((item) => item.id === updated.id);
    setIssues((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    setSelectedIssue(updated);
    addToast('success', 'บันทึกข้อมูลเรียบร้อย', `อัปเดตสถานะและรายละเอียดของ ${updated.ticketCode} แล้ว`);

    // Detect status change
    if (oldIssue && oldIssue.status !== updated.status) {
      dispatchStatusNotification(
        updated,
        oldIssue.status,
        updated.status,
        updated.officerNotes,
        updated.afterImageUrl
      );
    }
  };

  const handleQuickUpdateStatus = (issueId: string, newStatus: IssueStatus) => {
    const target = issues.find((i) => i.id === issueId);
    if (!target) return;

    const oldStatus = target.status;
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
          title: `เจ้าหน้าที่ปรับสถานะเป็น "${STATUS_LABEL_MAP[newStatus]}"`,
          timestamp: now,
          actor: currentUser.name,
          actorRole: 'officer',
        },
      ],
    };

    setIssues((prev) => prev.map((i) => (i.id === issueId ? updated : i)));
    addToast('info', 'อัปเดตสถานะแล้ว', `${updated.ticketCode} เปลี่ยนสถานะเป็น ${STATUS_LABEL_MAP[newStatus]}`);

    if (oldStatus !== newStatus) {
      dispatchStatusNotification(
        updated,
        oldStatus,
        newStatus,
        `เจ้าหน้าที่ได้ปรับสถานะการดำเนินงานของคำร้องเป็น "${STATUS_LABEL_MAP[newStatus]}" เรียบร้อยแล้ว`,
        updated.afterImageUrl
      );
    }
  };

  // Test simulation for user/evaluator
  const handleSimulateStatusChange = () => {
    // Pick an issue that is in progress or pending
    let target = issues.find((i) => i.status === 'in_progress');
    let nextStatus: IssueStatus = 'resolved';

    if (!target) {
      target = issues.find((i) => i.status === 'pending') || issues[0];
      nextStatus = 'in_progress';
    }

    if (!target) return;

    const oldStatus = target.status;
    const now = new Date().toISOString();
    const sampleOfficerNote =
      nextStatus === 'resolved'
        ? 'ทีมช่างกองช่าง เทศบาลตำบลกังแอน ได้เข้าซ่อมแซมและแก้ไขปัญหาในพื้นที่เรียบร้อยแล้ว ประชาชนสามารถใช้งานได้ตามปกติ'
        : 'เจ้าหน้าที่ฝ่ายปฏิบัติการได้รับเรื่องและกำลังจัดสรรทีมงานเข้าตรวจสอบพื้นที่จริง';

    const sampleAfterImage =
      nextStatus === 'resolved'
        ? 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?auto=format&fit=crop&w=800&q=80'
        : undefined;

    const updated: Issue = {
      ...target,
      status: nextStatus,
      officerNotes: sampleOfficerNote,
      afterImageUrl: sampleAfterImage || target.afterImageUrl,
      updatedAt: now,
      timeline: [
        ...target.timeline,
        {
          id: `tl-${Date.now()}`,
          status: nextStatus,
          title: `เจ้าหน้าที่ปรับสถานะเป็น "${STATUS_LABEL_MAP[nextStatus]}"`,
          note: sampleOfficerNote,
          timestamp: now,
          actor: 'นายประสิทธิ์ สุขใจ (กองช่าง เทศบาลตำบลกังแอน)',
          actorRole: 'officer',
          photoUrl: sampleAfterImage,
        },
      ],
    };

    setIssues((prev) => prev.map((i) => (i.id === target!.id ? updated : i)));

    dispatchStatusNotification(
      updated,
      oldStatus,
      nextStatus,
      sampleOfficerNote,
      sampleAfterImage
    );

    addToast(
      'success',
      '🔔 ส่งการแจ้งเตือนสำเร็จ!',
      `จำลอง Ticket ${updated.ticketCode} เปลี่ยนสถานะเป็น "${STATUS_LABEL_MAP[nextStatus]}" เรียบร้อยแล้ว`
    );
  };

  const handleSelectTab = (tab: AppTab) => {
    if (tab === 'officer' && currentUser.role === 'citizen') {
      addToast(
        'error',
        'สงวนสิทธิ์เฉพาะเจ้าหน้าที่',
        'ห้ามประชาชนเข้าถึง Dashboard และข้อมูลการจัดการของเจ้าหน้าที่'
      );
      setCurrentTab('home');
      return;
    }
    setCurrentTab(tab);
  };

  const handleSwitchRole = (role: 'citizen' | 'officer') => {
    if (role === 'officer') {
      const officerUser = INITIAL_USERS.find((u) => u.role === 'officer') || INITIAL_USERS[1];
      setCurrentUser(officerUser);
      saveStoredCurrentUser(officerUser);
      setCurrentTab('officer');
      addToast('info', 'สลับสู่โหมดเจ้าหน้าที่', `เข้าใช้งานในชื่อ ${officerUser.name} (${officerUser.department})`);
    } else {
      const citizenUser = INITIAL_USERS.find((u) => u.role === 'citizen') || INITIAL_USERS[0];
      setCurrentUser(citizenUser);
      saveStoredCurrentUser(citizenUser);
      if (currentTab === 'officer') {
        setCurrentTab('home');
      }
      addToast('info', 'สลับสู่โหมดประชาชน', `เข้าใช้งานในชื่อ ${citizenUser.name}`);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    saveStoredIsLoggedIn(false);
    setIsProfileModalOpen(false);
    addToast('info', 'ออกจากระบบแล้ว', 'คุณได้ออกจากระบบเรียบร้อยแล้ว สามารถเข้าสู่ระบบใหม่ได้ตลอดเวลา');
  };

  const handleResetData = () => {
    const result = resetToDemoData();
    setIssues(result.issues);
    setCurrentUser(result.user);
    setSelectedIssue(null);
    setNotifications(getStoredNotifications());
    addToast('info', 'รีเซ็ตข้อมูลแล้ว', 'กู้คืนข้อมูลตัวอย่างปัญหาชุมชนและบัญชีทดสอบเรียบร้อย');
  };

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    addToast('info', 'ทำเครื่องหมายอ่านแล้ว', 'อ่านการแจ้งเตือนทั้งหมดเรียบร้อย');
  };

  const handleSelectNotification = (notif: TicketNotification) => {
    // Mark this notification as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
    );
    setActiveModalNotification(notif);
    setIsStatusModalOpen(true);
  };

  // If user is not logged in, show Login & Registration screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans">
        <ToastContainer toasts={toasts} onDismiss={removeToast} />
        <LoginView
          onLoginSuccess={(user, role, rememberMe) => {
            setIsLoggedIn(true);
            saveStoredIsLoggedIn(rememberMe !== false);
            setCurrentUser(user);
            saveStoredCurrentUser(user);
            if (role === 'officer') {
              setCurrentTab('officer');
            } else {
              setCurrentTab('home');
            }
            addToast('success', 'เข้าสู่ระบบสำเร็จ', `ยินดีต้อนรับ ${user.name}`);
          }}
          onRegisterSuccess={(newUser, rememberMe) => {
            setIsLoggedIn(true);
            saveStoredIsLoggedIn(rememberMe !== false);
            setCurrentUser(newUser);
            saveStoredCurrentUser(newUser);
            setCurrentTab('home');
            addToast(
              'success',
              'ลงทะเบียนสำเร็จ!',
              `ยินดีต้อนรับสมาชิกใหม่ ${newUser.name} ต.${newUser.subDistrict || 'กังแอน'} เข้าสู่ชุมชนอำเภอปราสาท`
            );
          }}
        />
      </div>
    );
  }

  const pendingCount = issues.filter((i) => i.status === 'pending').length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans">
      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Main Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        currentUser={currentUser}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onLogout={handleLogout}
        onResetData={handleResetData}
        pendingCount={pendingCount}
        notifications={notifications}
        onSelectNotification={handleSelectNotification}
        onMarkAllNotificationsAsRead={handleMarkAllNotificationsAsRead}
        onSimulateStatusChange={handleSimulateStatusChange}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <HomeView
            issues={issues}
            onNavigate={handleSelectTab}
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
            onTestNotification={handleSimulateStatusChange}
          />
        )}

        {currentTab === 'my_history' && (
          <MyHistoryView
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

        {currentTab === 'hotlines' && (
          <HotlinesView
            onBackToHome={() => setCurrentTab(currentUser.role === 'officer' ? 'officer' : 'home')}
          />
        )}

        {currentTab === 'online_members' && (
          <OnlineMembersView
            currentUserRole={currentUser.role}
            onNavigateHome={() => setCurrentTab(currentUser.role === 'officer' ? 'officer' : 'home')}
          />
        )}

        {currentTab === 'dashboard' && <DashboardView issues={issues} />}

        {currentTab === 'officer' && currentUser.role !== 'citizen' && (
          <OfficerDashboard
            issues={issues}
            currentUser={currentUser}
            onSelectIssue={(issue) => setSelectedIssue(issue)}
            onQuickUpdateStatus={handleQuickUpdateStatus}
            onOpenOnlineMembers={() => setCurrentTab('online_members')}
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

      {/* Ticket Status Change Alert Modal (Modal แจ้งเตือนเมื่อสถานะ Ticket เปลี่ยนแปลง) */}
      <TicketStatusModal
        isOpen={isStatusModalOpen}
        notification={activeModalNotification}
        onClose={() => setIsStatusModalOpen(false)}
        onViewFullIssue={(ticketCode) => {
          setIsStatusModalOpen(false);
          const target = issues.find((i) => i.ticketCode === ticketCode);
          if (target) {
            setSelectedIssue(target);
          }
        }}
      />

      {/* User Profile & Account Management Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
        userIssues={issues.filter(
          (i) =>
            i.reporterName === currentUser.name ||
            i.reporterPhone === currentUser.phone ||
            (i.reporterEmail && i.reporterEmail === currentUser.email)
        )}
        onUpdateUser={(updated) => {
          setCurrentUser(updated);
          saveStoredCurrentUser(updated);
          addToast('success', 'บันทึกข้อมูลส่วนตัวสำเร็จ', 'ข้อมูลของคุณได้รับการอัปเดตเรียบร้อย');
        }}
        onLogout={handleLogout}
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
