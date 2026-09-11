import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building,
  Calendar,
  Layers,
  Award,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { Issue } from '../types';
import { CATEGORIES, STATUSES, DEPARTMENTS } from '../data/categories';
import { PRASAT_SUB_DISTRICTS } from '../data/prasatLocations';
import { ElephantMascot, PrasatIcon, SurinCommunityBadge } from './SurinMotifs';

interface DashboardViewProps {
  issues: Issue[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({ issues }) => {
  // Statistics computations
  const totalCount = issues.length;
  const resolvedCount = issues.filter((i) => i.status === 'resolved' || i.status === 'closed').length;
  const inProgressCount = issues.filter((i) => i.status === 'in_progress').length;
  const acknowledgedCount = issues.filter((i) => i.status === 'acknowledged').length;
  const pendingCount = issues.filter((i) => i.status === 'pending').length;

  const resolutionRate = totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0;

  // Category counts data for chart
  const categoryData = useMemo(() => {
    return CATEGORIES.map((cat) => {
      const count = issues.filter((i) => i.category === cat.id).length;
      return {
        name: cat.label,
        count,
        color: cat.color,
      };
    }).sort((a, b) => b.count - a.count);
  }, [issues]);

  // Status donut data
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

  // Monthly trends (past 6 months)
  const monthlyData = useMemo(() => {
    const months = [
      { month: 'เม.ย.', reported: 12, resolved: 10 },
      { month: 'พ.ค.', reported: 18, resolved: 16 },
      { month: 'มิ.ย.', reported: 24, resolved: 21 },
      { month: 'ก.ค.', reported: 19, resolved: 18 },
      { month: 'ส.ค.', reported: 28, resolved: 25 },
      { month: 'ก.ย. (ปัจจุบัน)', reported: issues.length, resolved: resolvedCount },
    ];
    return months;
  }, [issues, resolvedCount]);

  // Sub-district distribution (18 Tambons in Prasat)
  const subDistrictData = useMemo(() => {
    return PRASAT_SUB_DISTRICTS.map((sd) => {
      const subIssues = issues.filter((i) => i.locationName.includes(sd.name));
      const count = subIssues.length;
      const resolved = subIssues.filter((i) => i.status === 'resolved' || i.status === 'closed').length;
      return {
        id: sd.id,
        name: sd.name,
        count,
        resolved,
        rate: count > 0 ? Math.round((resolved / count) * 100) : 100,
      };
    }).sort((a, b) => b.count - a.count);
  }, [issues]);

  // Department distribution
  const departmentData = useMemo(() => {
    return DEPARTMENTS.map((dept) => {
      const count = issues.filter((i) => i.assignedDepartment === dept).length;
      return {
        dept,
        count,
      };
    }).sort((a, b) => b.count - a.count);
  }, [issues]);

  return (
    <div className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header with Surin Local Identity */}
      <div className="bg-white p-6 rounded-3xl border border-emerald-900/10 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
              <TrendingUp size={13} /> สถิติ & แดชบอร์ด
            </span>
            <span className="text-xs text-slate-400">• อัปเดตข้อมูลแบบเรียลไทม์</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 flex items-center gap-2">
            <span>สรุปผลการดำเนินงานแก้ไขปัญหา อ.ปราสาท จ.สุรินทร์</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            สถิติครอบคลุม 18 ตำบล 241 หมู่บ้าน การกระจายตัวของปัญหาตามหมวดหมู่ และอัตราความสำเร็จ
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-3 bg-emerald-50/70 px-4 py-2.5 rounded-2xl border border-emerald-200 shrink-0">
          <ElephantMascot size={42} />
          <div className="text-xs">
            <span className="font-bold text-emerald-950 block">ช้างน้อยรายงานสถิติ</span>
            <span className="text-emerald-700">อำเภอปราสาท เมืองปราสาทหิน</span>
          </div>
        </div>
      </div>

      {/* Hero Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Resolution Rate Gauge Card */}
        <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950 text-white rounded-3xl p-6 shadow-md relative overflow-hidden flex flex-col justify-between">
          {/* Subtle silk geometric pattern */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(#FDE68A 1px, transparent 1px), radial-gradient(#FDE68A 1px, transparent 1px)',
              backgroundSize: '24px 24px',
              backgroundPosition: '0 0, 12px 12px',
            }}
          />

          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-200 uppercase tracking-wider">
                เปอร์เซ็นต์ปัญหาที่แก้ไขแล้ว
              </span>
              <Award className="text-amber-300" size={22} />
            </div>
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-5xl font-extrabold tracking-tight text-amber-300">
                {resolutionRate}%
              </span>
              <span className="text-xs text-emerald-200">
                ({resolvedCount} จาก {totalCount} เรื่อง)
              </span>
            </div>
          </div>

          <div className="mt-6 space-y-2 relative z-10">
            {/* Progress Bar */}
            <div className="w-full bg-emerald-950/80 h-3 rounded-full overflow-hidden border border-emerald-700">
              <div
                className="bg-gradient-to-r from-amber-400 to-amber-300 h-full rounded-full transition-all duration-700 shadow-sm"
                style={{ width: `${resolutionRate}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-emerald-200 font-medium">
              <span>เป้าหมายมาตรฐาน อ.ปราสาท 85%</span>
              <span className="text-amber-200 font-semibold">
                สถานะ: {resolutionRate >= 60 ? 'ดีเยี่ยม' : 'อยู่ระหว่างดำเนินการ'}
              </span>
            </div>
          </div>
        </div>

        {/* Status Distribution Breakdown */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            สถานะคำร้องในระบบ
          </span>
          <div className="grid grid-cols-2 gap-3 my-2">
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
              <span className="text-xs text-amber-800 font-medium block">รอตรวจสอบ</span>
              <span className="text-2xl font-bold text-amber-900">{pendingCount}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200">
              <span className="text-xs text-sky-800 font-medium block">รับเรื่องแล้ว</span>
              <span className="text-2xl font-bold text-sky-900">{acknowledgedCount}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200">
              <span className="text-xs text-indigo-800 font-medium block">กำลังแก้ไข</span>
              <span className="text-2xl font-bold text-indigo-900">{inProgressCount}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-xs text-emerald-800 font-medium block">แก้ไขแล้วเสร็จ</span>
              <span className="text-2xl font-bold text-emerald-900">{resolvedCount}</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-100">
            <span>รวมทั้งหมด {totalCount} รายการ</span>
            <span className="text-emerald-700 font-semibold">พร้อมบริการประชาชน</span>
          </div>
        </div>

        {/* Average Resolution Time Estimation */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                ระยะเวลาแก้ไขเฉลี่ย
              </span>
              <Clock className="text-emerald-700" size={20} />
            </div>
            <div className="mt-3">
              <span className="text-4xl font-extrabold text-slate-900">1.8</span>
              <span className="text-sm font-semibold text-slate-500 ml-2">วันทำการ</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              เร็วกว่าเกณฑ์มาตรฐานเฉลี่ยระดับอำเภอ (3 วันทำการ) สำหรับเคสไฟฟ้าและสิ่งกีดขวาง
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-800">
            <span>ระดับความพึงพอใจประชาชน</span>
            <span className="bg-emerald-100 px-2 py-0.5 rounded-md">★ 4.8 / 5.0</span>
          </div>
        </div>
      </div>

      {/* Sub-District Distribution (18 Tambons) */}
      <div className="bg-white rounded-3xl p-6 border border-emerald-900/10 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <PrasatIcon size={20} className="text-emerald-800 shrink-0" />
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                สถิติปัญหาจำแนกตาม 18 ตำบลในอำเภอปราสาท
              </h2>
              <p className="text-xs text-slate-500">
                จำนวนเรื่องร้องทุกข์และอัตราการแก้ไขเสร็จสิ้นของแต่ละตำบล
              </p>
            </div>
          </div>
          <span className="text-xs text-emerald-800 font-semibold px-3 py-1 bg-emerald-50 rounded-full border border-emerald-200 self-start sm:self-auto">
            18 ตำบล • 241 หมู่บ้าน
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          {subDistrictData.map((sd) => (
            <div
              key={sd.id}
              className={`p-3 rounded-2xl border transition-all ${
                sd.count > 0
                  ? 'bg-emerald-50/40 border-emerald-200'
                  : 'bg-slate-50/60 border-slate-200/70'
              }`}
            >
              <span className="text-xs font-bold text-slate-800 block line-clamp-1">
                ต.{sd.name}
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className={`text-lg font-extrabold ${sd.count > 0 ? 'text-emerald-800' : 'text-slate-400'}`}>
                  {sd.count}
                </span>
                <span className="text-[10px] text-slate-500">เรื่อง</span>
              </div>
              <div className="mt-1 text-[10px] text-slate-500 flex items-center justify-between">
                <span>เสร็จ {sd.resolved}</span>
                <span className={sd.rate === 100 ? 'text-emerald-700 font-bold' : 'text-amber-700'}>
                  {sd.rate}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Bar Chart */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                จำแนกตามประเภทปัญหา (By Category)
              </h2>
              <p className="text-xs text-slate-500">
                สถิติจำนวนเรื่องร้องเรียนในแต่ละหมวดหมู่
              </p>
            </div>
            <BarChart3 className="text-emerald-700 shrink-0" size={20} />
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryData}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#334155' }}
                  width={90}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                  formatter={(value: any) => [`${value} เรื่อง`, 'จำนวน']}
                />
                <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Trend Area Chart */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                แนวโน้มปัญหาแต่ละเดือน (Monthly Trend)
              </h2>
              <p className="text-xs text-slate-500">
                เปรียบเทียบจำนวนเรื่องที่แจ้ง vs แก้ไขแล้ว (6 เดือนย้อนหลัง)
              </p>
            </div>
            <Calendar className="text-emerald-700 shrink-0" size={20} />
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReported" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#047857" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#047857" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area
                  type="monotone"
                  dataKey="reported"
                  name="รับแจ้งทั้งหมด"
                  stroke="#d97706"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorReported)"
                />
                <Area
                  type="monotone"
                  dataKey="resolved"
                  name="แก้ไขสำเร็จ"
                  stroke="#047857"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorResolved)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Department Distribution Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Building className="text-emerald-700" size={18} />
          <h2 className="text-sm sm:text-base font-bold text-slate-900">
            ภาระงานจำแนกตามหน่วยงานผู้รับผิดชอบ (By Department)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {departmentData.map((d, index) => (
            <div
              key={index}
              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
            >
              <span className="text-xs font-medium text-slate-800 line-clamp-1">{d.dept}</span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white text-emerald-800 border border-slate-200 shadow-2xs">
                {d.count} เรื่อง
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
