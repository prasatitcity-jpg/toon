import React, { useState, useMemo } from 'react';
import {
  LayoutDashboard,
  Users,
  Settings,
  ShieldCheck,
  UserPlus,
  Edit,
  Trash2,
  KeyRound,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  MapPin,
  Database,
  Download,
  RotateCcw,
  Sliders,
  Eye,
  EyeOff,
  UserCheck,
  UserX,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  Plus,
  X,
  Lock,
  Mail,
  Phone,
  Shield,
  Save,
  Check,
  Calendar,
  Layers,
  Award,
  Bell,
  Sparkles,
  RefreshCw,
  FileCode,
  ShieldAlert,
  Briefcase,
  Key,
  Ban,
  ArrowRight,
  Camera,
  Image as ImageIcon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Issue, User, IssueStatus, CategoryType } from '../types';
import { CATEGORIES, STATUSES, DEPARTMENTS } from '../data/categories';
import { PRASAT_SUB_DISTRICTS } from '../data/prasatLocations';
import { ElephantMascot, PrasatIcon, SurinCommunityBadge, SurinSilkRibbon } from './SurinMotifs';
import {
  getStaffApplications,
  approveStaffApplication,
  rejectStaffApplication,
  suspendUser,
  reactivateUser,
} from '../services/supabaseService';
import { CategoryIcon } from './CategoryIcon';
import { StatusBadge } from './StatusBadge';
import { AdminImageEditModal } from './AdminImageEditModal';
import { formatThaiDate } from '../utils/storage';

interface BackendSettingsViewProps {
  issues: Issue[];
  users: User[];
  currentUser: User;
  onSaveUser: (user: User) => Promise<void> | void;
  onDeleteUser: (userId: string) => Promise<void> | void;
  onOpenSqlModal: () => void;
  onResetSystemData: () => void;
  onSelectIssue?: (issue: Issue) => void;
  onUpdateIssue?: (issue: Issue) => Promise<void> | void;
  onNavigateToCitizenView?: () => void;
  isDbConnected?: boolean;
}

type BackendSubTab = 'dashboard' | 'photos' | 'staff_requests' | 'members' | 'settings';

export const BackendSettingsView: React.FC<BackendSettingsViewProps> = ({
  issues,
  users,
  currentUser,
  onSaveUser,
  onDeleteUser,
  onOpenSqlModal,
  onResetSystemData,
  onSelectIssue,
  onUpdateIssue,
  onNavigateToCitizenView,
  isDbConnected = true,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<BackendSubTab>('dashboard');

  // --- PHOTO & MEDIA MANAGEMENT STATES (ADMIN) ---
  const [photoEditingIssue, setPhotoEditingIssue] = useState<Issue | null>(null);
  const [photoFilterCategory, setPhotoFilterCategory] = useState<CategoryType | 'all'>('all');
  const [photoFilterStatus, setPhotoFilterStatus] = useState<
    'all' | 'has_both' | 'need_after' | 'need_before'
  >('all');
  const [photoSearch, setPhotoSearch] = useState('');
  const [photoSubDistrictFilter, setPhotoSubDistrictFilter] = useState<string>('all');

  // --- STAFF APPLICATION MANAGEMENT (SUPER ADMIN) ---
  const [staffApps, setStaffApps] = useState<User[]>([]);
  const [isLoadingStaffApps, setIsLoadingStaffApps] = useState(false);
  const [staffActionLoadingId, setStaffActionLoadingId] = useState<string | null>(null);
  const [staffActionMsg, setStaffActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [staffTabFilter, setStaffTabFilter] = useState<'all' | 'pending' | 'active' | 'rejected' | 'suspended'>('all');
  const [staffSearchQuery, setStaffSearchQuery] = useState('');
  const [rejectModalApp, setRejectModalApp] = useState<User | null>(null);
  const [rejectReason, setRejectReason] = useState('รหัสหน่วยงานหรือรหัสเชิญไม่ถูกต้อง');
  const [rejectCustomReason, setRejectCustomReason] = useState('');

  // --- MEMBER MANAGEMENT STATES ---
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'citizen' | 'officer' | 'admin'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'offline' | 'active' | 'suspended'>('all');
  const [subDistrictFilter, setSubDistrictFilter] = useState<string>('all');

  // Member Modal State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<User | null>(null);

  // User form fields
  const [formName, setFormName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('password123');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState<'citizen' | 'officer' | 'admin'>('officer');
  const [formDepartment, setFormDepartment] = useState('กองช่าง เทศบาลตำบลกังแอน');
  const [formSubDistrict, setFormSubDistrict] = useState('กังแอน');
  const [formVillage, setFormVillage] = useState('หมู่ 1 บ้านปะอาว');
  const [formAddress, setFormAddress] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formStatus, setFormStatus] = useState<'active' | 'suspended'>('active');
  const [formError, setFormError] = useState('');
  const [isSavingUser, setIsSavingUser] = useState(false);

  // System Settings local state (simulated configurable options)
  const [slaUrgentHours, setSlaUrgentHours] = useState('24');
  const [slaHighHours, setSlaHighHours] = useState('48');
  const [slaMediumHours, setSlaMediumHours] = useState('120');
  const [enableSoundAlerts, setEnableSoundAlerts] = useState(true);
  const [enablePushAlerts, setEnablePushAlerts] = useState(true);
  const [lineNotifyEnabled, setLineNotifyEnabled] = useState(false);
  const [lineToken, setLineToken] = useState('prasat-smart-city-token-2026');
  const [systemSaveSuccess, setSystemSaveSuccess] = useState(false);

  // --- DASHBOARD COMPUTED METRICS ---
  const totalIssues = issues.length;
  const resolvedIssues = issues.filter((i) => i.status === 'resolved' || i.status === 'closed').length;
  const inProgressIssues = issues.filter((i) => i.status === 'in_progress').length;
  const acknowledgedIssues = issues.filter((i) => i.status === 'acknowledged').length;
  const pendingIssues = issues.filter((i) => i.status === 'pending').length;
  const urgentIssues = issues.filter((i) => (i.urgency === 'urgent' || i.urgency === 'high') && i.status !== 'closed' && i.status !== 'resolved');

  const resolutionRate = totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0;

  // Member statistics
  const totalUsersCount = users.length;
  const citizenCount = users.filter((u) => u.role === 'citizen').length;
  const officerCount = users.filter((u) => u.role === 'officer').length;
  const adminCount = users.filter((u) => u.role === 'admin').length;
  const onlineUsersCount = users.filter((u) => u.isOnline).length;

  // Category counts for chart
  const categoryChartData = useMemo(() => {
    return CATEGORIES.map((cat) => {
      const count = issues.filter((i) => i.category === cat.id).length;
      return {
        name: cat.label,
        count,
        color: cat.color,
      };
    }).sort((a, b) => b.count - a.count);
  }, [issues]);

  // Status breakdown for donut chart
  const statusPieData = useMemo(() => {
    return STATUSES.map((st) => {
      const count = issues.filter((i) => i.status === st.id).length;
      return {
        name: st.label,
        value: count,
        color: st.color,
      };
    }).filter((item) => item.value > 0);
  }, [issues]);

  // Sub-district breakdown (Top sub-districts in Prasat)
  const subDistrictData = useMemo(() => {
    const list = PRASAT_SUB_DISTRICTS.map((sd) => {
      const count = issues.filter((i) => i.subDistrict === sd.name).length;
      const resolved = issues.filter((i) => i.subDistrict === sd.name && (i.status === 'resolved' || i.status === 'closed')).length;
      return {
        name: sd.name,
        total: count,
        resolved: resolved,
        pending: count - resolved,
      };
    });
    return list.sort((a, b) => b.total - a.total).slice(0, 8);
  }, [issues]);

  // Monthly trend mock series
  const monthlyTrendData = [
    { month: 'เม.ย.', reported: 14, resolved: 12 },
    { month: 'พ.ค.', reported: 22, resolved: 19 },
    { month: 'มิ.ย.', reported: 28, resolved: 25 },
    { month: 'ก.ค.', reported: 21, resolved: 20 },
    { month: 'ส.ค.', reported: 32, resolved: 29 },
    { month: 'ก.ย.', reported: issues.length, resolved: resolvedIssues },
  ];

  // Photo & Media management metrics and filtered issues
  const issuesWithBothPhotos = useMemo(
    () => issues.filter((i) => i.imageUrl && i.afterImageUrl),
    [issues]
  );
  const issuesNeedingAfter = useMemo(
    () => issues.filter((i) => i.imageUrl && !i.afterImageUrl),
    [issues]
  );
  const issuesNeedingBefore = useMemo(
    () => issues.filter((i) => !i.imageUrl),
    [issues]
  );

  const filteredPhotoIssues = useMemo(() => {
    return issues
      .filter((item) => {
        if (photoFilterCategory !== 'all' && item.category !== photoFilterCategory) return false;
        if (
          photoSubDistrictFilter !== 'all' &&
          !item.locationName.includes(photoSubDistrictFilter)
        )
          return false;
        if (photoFilterStatus === 'has_both' && (!item.imageUrl || !item.afterImageUrl))
          return false;
        if (photoFilterStatus === 'need_after' && (!item.imageUrl || item.afterImageUrl))
          return false;
        if (photoFilterStatus === 'need_before' && item.imageUrl) return false;

        if (photoSearch.trim()) {
          const q = photoSearch.toLowerCase();
          return (
            item.ticketCode.toLowerCase().includes(q) ||
            item.title.toLowerCase().includes(q) ||
            item.locationName.toLowerCase().includes(q) ||
            item.reporterName.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [issues, photoFilterCategory, photoSubDistrictFilter, photoFilterStatus, photoSearch]);

  // Filtered members list
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Role filter
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      // Status filter
      if (statusFilter === 'online' && !u.isOnline) return false;
      if (statusFilter === 'offline' && u.isOnline) return false;
      if (statusFilter === 'active' && u.status === 'suspended') return false;
      if (statusFilter === 'suspended' && u.status !== 'suspended') return false;
      // Sub-district filter
      if (subDistrictFilter !== 'all' && u.subDistrict !== subDistrictFilter) return false;
      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchName = u.name.toLowerCase().includes(q);
        const matchUsername = (u.username || '').toLowerCase().includes(q);
        const matchPhone = u.phone.includes(q);
        const matchEmail = (u.email || '').toLowerCase().includes(q);
        const matchDept = (u.department || '').toLowerCase().includes(q);
        const matchSubDist = (u.subDistrict || '').toLowerCase().includes(q);
        return matchName || matchUsername || matchPhone || matchEmail || matchDept || matchSubDist;
      }
      return true;
    });
  }, [users, roleFilter, statusFilter, subDistrictFilter, searchTerm]);

  // Open modal for adding new user
  const handleOpenAddUser = () => {
    setEditingUser(null);
    setFormName('');
    setFormUsername('');
    setFormPassword('password123');
    setFormEmail('');
    setFormPhone('');
    setFormRole('officer');
    setFormDepartment('กองช่าง เทศบาลตำบลกังแอน');
    setFormSubDistrict('กังแอน');
    setFormVillage('หมู่ 1 บ้านปะอาว');
    setFormAddress('');
    setFormNotes('');
    setFormStatus('active');
    setFormError('');
    setIsUserModalOpen(true);
  };

  // Open modal for editing user
  const handleOpenEditUser = (user: User) => {
    setEditingUser(user);
    setFormName(user.name);
    setFormUsername(user.username || '');
    setFormPassword(user.password || 'password123');
    setFormEmail(user.email || '');
    setFormPhone(user.phone || '');
    setFormRole(user.role);
    setFormDepartment(user.department || 'กองช่าง เทศบาลตำบลกังแอน');
    setFormSubDistrict(user.subDistrict || 'กังแอน');
    setFormVillage(user.village || 'หมู่ 1 บ้านปะอาว');
    setFormAddress(user.address || '');
    setFormNotes(user.notes || '');
    setFormStatus(user.status || 'active');
    setFormError('');
    setIsUserModalOpen(true);
  };

  // Save User (Add or Edit)
  const handleSaveUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('กรุณาระบุชื่อ-นามสกุล');
      return;
    }
    if (!formPhone.trim()) {
      setFormError('กรุณาระบุเบอร์โทรศัพท์');
      return;
    }

    setIsSavingUser(true);
    setFormError('');

    try {
      const userToSave: User = {
        id: editingUser ? editingUser.id : `usr-${Date.now()}`,
        name: formName.trim(),
        username: formUsername.trim() || formPhone.replace(/\D/g, '').slice(-6),
        password: formPassword || 'password123',
        email: formEmail.trim() || `${formUsername || 'user'}@communitycare.gov.th`,
        phone: formPhone.trim(),
        role: formRole,
        department: formRole === 'citizen' ? undefined : formDepartment,
        subDistrict: formSubDistrict,
        village: formVillage,
        address: formAddress.trim(),
        notes: formNotes.trim(),
        status: formStatus,
        avatar:
          editingUser?.avatar ||
          (formRole === 'officer'
            ? 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80'
            : formRole === 'admin'
            ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
            : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'),
        isOnline: editingUser ? editingUser.isOnline : false,
        createdAt: editingUser?.createdAt || new Date().toISOString(),
      };

      await onSaveUser(userToSave);
      setIsUserModalOpen(false);
    } catch (err) {
      setFormError('เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSavingUser(false);
    }
  };

  // Toggle user status (active/suspended)
  const handleToggleUserStatus = async (user: User) => {
    const updatedStatus = user.status === 'suspended' ? 'active' : 'suspended';
    const updatedUser: User = {
      ...user,
      status: updatedStatus,
    };
    await onSaveUser(updatedUser);
  };

  // Delete User Confirmation
  const handleConfirmDelete = async () => {
    if (!deleteConfirmUser) return;
    try {
      await onDeleteUser(deleteConfirmUser.id);
      setDeleteConfirmUser(null);
    } catch (err) {
      console.error('Delete user failed', err);
    }
  };

  // Save system configuration
  const handleSaveSystemSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSystemSaveSuccess(true);
    setTimeout(() => setSystemSaveSuccess(false), 3000);
  };

  // Export Data as JSON
  const handleDownloadBackupJSON = () => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      app: 'Prasat Community Care',
      version: '2.4.0',
      totalIssues: issues.length,
      totalUsers: users.length,
      issues: issues,
      users: users,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prasat_communitycare_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Load Staff Applications on mount
  const loadStaffApps = async () => {
    setIsLoadingStaffApps(true);
    try {
      const apps = await getStaffApplications();
      setStaffApps(apps);
    } catch (err) {
      console.error('Failed to load staff applications:', err);
    } finally {
      setIsLoadingStaffApps(false);
    }
  };

  React.useEffect(() => {
    loadStaffApps();
  }, []);

  // Super Admin Check
  const isSuperAdmin = currentUser.role === 'super_admin' || currentUser.id === 'usr-admin';
  const isAuthorizedRole =
    currentUser.role === 'officer' ||
    currentUser.role === 'admin' ||
    currentUser.role === 'staff' ||
    currentUser.role === 'super_admin' ||
    currentUser.id === 'usr-admin';

  // Rule 9: Citizen and staff_pending are strictly barred from backend settings and staff requests
  if (
    !isAuthorizedRole ||
    currentUser.role === 'citizen' ||
    currentUser.role === 'staff_pending' ||
    currentUser.status === 'pending' ||
    currentUser.status === 'suspended'
  ) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white rounded-3xl border border-rose-200 shadow-xl text-center space-y-4">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-900">ไม่มีสิทธิ์เข้าถึงระบบจัดการหลังบ้าน</h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          {currentUser.role === 'staff_pending' || currentUser.status === 'pending'
            ? 'บัญชีเจ้าหน้าที่ของคุณอยู่ระหว่างรอการตรวจสอบและอนุมัติจากผู้ดูแลระบบสูงสุด (Super Admin) กรุณารอการอนุมัติก่อนเข้าใช้งาน'
            : currentUser.status === 'suspended'
            ? 'บัญชีผู้ใช้งานนี้ถูกระงับการเข้าถึงระบบชั่วคราว กรุณาติดต่อศูนย์ประสานงาน อ.ปราสาท'
            : 'หน้านี้สงวนสิทธิ์เฉพาะเจ้าหน้าที่และผู้ดูแลระบบที่ได้รับการอนุมัติสิทธิ์จากฐานข้อมูลเท่านั้น'}
        </p>
      </div>
    );
  }

  // Staff application actions
  const handleApproveStaff = async (app: User) => {
    if (!isSuperAdmin) {
      alert('เฉพาะ Super Admin ที่ได้รับสิทธิ์เท่านั้นที่สามารถอนุมัติได้');
      return;
    }
    setStaffActionLoadingId(app.id);
    setStaffActionMsg(null);
    try {
      const updated = await approveStaffApplication(app.id);
      setStaffApps((prev) => prev.map((item) => (item.id === app.id ? updated : item)));
      await onSaveUser(updated);
      setStaffActionMsg({
        type: 'success',
        text: `อนุมัติบัญชี ${app.name} (${app.department} - ${app.position || 'เจ้าหน้าที่'}) สำเร็จแล้ว`,
      });
      await loadStaffApps();
    } catch (err: any) {
      setStaffActionMsg({
        type: 'error',
        text: err?.message || 'เกิดข้อผิดพลาดในการอนุมัติบัญชี',
      });
    } finally {
      setStaffActionLoadingId(null);
    }
  };

  const handleOpenRejectModal = (app: User) => {
    setRejectModalApp(app);
    setRejectReason('รหัสหน่วยงานหรือรหัสเชิญไม่ถูกต้อง');
    setRejectCustomReason('');
  };

  const handleConfirmReject = async () => {
    if (!rejectModalApp || !isSuperAdmin) return;
    setStaffActionLoadingId(rejectModalApp.id);
    const finalReason =
      rejectReason === 'custom'
        ? rejectCustomReason.trim() || 'คำขอไม่ผ่านการตรวจสอบ'
        : rejectReason;
    try {
      const updated = await rejectStaffApplication(rejectModalApp.id, finalReason);
      setStaffApps((prev) => prev.map((item) => (item.id === rejectModalApp.id ? updated : item)));
      await onSaveUser(updated);
      setStaffActionMsg({
        type: 'success',
        text: `ปฏิเสธคำขอของ ${rejectModalApp.name} เรียบร้อยแล้ว`,
      });
      setRejectModalApp(null);
      await loadStaffApps();
    } catch (err: any) {
      setStaffActionMsg({
        type: 'error',
        text: err?.message || 'เกิดข้อผิดพลาดในการปฏิเสธคำขอ',
      });
    } finally {
      setStaffActionLoadingId(null);
    }
  };

  const handleSuspendStaff = async (app: User) => {
    if (!isSuperAdmin) return;
    setStaffActionLoadingId(app.id);
    try {
      const updated = await suspendUser(app.id);
      setStaffApps((prev) => prev.map((item) => (item.id === app.id ? updated : item)));
      await onSaveUser(updated);
      setStaffActionMsg({
        type: 'success',
        text: `ระงับบัญชีผู้ใช้ ${app.name} ชั่วคราวแล้ว`,
      });
      await loadStaffApps();
    } catch (err: any) {
      setStaffActionMsg({
        type: 'error',
        text: err?.message || 'เกิดข้อผิดพลาดในการระงับบัญชี',
      });
    } finally {
      setStaffActionLoadingId(null);
    }
  };

  const handleReactivateStaff = async (app: User) => {
    if (!isSuperAdmin) return;
    setStaffActionLoadingId(app.id);
    try {
      const updated = await reactivateUser(app.id);
      setStaffApps((prev) => prev.map((item) => (item.id === app.id ? updated : item)));
      await onSaveUser(updated);
      setStaffActionMsg({
        type: 'success',
        text: `คืนสิทธิ์การใช้งานบัญชี ${app.name} สำเร็จ`,
      });
      await loadStaffApps();
    } catch (err: any) {
      setStaffActionMsg({
        type: 'error',
        text: err?.message || 'เกิดข้อผิดพลาดในการคืนสิทธิ์บัญชี',
      });
    } finally {
      setStaffActionLoadingId(null);
    }
  };

  const pendingStaffApps = staffApps.filter(
    (a) => a.role === 'staff_pending' || a.status === 'pending'
  );

  const filteredStaffApps = staffApps.filter((app) => {
    if (staffTabFilter === 'pending' && !(app.role === 'staff_pending' || app.status === 'pending')) return false;
    if (staffTabFilter === 'active' && app.status !== 'active') return false;
    if (staffTabFilter === 'rejected' && app.status !== 'rejected') return false;
    if (staffTabFilter === 'suspended' && app.status !== 'suspended') return false;

    if (staffSearchQuery.trim()) {
      const q = staffSearchQuery.toLowerCase();
      const matchName = app.name.toLowerCase().includes(q);
      const matchEmail = app.email.toLowerCase().includes(q);
      const matchDept = app.department?.toLowerCase().includes(q) || false;
      const matchPos = app.position?.toLowerCase().includes(q) || false;
      const matchInvite = app.inviteCode?.toLowerCase().includes(q) || false;
      if (!matchName && !matchEmail && !matchDept && !matchPos && !matchInvite) return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Top Banner & Title Bar */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-emerald-800">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#f59e0b 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xs">
                <ShieldCheck size={14} className="text-amber-400" />
                ระบบจัดการหลังบ้าน (Back-Office & Admin Console)
              </span>
              <span className="px-2.5 py-0.5 bg-emerald-800/60 text-emerald-200 border border-emerald-700/50 rounded-full text-[11px]">
                อ.ปราสาท จ.สุรินทร์
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border flex items-center gap-1 ${
                  isDbConnected
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}
              >
                <Database size={11} />
                {isDbConnected ? 'Firestore เชื่อมต่อแล้ว' : 'โหมดแคชท้องถิ่น'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
              <span>ศูนย์บริหารจัดการและตั้งค่าระบบหลังบ้าน</span>
            </h1>
            <p className="text-sm text-emerald-100/80 max-w-2xl leading-relaxed">
              ติดตามสถิติคำร้องเรียนรายตำบล ตัวชี้วัดประสิทธิภาพ (SLA) จัดการบัญชีสมาชิกและเจ้าหน้าที่อปท.
              พร้อมตั้งค่าความปลอดภัยและสคริปต์โครงสร้างฐานข้อมูลกลาง
            </p>
          </div>

          {/* Quick Action Badges */}
          <div className="flex flex-wrap items-center gap-2.5">
            {onNavigateToCitizenView && (
              <button
                id="btn-backend-view-citizen"
                type="button"
                onClick={onNavigateToCitizenView}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                title="สลับไปดูหน้าเว็บทั่วไปของประชาชน (หน้าหลัก / แจ้งปัญหา / ติดตามผล)"
              >
                <Eye size={15} />
                <span>ดูหน้าเว็บประชาชน</span>
              </button>
            )}
            <button
              id="btn-backend-open-sql"
              type="button"
              onClick={onOpenSqlModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <FileCode size={15} />
              <span>สคริปต์ SQL</span>
            </button>
            <button
              id="btn-backend-download-backup"
              type="button"
              onClick={handleDownloadBackupJSON}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs border border-white/20 transition-all cursor-pointer"
              title="ดาวน์โหลดข้อมูลสำรองทั้งหมดเป็น JSON"
            >
              <Download size={14} />
              <span>สำรอง JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* Staff Action Feedback Message */}
      {staffActionMsg && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 animate-in fade-in duration-150 ${
            staffActionMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold">
            {staffActionMsg.type === 'success' ? (
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle size={18} className="text-rose-600 shrink-0" />
            )}
            <span>{staffActionMsg.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setStaffActionMsg(null)}
            className="text-xs font-bold px-2 py-1 rounded-lg hover:bg-black/5"
          >
            ปิด
          </button>
        </div>
      )}

      {/* Main Navigation Sub-Tabs (Dashboard / Photos / Staff Requests / Member / System Settings) */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-xs grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5">
        <button
          id="tab-backend-dashboard"
          type="button"
          onClick={() => setActiveSubTab('dashboard')}
          className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeSubTab === 'dashboard'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'text-slate-600 hover:text-emerald-900 hover:bg-slate-50'
          }`}
        >
          <BarChart3 size={17} />
          <span>แดชบอร์ดสถิติ</span>
          <span
            className={`text-[11px] px-2 py-0.5 rounded-full font-extrabold ${
              activeSubTab === 'dashboard'
                ? 'bg-emerald-700 text-emerald-100'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {totalIssues}
          </span>
        </button>

        <button
          id="tab-backend-photos"
          type="button"
          onClick={() => setActiveSubTab('photos')}
          className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeSubTab === 'photos'
              ? 'bg-teal-800 text-white shadow-sm'
              : 'text-slate-600 hover:text-teal-900 hover:bg-slate-50'
          }`}
        >
          <Camera size={17} />
          <span>จัดการรูปภาพคำร้อง</span>
          <span
            className={`text-[11px] px-2 py-0.5 rounded-full font-extrabold ${
              activeSubTab === 'photos'
                ? 'bg-teal-700 text-teal-100'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {issues.length}
          </span>
        </button>

        <button
          id="tab-backend-staff-requests"
          type="button"
          onClick={() => setActiveSubTab('staff_requests')}
          className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeSubTab === 'staff_requests'
              ? 'bg-sky-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-sky-900 hover:bg-slate-50'
          }`}
        >
          <ShieldCheck size={17} />
          <span>คำขอสมัครเจ้าหน้าที่</span>
          {pendingStaffApps.length > 0 ? (
            <span className="text-[11px] px-2 py-0.5 rounded-full font-extrabold bg-amber-400 text-slate-950 shadow-xs animate-pulse">
              {pendingStaffApps.length} รออนุมัติ
            </span>
          ) : (
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-extrabold ${
                activeSubTab === 'staff_requests'
                  ? 'bg-sky-800 text-sky-100'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {staffApps.length}
            </span>
          )}
        </button>

        <button
          id="tab-backend-members"
          type="button"
          onClick={() => setActiveSubTab('members')}
          className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeSubTab === 'members'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'text-slate-600 hover:text-emerald-900 hover:bg-slate-50'
          }`}
        >
          <Users size={17} />
          <span>จัดการสมาชิก</span>
          <span
            className={`text-[11px] px-2 py-0.5 rounded-full font-extrabold ${
              activeSubTab === 'members'
                ? 'bg-emerald-700 text-emerald-100'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {totalUsersCount}
          </span>
        </button>

        <button
          id="tab-backend-settings"
          type="button"
          onClick={() => setActiveSubTab('settings')}
          className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeSubTab === 'settings'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'text-slate-600 hover:text-emerald-900 hover:bg-slate-50'
          }`}
        >
          <Settings size={17} />
          <span>ตั้งค่าระบบหลังบ้าน</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. DASHBOARD SUB-TAB */}
      {/* ========================================================================= */}
      {activeSubTab === 'dashboard' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Executive KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">เรื่องร้องเรียนทั้งหมด</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Layers size={17} />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 font-mono">
                {totalIssues}
              </p>
              <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-700 font-medium">
                <TrendingUp size={13} />
                <span>ครอบคลุม 16 ตำบล 241 หมู่บ้าน</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">แก้ไขเสร็จสิ้น (SLA)</span>
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                  <CheckCircle2 size={17} />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-teal-700 mt-2 font-mono">
                {resolutionRate}%
              </p>
              <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500">
                <span>ปิดเรื่องสำเร็จ {resolvedIssues} จาก {totalIssues} เรื่อง</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">กำลังเข้าดำเนินการ</span>
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
                  <Clock size={17} />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-indigo-600 mt-2 font-mono">
                {inProgressIssues + acknowledgedIssues}
              </p>
              <div className="flex items-center gap-1.5 mt-2 text-[11px] text-indigo-700">
                <span>กำลังทำ {inProgressIssues} • รับเรื่อง {acknowledgedIssues}</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">เรื่องเร่งด่วน / รอตรวจสอบ</span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                  <AlertTriangle size={17} />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-2 font-mono">
                {pendingIssues}
              </p>
              <div className="flex items-center gap-1.5 mt-2 text-[11px] text-amber-700">
                <span>ต้องเร่งตรวจสอบภายใน 24 ชม.</span>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* DASHBOARD SECTION: STAFF APPLICATIONS (User Requirement 8) */}
          {/* ========================================================================= */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="px-6 py-4.5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-50/80 via-white to-sky-50/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold shadow-xs">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">
                      คำขอสมัครเจ้าหน้าที่ (Staff Applications)
                    </h3>
                    {pendingStaffApps.length > 0 ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                        {pendingStaffApps.length} รออนุมัติ
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        พร้อมใช้งาน
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    รายการคำขอลงทะเบียนของแอดมินและเจ้าหน้าที่ปฏิบัติการที่รอการตรวจสอบสิทธิ์
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={loadStaffApps}
                  disabled={isLoadingStaffApps}
                  className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  title="รีเฟรชคำขอ"
                >
                  <RefreshCw size={15} className={isLoadingStaffApps ? 'animate-spin' : ''} />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSubTab('staff_requests')}
                  className="px-3.5 py-2 text-xs font-bold rounded-xl bg-sky-50 text-sky-800 border border-sky-200/80 hover:bg-sky-100 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <span>จัดการคำขอทั้งหมด ({staffApps.length})</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* Content List */}
            {isLoadingStaffApps ? (
              <div className="p-8 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
                <RefreshCw size={16} className="animate-spin text-sky-600" />
                <span>กำลังโหลดรายการคำขอสมัคร...</span>
              </div>
            ) : pendingStaffApps.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={24} />
                </div>
                <p className="text-sm font-bold text-slate-800">ไม่มีคำขอสมัครเจ้าหน้าที่ค้างตรวจสอบ</p>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  เจ้าหน้าที่และแอดมินทุกคนได้รับการตรวจสอบสิทธิ์เรียบร้อยแล้ว หากมีเจ้าหน้าที่สมัครใหม่เข้ามา รายชื่อจะปรากฏที่นี่ทันที
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {pendingStaffApps.slice(0, 5).map((app) => {
                  const isProcessing = staffActionLoadingId === app.id;
                  return (
                    <div
                      key={app.id}
                      className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
                    >
                      <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                        <div className="w-11 h-11 rounded-2xl bg-sky-900 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                          {app.name.charAt(0) || 'จ'}
                        </div>
                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-bold text-slate-900 truncate">
                              {app.name}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                              <Clock size={11} />
                              รอตรวจสอบ (Pending)
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {app.createdAt ? new Date(app.createdAt).toLocaleDateString('th-TH') : 'วันนี้'}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                            <span className="flex items-center gap-1 font-medium text-slate-800">
                              <Building2 size={13} className="text-slate-400" />
                              {app.department || 'ไม่ระบุหน่วยงาน'}
                            </span>
                            <span className="flex items-center gap-1 text-slate-500">
                              <Briefcase size={13} className="text-slate-400" />
                              {app.position || 'เจ้าหน้าที่'}
                            </span>
                            <span className="flex items-center gap-1 font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded-md text-slate-700">
                              <Key size={11} className="text-slate-400" />
                              รหัส: {app.inviteCode || '-'}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                            <span className="flex items-center gap-1">
                              <Mail size={12} />
                              {app.email}
                            </span>
                            {app.phone && (
                              <span className="flex items-center gap-1">
                                <Phone size={12} />
                                {app.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                        {isSuperAdmin ? (
                          <>
                            <button
                              id={`btn-reject-app-${app.id}`}
                              type="button"
                              disabled={isProcessing}
                              onClick={() => handleOpenRejectModal(app)}
                              className="px-3.5 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                            >
                              <X size={14} />
                              <span>ปฏิเสธ</span>
                            </button>

                            <button
                              id={`btn-approve-app-${app.id}`}
                              type="button"
                              disabled={isProcessing}
                              onClick={() => handleApproveStaff(app)}
                              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                            >
                              {isProcessing ? (
                                <RefreshCw size={14} className="animate-spin" />
                              ) : (
                                <Check size={14} />
                              )}
                              <span>{isProcessing ? 'กำลังอนุมัติ...' : 'อนุมัติ'}</span>
                            </button>
                          </>
                        ) : (
                          <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                            เฉพาะ Super Admin ที่มีสิทธิ์อนุมัติ
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Charts Row: Monthly Trend & Sub-district Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Monthly Trend Area Chart */}
            <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <TrendingUp size={18} className="text-emerald-700" />
                    <span>แนวโน้มการแจ้งปัญหาและการแก้ไขปัญหา (รอบ 6 เดือน)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    เปรียบเทียบจำนวนเรื่องที่ได้รับแจ้งกับการส่งมอบงานแก้ไขแล้วเสร็จ
                  </p>
                </div>
              </div>

              <div className="h-64 sm:h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorReported" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ea580c" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#ea580c" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#059669" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '12px',
                        border: 'none',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Area
                      type="monotone"
                      dataKey="reported"
                      name="เรื่องที่ได้รับแจ้ง"
                      stroke="#ea580c"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorReported)"
                    />
                    <Area
                      type="monotone"
                      dataKey="resolved"
                      name="แก้ไขเสร็จแล้ว"
                      stroke="#059669"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorResolved)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Status Breakdown Donut Chart */}
            <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-2xs flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <PieChartIcon size={18} className="text-emerald-700" />
                  <span>สัดส่วนสถานะการดำเนินงานปัจจุบัน</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">แบ่งตามขั้นตอนการแก้ไขปัญหา</p>
              </div>

              <div className="h-56 sm:h-64 w-full flex items-center justify-center my-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {statusPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '12px',
                        border: 'none',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
                <div className="p-2 rounded-xl bg-amber-50/70 border border-amber-200/60">
                  <p className="text-[10px] text-amber-800 font-medium">รอตรวจสอบ</p>
                  <p className="text-base font-bold text-amber-900 font-mono">{pendingIssues}</p>
                </div>
                <div className="p-2 rounded-xl bg-indigo-50/70 border border-indigo-200/60">
                  <p className="text-[10px] text-indigo-800 font-medium">กำลังดำเนินการ</p>
                  <p className="text-base font-bold text-indigo-900 font-mono">{inProgressIssues}</p>
                </div>
                <div className="p-2 rounded-xl bg-emerald-50/70 border border-emerald-200/60">
                  <p className="text-[10px] text-emerald-800 font-medium">แก้ไขแล้ว</p>
                  <p className="text-base font-bold text-emerald-900 font-mono">{resolvedIssues}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Sub-district Performance Bar Chart & Category Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sub-district Bar Chart */}
            <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Building2 size={18} className="text-emerald-700" />
                    <span>สถิติเรื่องร้องเรียนแยกตามตำบลใน อ.ปราสาท</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    จำนวนเรื่องทั้งหมดและเรื่องที่แก้ไขเสร็จแล้วใน 8 ตำบลหลัก
                  </p>
                </div>
              </div>

              <div className="h-64 sm:h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subDistrictData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '12px',
                        border: 'none',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Bar dataKey="total" name="เรื่องทั้งหมด" fill="#0284c7" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="resolved" name="แก้ไขสำเร็จแล้ว" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Breakdown list */}
            <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-2xs">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-3">
                <Layers size={18} className="text-emerald-700" />
                <span>จำแนกตาม 8 หมวดหมู่ปัญหา</span>
              </h3>
              <div className="space-y-3">
                {categoryChartData.map((cat) => {
                  const pct = totalIssues > 0 ? Math.round((cat.count / totalIssues) * 100) : 0;
                  return (
                    <div key={cat.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full inline-block"
                            style={{ backgroundColor: cat.color }}
                          />
                          {cat.name}
                        </span>
                        <span className="font-mono text-slate-500 font-bold">
                          {cat.count} เรื่อง ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: cat.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. PHOTO & MEDIA MANAGEMENT SUB-TAB (ADMIN IMAGE EDITOR) */}
      {/* ========================================================================= */}
      {activeSubTab === 'photos' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-teal-950 text-white p-6 rounded-3xl border border-teal-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-400/30 flex items-center gap-1.5">
                  <Camera size={14} />
                  <span>ระบบจัดการและแก้ไขข้อมูลรูปภาพ (Admin Image & Media Center)</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                  อ.ปราสาท 18 ตำบล
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>คลังภาพและเครื่องมือแก้ไขรูปภาพคำร้อง</span>
              </h2>
              <p className="text-xs sm:text-sm text-teal-100/80 max-w-2xl">
                แอดมินสามารถเปลี่ยนรูปภาพ แนบภาพถ่ายจริงจากพื้นที่ ใส่ภาพผลงานการเข้าซ่อมแซม และเพิ่มภาพหลักฐานเพิ่มเติมได้แบบเรียลไทม์
              </p>
            </div>
          </div>

          {/* KPI Photo Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              onClick={() => setPhotoFilterStatus('all')}
              className={`bg-white p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
                photoFilterStatus === 'all'
                  ? 'border-teal-700 ring-2 ring-teal-700/20 bg-teal-50/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold">เรื่องทั้งหมด</span>
                <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
                  <ImageIcon size={16} />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900">{issues.length}</div>
              <p className="text-[11px] text-slate-400 mt-1">เรื่องร้องเรียนทั้งหมดในระบบ</p>
            </div>

            <div
              onClick={() => setPhotoFilterStatus('has_both')}
              className={`bg-white p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
                photoFilterStatus === 'has_both'
                  ? 'border-emerald-600 ring-2 ring-emerald-600/20 bg-emerald-50/30'
                  : 'border-slate-200 hover:border-emerald-300'
              }`}
            >
              <div className="flex items-center justify-between text-emerald-700 mb-2">
                <span className="text-xs font-semibold">มีภาพก่อน-หลังครบ</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 size={16} />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-emerald-700">
                {issuesWithBothPhotos.length}
              </div>
              <p className="text-[11px] text-emerald-600 font-medium mt-1">มีทั้งภาพแจ้งและภาพผลงานซ่อม</p>
            </div>

            <div
              onClick={() => setPhotoFilterStatus('need_after')}
              className={`bg-white p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
                photoFilterStatus === 'need_after'
                  ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/30'
                  : 'border-slate-200 hover:border-amber-300'
              }`}
            >
              <div className="flex items-center justify-between text-amber-700 mb-2">
                <span className="text-xs font-semibold">รอใส่ภาพผลงานหลังซ่อม</span>
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Clock size={16} />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-amber-700">
                {issuesNeedingAfter.length}
              </div>
              <p className="text-[11px] text-amber-600 font-medium mt-1">ต้องแนบภาพหลังเข้าซ่อมแซม</p>
            </div>

            <div
              onClick={() => setPhotoFilterStatus('need_before')}
              className={`bg-white p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
                photoFilterStatus === 'need_before'
                  ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/30'
                  : 'border-slate-200 hover:border-rose-300'
              }`}
            >
              <div className="flex items-center justify-between text-rose-700 mb-2">
                <span className="text-xs font-semibold">ยังไม่มีภาพประกอบ</span>
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                  <AlertTriangle size={16} />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-rose-700">
                {issuesNeedingBefore.length}
              </div>
              <p className="text-[11px] text-rose-600 font-medium mt-1">สามารถใส่ภาพถ่ายจุดเกิดเหตุเพิ่มได้</p>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={photoSearch}
                  onChange={(e) => setPhotoSearch(e.target.value)}
                  placeholder="ค้นหาตามรหัสปัญหา, ชื่อปัญหา, ผู้แจ้ง, หรือสถานที่..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-teal-500 transition-all"
                />
                {photoSearch && (
                  <button
                    type="button"
                    onClick={() => setPhotoSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Status filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                <button
                  type="button"
                  onClick={() => setPhotoFilterStatus('all')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
                    photoFilterStatus === 'all'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  ทั้งหมด ({issues.length})
                </button>

                <button
                  type="button"
                  onClick={() => setPhotoFilterStatus('has_both')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
                    photoFilterStatus === 'has_both'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  มีรูปครบ ({issuesWithBothPhotos.length})
                </button>

                <button
                  type="button"
                  onClick={() => setPhotoFilterStatus('need_after')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
                    photoFilterStatus === 'need_after'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                  }`}
                >
                  รอภาพผลงาน ({issuesNeedingAfter.length})
                </button>

                <button
                  type="button"
                  onClick={() => setPhotoFilterStatus('need_before')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
                    photoFilterStatus === 'need_before'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                  }`}
                >
                  ขาดภาพแจ้ง ({issuesNeedingBefore.length})
                </button>
              </div>
            </div>

            {/* Sub-district & Category Dropdowns */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-400 font-medium">กรองเพิ่มเติม:</span>
              <select
                value={photoFilterCategory}
                onChange={(e) => setPhotoFilterCategory(e.target.value as CategoryType | 'all')}
                className="py-1.5 px-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium cursor-pointer"
              >
                <option value="all">ทุกหมวดหมู่ ({CATEGORIES.length})</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>

              <select
                value={photoSubDistrictFilter}
                onChange={(e) => setPhotoSubDistrictFilter(e.target.value)}
                className="py-1.5 px-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium cursor-pointer"
              >
                <option value="all">ทุกตำบลใน อ.ปราสาท (18 ตำบล)</option>
                {PRASAT_SUB_DISTRICTS.map((sd) => (
                  <option key={sd.id} value={sd.name}>
                    ต.{sd.name}
                  </option>
                ))}
              </select>

              <span className="ml-auto text-slate-400 font-mono text-[11px]">
                แสดง {filteredPhotoIssues.length} จาก {issues.length} รายการ
              </span>
            </div>
          </div>

          {/* Photo Gallery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredPhotoIssues.map((issue) => {
              const catMeta = CATEGORIES.find((c) => c.id === issue.category) || CATEGORIES[0];

              return (
                <div
                  key={issue.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  {/* Card Header */}
                  <div className="p-4 border-b border-slate-100 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                          {issue.ticketCode}
                        </span>
                        <div
                          className="w-4 h-4 rounded flex items-center justify-center text-white"
                          style={{ backgroundColor: catMeta.color }}
                        >
                          <CategoryIcon category={issue.category} size={10} />
                        </div>
                        <span className="text-xs text-slate-600 font-medium">{catMeta.label}</span>
                      </div>
                      <StatusBadge status={issue.status} size="sm" />
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                      {issue.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 line-clamp-1 flex items-center gap-1">
                      <MapPin size={12} className="text-rose-500 shrink-0" />
                      <span>{issue.locationName}</span>
                    </p>
                  </div>

                  {/* Dual Image Comparison Container */}
                  <div className="grid grid-cols-2 gap-1.5 p-3 bg-slate-50 border-y border-slate-100">
                    {/* Before Image Thumbnail */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-600 px-1">
                        <span className="flex items-center gap-1">
                          <Camera size={11} className="text-amber-600" />
                          <span>ภาพที่แจ้ง</span>
                        </span>
                        {issue.imageUrl && (
                          <span className="text-[9px] bg-slate-200 text-slate-700 px-1 rounded">
                            มีภาพ
                          </span>
                        )}
                      </div>
                      <div className="relative h-28 rounded-xl overflow-hidden bg-slate-200 border border-slate-200 group">
                        {issue.imageUrl ? (
                          <img
                            src={issue.imageUrl}
                            alt="ภาพที่แจ้ง"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-2 text-center bg-slate-100">
                            <ImageIcon size={20} className="mb-0.5 text-slate-300" />
                            <span className="text-[10px]">ไม่มีภาพ</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* After Image Thumbnail */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold text-emerald-800 px-1">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 size={11} className="text-emerald-600" />
                          <span>ผลงานซ่อม</span>
                        </span>
                        {issue.afterImageUrl ? (
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 rounded">
                            มีผลงาน
                          </span>
                        ) : (
                          <span className="text-[9px] bg-amber-100 text-amber-800 px-1 rounded font-normal">
                            ยังไม่มี
                          </span>
                        )}
                      </div>
                      <div className="relative h-28 rounded-xl overflow-hidden bg-emerald-50/50 border border-emerald-200 group">
                        {issue.afterImageUrl ? (
                          <img
                            src={issue.afterImageUrl}
                            alt="ผลงานซ่อม"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div
                            onClick={() => setPhotoEditingIssue(issue)}
                            className="w-full h-full flex flex-col items-center justify-center text-amber-700 p-2 text-center bg-amber-50/40 hover:bg-amber-50 cursor-pointer transition-colors border border-dashed border-amber-300 rounded-xl"
                          >
                            <Plus size={18} className="mb-0.5 text-amber-600" />
                            <span className="text-[10px] font-bold">ใส่รูปผลงาน</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Extra Photos indicator if present */}
                  {issue.additionalImages && issue.additionalImages.length > 0 && (
                    <div className="px-4 py-1.5 bg-indigo-50/60 text-indigo-800 text-[11px] font-semibold flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Layers size={12} />
                        <span>มีรูปภาพเพิ่มเติมแนบอยู่ {issue.additionalImages.length} ภาพ</span>
                      </span>
                    </div>
                  )}

                  {/* Actions Footer */}
                  <div className="p-3 bg-white flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setPhotoEditingIssue(issue)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-colors shadow-2xs cursor-pointer"
                    >
                      <Camera size={14} />
                      <span>แก้ไข / เปลี่ยนรูปภาพ</span>
                    </button>

                    {onSelectIssue && (
                      <button
                        type="button"
                        onClick={() => onSelectIssue(issue)}
                        className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
                        title="ดูรายละเอียดคำร้อง"
                      >
                        <Eye size={15} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredPhotoIssues.length === 0 && (
            <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 text-slate-500">
              <Camera size={44} className="mx-auto text-slate-300 mb-2" />
              <p className="text-base font-bold text-slate-700">ไม่พบรายการปัญหาตามเงื่อนไขที่เลือก</p>
              <p className="text-xs text-slate-400 mt-1">ลองเปลี่ยนคำค้นหา หรือปรับตัวกรองสถานะรูปภาพ</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. STAFF APPLICATION REQUESTS SUB-TAB (SUPER ADMIN WORKFLOW) */}
      {/* ========================================================================= */}
      {activeSubTab === 'staff_requests' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header Banner & Super Admin Status */}
          <div className="bg-gradient-to-r from-sky-950 via-slate-900 to-sky-950 text-white p-6 rounded-3xl border border-sky-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-400/30 flex items-center gap-1.5">
                  <ShieldCheck size={14} />
                  <span>ระบบตรวจสอบและอนุมัติเจ้าหน้าที่ (Staff Verification)</span>
                </span>
                {isSuperAdmin ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-400/40 flex items-center gap-1">
                    <Sparkles size={13} />
                    สิทธิ์ Super Admin
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-700/60 text-slate-300 border border-slate-600">
                    โหมดตรวจสอบข้อมูล (Read-Only)
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-white">คำขอสมัครบัญชีแอดมินและเจ้าหน้าที่ อปท.</h2>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                ตามนโยบายความปลอดภัยของระบบ ผู้สมัครเป็นเจ้าหน้าที่ทุกคนต้องได้รับการตรวจสอบสังกัดและรหัสยืนยัน
                โดยเฉพาะ <strong>Super Admin</strong> เท่านั้นที่มีสิทธิ์กดอนุมัติหรือปฏิเสธคำขอ
              </p>
            </div>

            <div className="flex items-center gap-2 self-start md:self-center">
              <button
                type="button"
                onClick={loadStaffApps}
                disabled={isLoadingStaffApps}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw size={14} className={isLoadingStaffApps ? 'animate-spin' : ''} />
                <span>รีเฟรชข้อมูล</span>
              </button>
            </div>
          </div>

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 font-medium">คำขอทั้งหมด</span>
              <p className="text-2xl font-black text-slate-900 font-mono mt-1">{staffApps.length}</p>
              <span className="text-[11px] text-slate-400">รายการในระบบ</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs text-amber-800 font-semibold">รอการอนุมัติ</span>
                {pendingStaffApps.length > 0 && (
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                )}
              </div>
              <p className="text-2xl font-black text-amber-600 font-mono mt-1">
                {pendingStaffApps.length}
              </p>
              <span className="text-[11px] text-amber-700">ต้องเร่งตรวจสอบ</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-emerald-800 font-medium">อนุมัติแล้ว</span>
              <p className="text-2xl font-black text-emerald-600 font-mono mt-1">
                {staffApps.filter((a) => a.status === 'active').length}
              </p>
              <span className="text-[11px] text-emerald-700">พร้อมปฏิบัติหน้าที่</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-rose-800 font-medium">ปฏิเสธคำขอ</span>
              <p className="text-2xl font-black text-rose-600 font-mono mt-1">
                {staffApps.filter((a) => a.status === 'rejected').length}
              </p>
              <span className="text-[11px] text-rose-700">ไม่ผ่านการตรวจสอบ</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-600 font-medium">ถูกระงับชั่วคราว</span>
              <p className="text-2xl font-black text-slate-700 font-mono mt-1">
                {staffApps.filter((a) => a.status === 'suspended').length}
              </p>
              <span className="text-[11px] text-slate-500">ระงับการใช้งาน</span>
            </div>
          </div>

          {/* Filter Chips & Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Status Filter Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { key: 'all', label: 'ทั้งหมด', count: staffApps.length },
                { key: 'pending', label: 'รอตรวจสอบ', count: pendingStaffApps.length },
                {
                  key: 'active',
                  label: 'อนุมัติแล้ว',
                  count: staffApps.filter((a) => a.status === 'active').length,
                },
                {
                  key: 'rejected',
                  label: 'ปฏิเสธแล้ว',
                  count: staffApps.filter((a) => a.status === 'rejected').length,
                },
                {
                  key: 'suspended',
                  label: 'ระงับบัญชี',
                  count: staffApps.filter((a) => a.status === 'suspended').length,
                },
              ].map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setStaffTabFilter(f.key as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    staffTabFilter === f.key
                      ? 'bg-sky-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{f.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      staffTabFilter === f.key ? 'bg-sky-800 text-sky-200' : 'bg-white text-slate-600'
                    }`}
                  >
                    {f.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={staffSearchQuery}
                onChange={(e) => setStaffSearchQuery(e.target.value)}
                placeholder="ค้นหาชื่อ, อีเมล, หน่วยงาน, รหัส..."
                className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-600"
              />
              {staffSearchQuery && (
                <button
                  type="button"
                  onClick={() => setStaffSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Applications List */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
            {isLoadingStaffApps ? (
              <div className="p-12 text-center text-slate-500 text-sm flex items-center justify-center gap-2">
                <RefreshCw size={18} className="animate-spin text-sky-600" />
                <span>กำลังโหลดข้อมูลคำขอ...</span>
              </div>
            ) : filteredStaffApps.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Search size={22} />
                </div>
                <h4 className="text-sm font-bold text-slate-800">ไม่พบคำขอตามเงื่อนไขที่เลือก</h4>
                <p className="text-xs text-slate-500">
                  {staffSearchQuery
                    ? `ไม่พบข้อมูลที่ตรงกับ "${staffSearchQuery}"`
                    : 'ไม่มีรายการในหมวดหมู่นี้ในปัจจุบัน'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredStaffApps.map((app) => {
                  const isProcessing = staffActionLoadingId === app.id;
                  const isPending = app.role === 'staff_pending' || app.status === 'pending';
                  const isActive = app.status === 'active';
                  const isRejected = app.status === 'rejected';
                  const isSuspended = app.status === 'suspended';

                  return (
                    <div
                      key={app.id}
                      className="p-5 sm:p-6 hover:bg-slate-50/70 transition-colors space-y-4"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Candidate Identity */}
                        <div className="flex items-start gap-4 min-w-0">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-800 to-slate-900 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-xs">
                            {app.name.charAt(0) || 'จ'}
                          </div>

                          <div className="space-y-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-sm sm:text-base font-bold text-slate-900">
                                {app.name}
                              </h4>

                              {/* Status Badge */}
                              {isPending && (
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                                  <Clock size={12} />
                                  <span>รอตรวจสอบ (Pending)</span>
                                </span>
                              )}
                              {isActive && (
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                                  <CheckCircle2 size={12} />
                                  <span>อนุมัติแล้ว (Active)</span>
                                </span>
                              )}
                              {isRejected && (
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                                  <X size={12} />
                                  <span>ปฏิเสธ (Rejected)</span>
                                </span>
                              )}
                              {isSuspended && (
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-700 border border-slate-300 flex items-center gap-1">
                                  <Ban size={12} />
                                  <span>ถูกระงับ (Suspended)</span>
                                </span>
                              )}

                              {/* Role Pill */}
                              <span className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium">
                                Role: {app.role}
                              </span>

                              <span className="text-[11px] text-slate-400">
                                {app.createdAt
                                  ? new Date(app.createdAt).toLocaleString('th-TH', {
                                      dateStyle: 'medium',
                                      timeStyle: 'short',
                                    })
                                  : 'ไม่ระบุวันเวลา'}
                              </span>
                            </div>

                            {/* Organization & Department info */}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 pt-0.5">
                              <span className="flex items-center gap-1.5 font-medium text-slate-800">
                                <Building2 size={14} className="text-slate-400" />
                                {app.department || 'ไม่ระบุหน่วยงาน'}
                              </span>
                              <span className="flex items-center gap-1.5 text-slate-600">
                                <Briefcase size={14} className="text-slate-400" />
                                {app.position || 'เจ้าหน้าที่'}
                              </span>
                              <span className="flex items-center gap-1.5 font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                                <Key size={12} className="text-amber-600" />
                                รหัสเชิญ: {app.inviteCode || '-'}
                              </span>
                            </div>

                            {/* Contact Details */}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-0.5">
                              <span className="flex items-center gap-1.5">
                                <Mail size={13} className="text-slate-400" />
                                {app.email}
                              </span>
                              {app.phone && (
                                <span className="flex items-center gap-1.5">
                                  <Phone size={13} className="text-slate-400" />
                                  {app.phone}
                                </span>
                              )}
                            </div>

                            {/* Rejection / Note message */}
                            {app.notes && (
                              <div className="mt-2 text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
                                <span className="font-semibold text-slate-900">หมายเหตุ: </span>
                                {app.notes}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons (Super Admin only) */}
                        <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                          {isSuperAdmin ? (
                            <>
                              {isPending && (
                                <>
                                  <button
                                    id={`btn-table-reject-${app.id}`}
                                    type="button"
                                    disabled={isProcessing}
                                    onClick={() => handleOpenRejectModal(app)}
                                    className="px-3.5 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                                  >
                                    <X size={14} />
                                    <span>ปฏิเสธคำขอ</span>
                                  </button>

                                  <button
                                    id={`btn-table-approve-${app.id}`}
                                    type="button"
                                    disabled={isProcessing}
                                    onClick={() => handleApproveStaff(app)}
                                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                                  >
                                    {isProcessing ? (
                                      <RefreshCw size={14} className="animate-spin" />
                                    ) : (
                                      <Check size={14} />
                                    )}
                                    <span>{isProcessing ? 'กำลังอนุมัติ...' : 'อนุมัติบัญชี'}</span>
                                  </button>
                                </>
                              )}

                              {isActive && (
                                <button
                                  id={`btn-table-suspend-${app.id}`}
                                  type="button"
                                  disabled={isProcessing}
                                  onClick={() => handleSuspendStaff(app)}
                                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 border border-slate-200 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                                >
                                  <Ban size={14} />
                                  <span>ระงับบัญชีชั่วคราว</span>
                                </button>
                              )}

                              {isSuspended && (
                                <button
                                  id={`btn-table-reactivate-${app.id}`}
                                  type="button"
                                  disabled={isProcessing}
                                  onClick={() => handleReactivateStaff(app)}
                                  className="px-3.5 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                                >
                                  <CheckCircle2 size={14} />
                                  <span>คืนสิทธิ์การใช้งาน</span>
                                </button>
                              )}

                              {isRejected && (
                                <button
                                  id={`btn-table-reapprove-${app.id}`}
                                  type="button"
                                  disabled={isProcessing}
                                  onClick={() => handleApproveStaff(app)}
                                  className="px-3.5 py-2 text-xs font-bold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                                >
                                  <Check size={14} />
                                  <span>ทบทวนและอนุมัติใหม่</span>
                                </button>
                              )}
                            </>
                          ) : (
                            <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                              เฉพาะ Super Admin
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MEMBER MANAGEMENT SUB-TAB */}
      {/* ========================================================================= */}
      {activeSubTab === 'members' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Member Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                <Users size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">สมาชิกทั้งหมด</p>
                <p className="text-xl font-bold text-slate-900 font-mono">{totalUsersCount} คน</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <UserCheck size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">ประชาชน</p>
                <p className="text-xl font-bold text-emerald-800 font-mono">{citizenCount} คน</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">เจ้าหน้าที่ & ช่าง</p>
                <p className="text-xl font-bold text-amber-900 font-mono">{officerCount} คน</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                <Shield size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">ผู้ดูแลระบบ (Admin)</p>
                <p className="text-xl font-bold text-purple-900 font-mono">{adminCount} คน</p>
              </div>
            </div>
          </div>

          {/* Search, Filters, and Add User Button */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              {/* Search input */}
              <div className="relative w-full sm:w-80">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อ, เบอร์โทร, สังกัด หรือตำบล..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Add New Member CTA */}
              <button
                id="btn-add-member"
                type="button"
                onClick={handleOpenAddUser}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <UserPlus size={16} />
                <span>เพิ่มสมาชิก / เจ้าหน้าที่ใหม่</span>
              </button>
            </div>

            {/* Filter pills */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-400 font-medium flex items-center gap-1 mr-1">
                <Filter size={13} />
                บทบาท:
              </span>
              {(['all', 'citizen', 'officer', 'admin'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                    roleFilter === r
                      ? 'bg-emerald-800 text-white font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {r === 'all'
                    ? 'ทั้งหมด'
                    : r === 'citizen'
                    ? 'ประชาชน'
                    : r === 'officer'
                    ? 'เจ้าหน้าที่'
                    : 'ผู้ดูแลระบบ'}
                </button>
              ))}

              <span className="text-slate-400 font-medium ml-2 mr-1">สถานะ:</span>
              {(['all', 'online', 'active', 'suspended'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                    statusFilter === st
                      ? 'bg-teal-700 text-white font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st === 'all'
                    ? 'ทั้งหมด'
                    : st === 'online'
                    ? 'ออนไลน์'
                    : st === 'active'
                    ? 'ปกติ'
                    : 'ระงับบัญชี'}
                </button>
              ))}

              <div className="ml-auto flex items-center gap-1 text-slate-400">
                <span>แสดง {filteredUsers.length} จาก {users.length} รายการ</span>
              </div>
            </div>
          </div>

          {/* Members Data Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4">สมาชิก</th>
                    <th className="py-3.5 px-3">บทบาท (Role)</th>
                    <th className="py-3.5 px-3">สังกัด / หน่วยงาน</th>
                    <th className="py-3.5 px-3">ตำบล / ที่อยู่</th>
                    <th className="py-3.5 px-3">เบอร์ติดต่อ</th>
                    <th className="py-3.5 px-3 text-center">สถานะ</th>
                    <th className="py-3.5 px-4 text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-400">
                        <Users size={36} className="mx-auto mb-2 opacity-40" />
                        <p className="font-semibold text-sm">ไม่พบรายชื่อสมาชิกตามเงื่อนไข</p>
                        <p className="text-xs text-slate-400 mt-1">ลองเปลี่ยนคำค้นหาหรือตัวกรองบทบาท</p>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isCurrentActiveUser = u.id === currentUser.id;
                      const isSuspended = u.status === 'suspended';

                      return (
                        <tr
                          key={u.id}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            isSuspended ? 'bg-rose-50/30 opacity-75' : ''
                          }`}
                        >
                          {/* Member info */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <img
                                  src={u.avatar}
                                  alt={u.name}
                                  className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200"
                                />
                                <span
                                  className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                                    u.isOnline ? 'bg-emerald-500' : 'bg-slate-300'
                                  }`}
                                  title={u.isOnline ? 'ออนไลน์' : 'ออฟไลน์'}
                                />
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-slate-900">{u.name}</span>
                                  {isCurrentActiveUser && (
                                    <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                                      คุณ
                                    </span>
                                  )}
                                </div>
                                <span className="text-[11px] text-slate-400 font-mono">
                                  @{u.username || 'user'}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Role */}
                          <td className="py-3 px-3">
                            {u.role === 'admin' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                                <Shield size={12} />
                                ผู้ดูแลระบบ
                              </span>
                            )}
                            {u.role === 'officer' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                <ShieldCheck size={12} />
                                เจ้าหน้าที่/ช่าง
                              </span>
                            )}
                            {u.role === 'citizen' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                                <UserCheck size={12} />
                                ประชาชน
                              </span>
                            )}
                          </td>

                          {/* Department */}
                          <td className="py-3 px-3 text-slate-600">
                            {u.department || '-'}
                          </td>

                          {/* Sub-district & Village */}
                          <td className="py-3 px-3 text-slate-600">
                            <div className="flex items-center gap-1">
                              <MapPin size={12} className="text-slate-400 shrink-0" />
                              <span>ต.{u.subDistrict || 'ปราสาท'}</span>
                            </div>
                            {u.village && (
                              <p className="text-[11px] text-slate-400 pl-4">{u.village}</p>
                            )}
                          </td>

                          {/* Phone */}
                          <td className="py-3 px-3 text-slate-700 font-mono">
                            {u.phone}
                          </td>

                          {/* Status */}
                          <td className="py-3 px-3 text-center">
                            {isSuspended ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                                ระงับใช้งาน
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                ปกติ
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Edit Button */}
                              <button
                                type="button"
                                onClick={() => handleOpenEditUser(u)}
                                className="p-1.5 text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                                title="แก้ไขข้อมูลสมาชิก"
                              >
                                <Edit size={15} />
                              </button>

                              {/* Toggle active / suspended */}
                              <button
                                type="button"
                                onClick={() => handleToggleUserStatus(u)}
                                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                  isSuspended
                                    ? 'text-emerald-600 hover:bg-emerald-50'
                                    : 'text-amber-600 hover:bg-amber-50'
                                }`}
                                title={isSuspended ? 'ปลดระงับบัญชี' : 'ระงับการใช้งานชั่วคราว'}
                              >
                                {isSuspended ? <UserCheck size={15} /> : <UserX size={15} />}
                              </button>

                              {/* Delete Button (disabled for current active user) */}
                              <button
                                type="button"
                                disabled={isCurrentActiveUser}
                                onClick={() => setDeleteConfirmUser(u)}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  isCurrentActiveUser
                                    ? 'text-slate-300 cursor-not-allowed'
                                    : 'text-rose-600 hover:text-rose-800 hover:bg-rose-50 cursor-pointer'
                                }`}
                                title={isCurrentActiveUser ? 'ไม่สามารถลบบัญชีที่กำลังล็อกอินอยู่ได้' : 'ลบสมาชิก'}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SYSTEM SETTINGS SUB-TAB */}
      {/* ========================================================================= */}
      {activeSubTab === 'settings' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <form onSubmit={handleSaveSystemSettings} className="space-y-6">
            {/* SLA Target Hours Settings */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                  <Clock size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    เกณฑ์เวลาเป้าหมายในการเข้าซ่อมและแก้ไข (SLA Standards)
                  </h3>
                  <p className="text-xs text-slate-500">
                    กำหนดจำนวนชั่วโมงเป้าหมายตามระดับความเร่งด่วนของเรื่องร้องเรียนใน อ.ปราสาท
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-100">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-rose-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-600" />
                    ด่วนที่สุด (Urgent)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={slaUrgentHours}
                      onChange={(e) => setSlaUrgentHours(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 font-mono"
                    />
                    <span className="text-xs text-slate-500 shrink-0">ชั่วโมง</span>
                  </div>
                  <p className="text-[11px] text-slate-400">ถนนทรุด หลุมลึก ต้นไม้ล้มขวาง</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-amber-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    เร่งด่วนสูง (High)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={slaHighHours}
                      onChange={(e) => setSlaHighHours(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 font-mono"
                    />
                    <span className="text-xs text-slate-500 shrink-0">ชั่วโมง</span>
                  </div>
                  <p className="text-[11px] text-slate-400">ท่อประปาแตก ไฟทางดับทั้งซอย</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-indigo-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    ปานกลาง / ทั่วไป (Medium/Low)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={slaMediumHours}
                      onChange={(e) => setSlaMediumHours(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 font-mono"
                    />
                    <span className="text-xs text-slate-500 shrink-0">ชั่วโมง</span>
                  </div>
                  <p className="text-[11px] text-slate-400">ขยะตกค้าง ป้ายชำรุด เสียงรบกวน</p>
                </div>
              </div>
            </div>

            {/* Notification & Dispatch Settings */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <Bell size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    การแจ้งเตือนและการส่งต่อเรื่องร้องเรียน (Notifications & Dispatch)
                  </h3>
                  <p className="text-xs text-slate-500">
                    ตั้งค่าเสียงแจ้งเตือนอัตโนมัติ และการส่งสัญญาณเตือนเจ้าหน้าที่เมื่อมีเคสฉุกเฉิน
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100 text-sm">
                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors cursor-pointer">
                  <div>
                    <p className="font-bold text-slate-800">เสียงแจ้งเตือนแบบเรียลไทม์ (Audio Sound)</p>
                    <p className="text-xs text-slate-500">เล่นเสียงสังเคราะห์เมื่อสถานะคำร้องมีการอัปเดต</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableSoundAlerts}
                    onChange={(e) => setEnableSoundAlerts(e.target.checked)}
                    className="w-5 h-5 accent-emerald-700 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors cursor-pointer">
                  <div>
                    <p className="font-bold text-slate-800">การแจ้งเตือนผ่าน Browser (Web Push)</p>
                    <p className="text-xs text-slate-500">แสดงการแจ้งเตือน Pop-up บนหน้าต่างเบราว์เซอร์</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={enablePushAlerts}
                    onChange={(e) => setEnablePushAlerts(e.target.checked)}
                    className="w-5 h-5 accent-emerald-700 rounded cursor-pointer"
                  />
                </label>

                <div className="p-3 rounded-xl bg-slate-50 space-y-2">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <p className="font-bold text-slate-800">Line Notify เจ้าหน้าที่ อ.ปราสาท (Webhook Simulation)</p>
                      <p className="text-xs text-slate-500">ส่งข้อความเข้ากลุ่ม Line กองช่างและฝ่ายสิ่งแวดล้อมอัตโนมัติ</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={lineNotifyEnabled}
                      onChange={(e) => setLineNotifyEnabled(e.target.checked)}
                      className="w-5 h-5 accent-emerald-700 rounded cursor-pointer"
                    />
                  </label>
                  {lineNotifyEnabled && (
                    <div className="pt-2">
                      <input
                        type="text"
                        value={lineToken}
                        onChange={(e) => setLineToken(e.target.value)}
                        placeholder="กรอก Line Notify Access Token..."
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg font-mono"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Save Button for Settings */}
            <div className="flex items-center justify-between">
              {systemSaveSuccess ? (
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
                  <CheckCircle2 size={16} />
                  <span>บันทึกการตั้งค่าระบบเรียบร้อยแล้ว</span>
                </div>
              ) : <div />}

              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm rounded-xl shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                <Save size={16} />
                <span>บันทึกการตั้งค่าทั้งหมด</span>
              </button>
            </div>
          </form>

          {/* Database & System Maintenance Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                <Database size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  การจัดการฐานข้อมูลและการสำรองข้อมูล (Database & Cloud Maintenance)
                </h3>
                <p className="text-xs text-slate-500">
                  ตรวจสอบความสมบูรณ์ ซิงค์ข้อมูลกับฐานข้อมูลกลาง หรือรีเซ็ตข้อมูลสู่ค่าเริ่มต้น
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-100">
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-950">ฐานข้อมูลกลาง (PostgreSQL)</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <p className="text-[11px] text-emerald-800">
                  กำลังซิงค์ {totalIssues} คำร้อง และ {totalUsersCount} สมาชิกแบบ Real-time
                </p>
                <div className="text-[10px] text-slate-400 font-mono truncate">
                  db: prasat_community_care
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-950">โครงสร้าง SQL & RLS</span>
                  <FileCode size={14} className="text-amber-700" />
                </div>
                <p className="text-[11px] text-amber-800">
                  ส่งออก Schema & Seed data เป็นสคริปต์ SQL พร้อมนโยบายรักษาความปลอดภัย RLS
                </p>
                <button
                  type="button"
                  onClick={onOpenSqlModal}
                  className="w-full py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  เปิดสคริปต์ SQL
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-950">คืนค่าข้อมูลตั้งต้น (Reset)</span>
                  <RotateCcw size={14} className="text-rose-700" />
                </div>
                <p className="text-[11px] text-rose-800">
                  ล้างข้อมูลทดสอบและรีเซ็ตกลับสู่ข้อมูลเริ่มต้นของ อ.ปราสาท
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('คุณต้องการรีเซ็ตข้อมูลทั้งหมดกลับสู่ค่าเริ่มต้นใช่หรือไม่?')) {
                      onResetSystemData();
                    }
                  }}
                  className="w-full py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  รีเซ็ตข้อมูลเริ่มต้น
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT MEMBER MODAL */}
      {/* ========================================================================= */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                  {editingUser ? <Edit size={18} /> : <UserPlus size={18} />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingUser ? 'แก้ไขข้อมูลสมาชิก / เจ้าหน้าที่' : 'เพิ่มสมาชิก / เจ้าหน้าที่ใหม่'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {editingUser ? `รหัสสมาชิก: ${editingUser.id}` : 'สร้างบัญชีผู้ใช้งานระบบ อ.ปราสาท'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsUserModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle size={15} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveUserSubmit} className="space-y-4 text-xs">
              {/* Name */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">ชื่อ - นามสกุล *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="เช่น นายช่างเกรียงไกร สิทธิโชค"
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                />
              </div>

              {/* Username & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">ชื่อผู้ใช้ (Username)</label>
                  <input
                    type="text"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    placeholder="kriangkrai"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">รหัสผ่าน (Password)</label>
                  <input
                    type="text"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="password123"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                  />
                </div>
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">เบอร์โทรศัพท์ *</label>
                  <input
                    type="tel"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="089-876-5432"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">อีเมล</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="officer@communitycare.gov.th"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                  />
                </div>
              </div>

              {/* Role & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">บทบาทในระบบ (Role)</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                  >
                    <option value="citizen">ประชาชนทั่วไป (Citizen)</option>
                    <option value="officer">เจ้าหน้าที่ / ทีมช่าง (Officer)</option>
                    <option value="admin">ผู้ดูแลระบบสูงสุด (Admin)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">สถานะบัญชี</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                  >
                    <option value="active">เปิดใช้งานปกติ (Active)</option>
                    <option value="suspended">ระงับการใช้งานชั่วคราว (Suspended)</option>
                  </select>
                </div>
              </div>

              {/* Department (if officer or admin) */}
              {formRole !== 'citizen' && (
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">สังกัดฝ่าย / กอง / เทศบาล-อบต.</label>
                  <input
                    type="text"
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                    placeholder="เช่น กองช่าง เทศบาลตำบลกังแอน"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                  />
                </div>
              )}

              {/* Sub-district & Village */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">ตำบล (อำเภอปราสาท)</label>
                  <select
                    value={formSubDistrict}
                    onChange={(e) => {
                      const newSd = e.target.value;
                      setFormSubDistrict(newSd);
                      const sdObj = PRASAT_SUB_DISTRICTS.find((s) => s.name === newSd);
                      if (sdObj && sdObj.villages.length > 0) {
                        setFormVillage(`หมู่ ${sdObj.villages[0].moo} ${sdObj.villages[0].name}`);
                      }
                    }}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                  >
                    {PRASAT_SUB_DISTRICTS.map((sd) => (
                      <option key={sd.id} value={sd.name}>
                        ต.{sd.name} ({sd.villages.length} หมู่บ้าน)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">หมู่บ้าน</label>
                  <input
                    type="text"
                    value={formVillage}
                    onChange={(e) => setFormVillage(e.target.value)}
                    placeholder="เช่น หมู่ 1 บ้านปะอาว"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">ที่อยู่ / ข้อมูลเพิ่มเติม</label>
                <textarea
                  rows={2}
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="บ้านเลขที่ หรือสถานที่ติดต่อ..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSavingUser}
                  className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {isSavingUser ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}
                  <span>{editingUser ? 'บันทึกการแก้ไข' : 'ยืนยันเพิ่มสมาชิก'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DELETE CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            <div className="text-center space-y-1">
              <h4 className="text-base font-bold text-slate-900">ยืนยันการลบสมาชิก</h4>
              <p className="text-xs text-slate-500">
                คุณแน่ใจหรือไม่ว่าต้องการลบสมาชิก{' '}
                <strong className="text-slate-800">{deleteConfirmUser.name}</strong> (@{deleteConfirmUser.username})
                ออกจากระบบ? การกระทำนี้ไม่สามารถย้อนกลับได้
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmUser(null)}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                ลบข้อมูลทันที
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REJECT STAFF APPLICATION MODAL */}
      {/* ========================================================================= */}
      {rejectModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">ปฏิเสธคำขอสมัครเจ้าหน้าที่</h4>
                <p className="text-xs text-slate-500">บันทึกเหตุผลการไม่อนุมัติสิทธิ์เข้าใช้งาน</p>
              </div>
            </div>

            {/* Candidate Summary Box */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">ผู้สมัคร:</span>
                <span className="font-bold text-slate-800">{rejectModalApp.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">หน่วยงาน:</span>
                <span className="font-medium text-slate-700">{rejectModalApp.department || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ตำแหน่ง:</span>
                <span className="font-medium text-slate-700">{rejectModalApp.position || 'เจ้าหน้าที่'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">รหัสเชิญที่ระบุ:</span>
                <span className="font-mono text-amber-700 font-bold">{rejectModalApp.inviteCode || '-'}</span>
              </div>
            </div>

            {/* Reason Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                เลือกเหตุผลในการปฏิเสธคำขอ:
              </label>
              <div className="space-y-1.5 text-xs">
                {[
                  'รหัสหน่วยงานหรือรหัสเชิญไม่ถูกต้อง',
                  'ไม่พบข้อมูลการปฏิบัติหน้าที่ในสังกัด อปท. อำเภอปราสาท',
                  'ข้อมูลการติดต่อ (อีเมลหรือเบอร์โทรศัพท์) ไม่สามารถติดต่อยืนยันตัวตนได้',
                  'custom',
                ].map((reason) => {
                  const isCustom = reason === 'custom';
                  const label = isCustom ? 'ระบุเหตุผลอื่น ๆ...' : reason;
                  const isChecked = rejectReason === reason;
                  return (
                    <label
                      key={reason}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                        isChecked
                          ? 'border-rose-400 bg-rose-50/50 text-rose-900 font-medium'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="rejectReasonRadio"
                        checked={isChecked}
                        onChange={() => setRejectReason(reason)}
                        className="mt-0.5 text-rose-600 focus:ring-rose-500"
                      />
                      <span>{label}</span>
                    </label>
                  );
                })}
              </div>

              {rejectReason === 'custom' && (
                <div className="pt-1">
                  <textarea
                    rows={2}
                    value={rejectCustomReason}
                    onChange={(e) => setRejectCustomReason(e.target.value)}
                    placeholder="พิมพ์เหตุผลการปฏิเสธที่นี่..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                disabled={staffActionLoadingId === rejectModalApp.id}
                onClick={() => setRejectModalApp(null)}
                className="flex-1 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={staffActionLoadingId === rejectModalApp.id}
                onClick={handleConfirmReject}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {staffActionLoadingId === rejectModalApp.id ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <X size={14} />
                )}
                <span>ยืนยันการปฏิเสธ</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Image Edit Modal */}
      {photoEditingIssue && (
        <AdminImageEditModal
          issue={photoEditingIssue}
          currentUser={currentUser}
          onClose={() => setPhotoEditingIssue(null)}
          onSave={async (updated) => {
            if (onUpdateIssue) {
              await onUpdateIssue(updated);
            }
            setPhotoEditingIssue(null);
          }}
        />
      )}
    </div>
  );
};
