import React, { useState, useEffect } from 'react';
import { Issue, IssueStatus, User, TicketNotification, AppTab, CategoryMeta, CategoryType } from './types';
import {
  getStoredIssues,
  saveStoredIssues,
  getStoredCurrentUser,
  saveStoredCurrentUser,
  getStoredUsers,
  saveStoredUsers,
  getStoredIsLoggedIn,
  saveStoredIsLoggedIn,
  getStoredCategories,
  saveStoredCategories,
  updateStoredCategoryPhoto,
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
import { BackendSettingsView } from './components/BackendSettingsView';
import { IssueDetailModal } from './components/IssueDetailModal';
import { TicketStatusModal } from './components/TicketStatusModal';
import { LoginView } from './components/LoginView';
import AdminLoginView from './components/AdminLoginView';
import { ProfileModal } from './components/ProfileModal';
import { SqlExportModal } from './components/SqlExportModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { INITIAL_USERS } from './data/mockData';
import { CATEGORIES } from './data/categories';
import {
  subscribeToIssues,
  subscribeToUsers,
  subscribeToNotifications,
  subscribeToCategorySettings,
  saveIssueToFirestore,
  updateIssueInFirestore,
  saveUserToFirestore,
  deleteUserFromFirestore,
  saveNotificationToFirestore,
  markAllNotificationsReadInFirestore,
  saveCategoryPhotoToFirestore,
  resetCategoryPhotoInFirestore,
  resetDatabaseToDefaults,
} from './services/firestoreService';
import {
  PhoneCall,
  Mail,
  Shield,
  Heart,
  RotateCcw,
  Sparkles,
  Eye,
  LayoutDashboard,
  Settings,
} from 'lucide-react';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => getStoredIsLoggedIn());
  const [issues, setIssues] = useState<Issue[]>(() => getStoredIssues());
  const [currentUser, setCurrentUser] = useState<User>(() => getStoredCurrentUser());
  const [allUsers, setAllUsers] = useState<User[]>(() => getStoredUsers());
  const [isDbConnected, setIsDbConnected] = useState<boolean>(true);
  const [categories, setCategories] = useState<CategoryMeta[]>(() => getStoredCategories());
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
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return (
        window.location.hash === '#admin' ||
        window.location.search.includes('admin') ||
        window.location.pathname.endsWith('/admin')
      );
    }
    return false;
  });

  // Listen for admin URL hash/route changes
  useEffect(() => {
    const handleUrlChange = () => {
      const isAdm =
        window.location.hash === '#admin' ||
        window.location.search.includes('admin') ||
        window.location.pathname.endsWith('/admin');
      setIsAdminRoute(isAdm);
    };

    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);
    return () => {
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  // Real-time synchronization with Cloud Firestore
  useEffect(() => {
    let isMounted = true;

    const unsubIssues = subscribeToIssues(
      (firestoreIssues) => {
        if (isMounted && firestoreIssues && firestoreIssues.length > 0) {
          setIssues(firestoreIssues);
          saveStoredIssues(firestoreIssues);
          setIsDbConnected(true);
        }
      },
      (err) => {
        console.warn('Firestore issues fallback mode:', err);
        if (isMounted) setIsDbConnected(false);
      }
    );

    const unsubUsers = subscribeToUsers(
      (firestoreUsers) => {
        if (isMounted && firestoreUsers && firestoreUsers.length > 0) {
          setAllUsers(firestoreUsers);
          saveStoredUsers(firestoreUsers);
        }
      },
      (err) => {
        console.warn('Firestore users fallback mode:', err);
      }
    );

    const unsubNotifs = subscribeToNotifications(
      (firestoreNotifs) => {
        if (isMounted && firestoreNotifs) {
          setNotifications(firestoreNotifs);
          saveStoredNotifications(firestoreNotifs);
        }
      },
      (err) => {
        console.warn('Firestore notifications fallback mode:', err);
      }
    );

    const unsubCategories = subscribeToCategorySettings(
      (firestoreCats) => {
        if (isMounted && firestoreCats && firestoreCats.length > 0) {
          setCategories(firestoreCats);
          saveStoredCategories(firestoreCats);
        }
      },
      (err) => {
        console.warn('Firestore categories fallback mode:', err);
      }
    );

    return () => {
      isMounted = false;
      unsubIssues();
      unsubUsers();
      unsubNotifs();
      unsubCategories();
    };
  }, []);

  // Enforce role separation: citizen & pending staff must not access officer or backend views (Requirement 9)
  useEffect(() => {
    const isRestrictedRole =
      currentUser.role === 'citizen' ||
      currentUser.role === 'staff_pending' ||
      currentUser.status === 'pending' ||
      currentUser.status === 'suspended';

    const isOfficerOrAdminView =
      currentTab === 'officer' ||
      currentTab === 'dashboard' ||
      currentTab === 'backend_settings';

    if (isRestrictedRole && isOfficerOrAdminView) {
      setCurrentTab('home');
      const reasonMsg =
        currentUser.role === 'staff_pending' || currentUser.status === 'pending'
          ? 'บัญชีเจ้าหน้าที่ของคุณอยู่ระหว่างรอการตรวจสอบและอนุมัติจาก Super Admin'
          : currentUser.status === 'suspended'
          ? 'บัญชีผู้ใช้งานนี้ถูกระงับการเข้าถึงระบบชั่วคราว'
          : 'สงวนสิทธิ์เฉพาะเจ้าหน้าที่อปท.และผู้ดูแลระบบที่ได้รับอนุญาตเท่านั้น';

      addToast('error', 'ไม่มีสิทธิ์เข้าถึงหน้านี้', reasonMsg);
    }
  }, [currentUser.role, currentUser.status, currentTab]);

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
    const finalAfterImage = afterImageUrl || issue.afterImageUrl;
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
      isRead: false,
      ...(finalAfterImage ? { afterImageUrl: finalAfterImage } : {}),
      ...(issue.subDistrict ? { subDistrict: issue.subDistrict } : {}),
      ...(issue.village ? { village: issue.village } : {}),
      ...(issue.reporterName ? { reporterName: issue.reporterName } : {}),
      ...(issue.reporterPhone ? { reporterPhone: issue.reporterPhone } : {}),
    };

    // Update notifications list
    setNotifications((prev) => [newNotif, ...prev]);

    // Sync notification to Firestore
    saveNotificationToFirestore(newNotif).catch((e) => {
      console.error('Failed to save notification to Firestore:', e);
    });

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
  const handleAddNewIssue = async (newIssue: Issue) => {
    setIssues((prev) => [newIssue, ...prev]);
    addToast(
      'success',
      'แจ้งปัญหาสำเร็จ!',
      `รหัส Ticket ของคุณคือ ${newIssue.ticketCode}`
    );
    try {
      await saveIssueToFirestore(newIssue);
    } catch (e) {
      console.error('Failed to save new issue to Firestore:', e);
    }
  };

  const handleUpdateIssue = async (updated: Issue) => {
    const oldIssue = issues.find((item) => item.id === updated.id);
    setIssues((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    setSelectedIssue(updated);
    addToast('success', 'บันทึกข้อมูลเรียบร้อย', `อัปเดตสถานะของ ${updated.ticketCode} ในฐานข้อมูลแล้ว`);

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

    try {
      await saveIssueToFirestore(updated);
    } catch (e) {
      console.error('Failed to update issue in Firestore:', e);
    }
  };

  const handleUpdateCategoryPhoto = async (catId: CategoryType, newPhotoUrl: string) => {
    // 1. Update state & localStorage immediately
    const updated = updateStoredCategoryPhoto(catId, newPhotoUrl);
    setCategories(updated);

    const catName = categories.find((c) => c.id === catId)?.label || catId;
    addToast(
      'success',
      'เปลี่ยนภาพหมวดหมู่สำเร็จ',
      `อัปเดตภาพจริงของหมวดหมู่ "${catName}" บนหน้าประชาชนเรียบร้อยแล้ว`
    );

    // 2. Persist to Firestore
    try {
      await saveCategoryPhotoToFirestore(catId, newPhotoUrl, currentUser.name || 'แอดมิน');
    } catch (e) {
      console.error('Failed to sync category photo to Firestore:', e);
    }
  };

  const handleResetCategoryPhoto = async (catId: CategoryType) => {
    const defaultCat = CATEGORIES.find((c) => c.id === catId);
    if (!defaultCat) return;
    const updated = updateStoredCategoryPhoto(catId, defaultCat.realPhotoUrl);
    setCategories(updated);
    addToast(
      'info',
      'รีเซ็ตภาพหมวดหมู่',
      `คืนค่าภาพตั้งต้นของหมวดหมู่ "${defaultCat.label}" เรียบร้อยแล้ว`
    );
    try {
      await resetCategoryPhotoInFirestore(catId);
    } catch (e) {
      console.error('Failed to reset category photo in Firestore:', e);
    }
  };

  const handleQuickUpdateStatus = async (issueId: string, newStatus: IssueStatus) => {
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

    try {
      await updateIssueInFirestore(issueId, {
        status: newStatus,
        timeline: updated.timeline,
      });
    } catch (e) {
      console.error('Failed to quick-update issue in Firestore:', e);
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
      ...(sampleAfterImage || target.afterImageUrl
        ? { afterImageUrl: sampleAfterImage || target.afterImageUrl }
        : {}),
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
          ...(sampleAfterImage ? { photoUrl: sampleAfterImage } : {}),
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

  const handleResetData = async () => {
    const result = resetToDemoData();
    setIssues(result.issues);
    setCurrentUser(result.user);
    setSelectedIssue(null);
    setNotifications(getStoredNotifications());
    addToast('info', 'รีเซ็ตข้อมูลแล้ว', 'กู้คืนข้อมูลตัวอย่างปัญหาชุมชนและบัญชีทดสอบเรียบร้อย');
    try {
      await resetDatabaseToDefaults();
    } catch (e) {
      console.error('Failed to reset Firestore:', e);
    }
  };

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    addToast('info', 'ทำเครื่องหมายอ่านแล้ว', 'อ่านการแจ้งเตือนทั้งหมดเรียบร้อย');
    markAllNotificationsReadInFirestore(notifications).catch((e) => {
      console.error('Failed to mark all read in Firestore:', e);
    });
  };

  // User Management Handlers (Save / Update User)
  const handleSaveUser = async (userToSave: User) => {
    try {
      // Update local state immediately
      setAllUsers((prev) => {
        const existingIndex = prev.findIndex((u) => u.id === userToSave.id);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = userToSave;
          return updated;
        }
        return [userToSave, ...prev];
      });

      // If current active user was modified, update currentUser
      if (currentUser.id === userToSave.id) {
        setCurrentUser(userToSave);
        saveStoredCurrentUser(userToSave);
      }

      // Sync to Firestore
      await saveUserToFirestore(userToSave);

      addToast(
        'success',
        'บันทึกข้อมูลสมาชิกสำเร็จ',
        `บันทึกข้อมูล ${userToSave.name} (${
          userToSave.role === 'officer'
            ? 'เจ้าหน้าที่'
            : userToSave.role === 'admin'
            ? 'แอดมิน'
            : 'ประชาชน'
        }) เรียบร้อยแล้ว`
      );
    } catch (err) {
      console.error('Failed to save user:', err);
      addToast('error', 'บันทึกไม่สำเร็จ', 'ไม่สามารถบันทึกลงฐานข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
    }
  };

  // Delete User Handler
  const handleDeleteUser = async (userId: string) => {
    if (userId === currentUser.id) {
      addToast('error', 'ไม่สามารถลบบัญชีตัวเองได้', 'คุณไม่สามารถลบบัญชีที่กำลังเข้าสู่ระบบอยู่ได้');
      return;
    }

    try {
      const userToDelete = allUsers.find((u) => u.id === userId);
      // Remove from local state
      setAllUsers((prev) => prev.filter((u) => u.id !== userId));

      // Sync deletion to Firestore
      await deleteUserFromFirestore(userId);

      addToast(
        'info',
        'ลบสมาชิกเรียบร้อย',
        `ลบบัญชี ${userToDelete?.name || userId} ออกจากระบบแล้ว`
      );
    } catch (err) {
      console.error('Failed to delete user:', err);
      addToast('error', 'ลบสมาชิกไม่สำเร็จ', 'เกิดข้อผิดพลาดในการลบข้อมูลจากฐานข้อมูล');
    }
  };

  const handleSelectNotification = (notif: TicketNotification) => {
    // Mark this notification as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
    );
    setActiveModalNotification(notif);
    setIsStatusModalOpen(true);
  };

  // If user is not logged in, show Citizen Login or Admin Login screen based on route
  if (!isLoggedIn) {
    if (isAdminRoute) {
      return (
        <div className="min-h-screen flex flex-col bg-slate-900 text-slate-800 font-sans">
          <ToastContainer toasts={toasts} onDismiss={removeToast} />
          <AdminLoginView
            isDbConnected={isDbConnected}
            onBackToCitizen={() => {
              if (typeof window !== 'undefined') {
                window.location.hash = '';
              }
              setIsAdminRoute(false);
            }}
            onLoginSuccess={(user, role, rememberMe) => {
              setIsLoggedIn(true);
              saveStoredIsLoggedIn(rememberMe !== false);
              setCurrentUser(user);
              saveStoredCurrentUser(user);
              if (user.role === 'super_admin' || user.email === '28970@pwk.ac.th') {
                setCurrentTab('dashboard');
              } else {
                setCurrentTab('officer');
              }
              addToast('success', 'เข้าสู่ระบบแอดมินสำเร็จ', `ยินดีต้อนรับ ${user.name}`);
            }}
          />
        </div>
      );
    }

    return (
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans">
        <ToastContainer toasts={toasts} onDismiss={removeToast} />
        <LoginView
          users={allUsers}
          isDbConnected={isDbConnected}
          onNavigateToAdmin={() => {
            if (typeof window !== 'undefined') {
              window.location.hash = '#admin';
            }
            setIsAdminRoute(true);
          }}
          onLoginSuccess={(user, role, rememberMe) => {
            setIsLoggedIn(true);
            saveStoredIsLoggedIn(rememberMe !== false);
            setCurrentUser(user);
            saveStoredCurrentUser(user);
            setCurrentTab('home');
            addToast('success', 'เข้าสู่ระบบสำเร็จ', `ยินดีต้อนรับ ${user.name}`);
          }}
          onRegisterSuccess={async (newUser, rememberMe) => {
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
            try {
              await saveUserToFirestore(newUser);
            } catch (e) {
              console.error('Failed to save registered user to Firestore:', e);
            }
          }}
        />
      </div>
    );
  }

  const pendingCount = issues.filter((i) => i.status === 'pending').length;

  const isOfficer =
    currentUser.role === 'officer' ||
    currentUser.role === 'admin' ||
    currentUser.role === 'staff' ||
    currentUser.role === 'super_admin';

  const isCitizenViewTab =
    currentTab === 'home' ||
    currentTab === 'report' ||
    currentTab === 'track' ||
    currentTab === 'my_history';

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
        isDbConnected={isDbConnected}
        onOpenSqlModal={() => setIsSqlModalOpen(true)}
      />

      {/* Admin Citizen View Banner Indicator */}
      {isOfficer && isCitizenViewTab && (
        <aside
          aria-label="แถบแจ้งเตือนมุมมองประชาชนสำหรับแอดมิน"
          className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white px-4 py-2 text-xs border-b border-emerald-700/60 shadow-inner flex flex-wrap items-center justify-between gap-3 sticky top-16 sm:top-20 z-30 backdrop-blur-md"
        >
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-extrabold text-emerald-300 flex items-center gap-1.5">
              <Eye size={15} />
              <span>มุมมองประชาชนทั่วไป (Citizen Portal Preview)</span>
            </span>
            <span className="hidden md:inline text-slate-300">
              — แอดมินกำลังดูหน้าจอในมุมมองของประชาชน
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-white/10 p-0.5 rounded-xl">
              <button
                type="button"
                onClick={() => handleSelectTab('home')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                  currentTab === 'home' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                หน้าหลัก
              </button>
              <button
                type="button"
                onClick={() => handleSelectTab('report')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                  currentTab === 'report' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                แจ้งเรื่อง
              </button>
              <button
                type="button"
                onClick={() => handleSelectTab('track')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                  currentTab === 'track' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                ติดตามปัญหา
              </button>
              <button
                type="button"
                onClick={() => handleSelectTab('map')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                  currentTab === 'map' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                แผนที่
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleSelectTab('officer')}
              className="flex items-center gap-1.5 px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-[11px] rounded-lg shadow-xs transition-transform active:scale-95 cursor-pointer"
            >
              <LayoutDashboard size={13} />
              <span>กลับสู่แดชบอร์ดแอดมิน</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectTab('backend_settings')}
              className="flex items-center gap-1 px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white font-medium text-[11px] rounded-lg transition-colors cursor-pointer"
            >
              <Settings size={13} />
              <span>ตั้งค่าหลังบ้าน</span>
            </button>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <HomeView
            issues={issues}
            onNavigate={handleSelectTab}
            onSelectIssue={(issue) => setSelectedIssue(issue)}
            onQuickSearch={() => setCurrentTab('track')}
            currentUser={currentUser}
            categories={categories}
            onUpdateCategoryPhoto={handleUpdateCategoryPhoto}
            onResetCategoryPhoto={handleResetCategoryPhoto}
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
            categories={categories}
            onUpdateCategoryPhoto={handleUpdateCategoryPhoto}
            onResetCategoryPhoto={handleResetCategoryPhoto}
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

        {currentTab === 'dashboard' && (
          <BackendSettingsView
            issues={issues}
            users={allUsers}
            currentUser={currentUser}
            onSaveUser={handleSaveUser}
            onDeleteUser={handleDeleteUser}
            onOpenSqlModal={() => setIsSqlModalOpen(true)}
            onResetSystemData={handleResetData}
            onSelectIssue={(issue) => setSelectedIssue(issue)}
            onUpdateIssue={handleUpdateIssue}
            onNavigateToCitizenView={() => handleSelectTab('home')}
            isDbConnected={isDbConnected}
          />
        )}

        {currentTab === 'backend_settings' && (
          <BackendSettingsView
            issues={issues}
            users={allUsers}
            currentUser={currentUser}
            onSaveUser={handleSaveUser}
            onDeleteUser={handleDeleteUser}
            onOpenSqlModal={() => setIsSqlModalOpen(true)}
            onResetSystemData={handleResetData}
            onSelectIssue={(issue) => setSelectedIssue(issue)}
            onUpdateIssue={handleUpdateIssue}
            onNavigateToCitizenView={() => handleSelectTab('home')}
            isDbConnected={isDbConnected}
          />
        )}

        {currentTab === 'officer' && currentUser.role !== 'citizen' && (
          <OfficerDashboard
            issues={issues}
            currentUser={currentUser}
            onSelectIssue={(issue) => setSelectedIssue(issue)}
            onQuickUpdateStatus={handleQuickUpdateStatus}
            onUpdateIssue={handleUpdateIssue}
            onOpenOnlineMembers={() => setCurrentTab('online_members')}
            onNavigateToCitizenView={() => handleSelectTab('home')}
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
        onUpdateUser={async (updated) => {
          setCurrentUser(updated);
          saveStoredCurrentUser(updated);
          addToast('success', 'บันทึกข้อมูลส่วนตัวสำเร็จ', 'ข้อมูลของคุณได้รับการอัปเดตเรียบร้อย');
          try {
            await saveUserToFirestore(updated);
          } catch (e) {
            console.error('Failed to update user profile in Firestore:', e);
          }
        }}
        onLogout={handleLogout}
      />

      {/* SQL Export Modal for Supabase / PostgreSQL */}
      <SqlExportModal
        isOpen={isSqlModalOpen}
        onClose={() => setIsSqlModalOpen(false)}
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
                <li>
                  <button type="button" onClick={() => setCurrentTab('backend_settings')} className="hover:text-emerald-700 font-semibold text-emerald-800 flex items-center gap-1">
                    <span>⚙️ ตั้งค่าหลังบ้าน (Dashboard & Member)</span>
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
