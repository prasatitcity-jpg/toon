import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Layers,
  Filter,
  PlusCircle,
  Eye,
  X,
  Compass,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { CategoryType, Issue, IssueStatus } from '../types';
import { CATEGORIES, STATUSES } from '../data/categories';
import { StatusBadge } from './StatusBadge';
import { CategoryIcon } from './CategoryIcon';

interface MapViewProps {
  issues: Issue[];
  onSelectIssue: (issue: Issue) => void;
  onReportAtLocation: (lat: number, lng: number, placeName?: string) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  issues,
  onSelectIssue,
  onReportAtLocation,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<IssueStatus | 'all'>('all');
  const [activeIssue, setActiveIssue] = useState<Issue | null>(null);
  const [mapZoom, setMapZoom] = useState(1);
  const [mapStyle, setMapStyle] = useState<'standard' | 'satellite' | 'night'>('standard');
  const [clickedSpot, setClickedSpot] = useState<{ lat: number; lng: number; x: number; y: number } | null>(null);

  // Bounds for coordinate conversion
  // Min Lat: 13.73, Max Lat: 13.78
  // Min Lng: 100.49, Max Lng: 100.54
  const MIN_LAT = 13.73;
  const MAX_LAT = 13.78;
  const MIN_LNG = 100.49;
  const MAX_LNG = 100.54;

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      if (selectedCategory !== 'all' && issue.category !== selectedCategory) return false;
      if (selectedStatus !== 'all' && issue.status !== selectedStatus) return false;
      return true;
    });
  }, [issues, selectedCategory, selectedStatus]);

  // Convert lat/lng to percentage coordinates
  const getCoordinatesPercent = (lat: number, lng: number) => {
    const yPercent = ((MAX_LAT - lat) / (MAX_LAT - MIN_LAT)) * 100;
    const xPercent = ((lng - MIN_LNG) / (MAX_LNG - MIN_LNG)) * 100;
    return {
      x: Math.max(8, Math.min(92, xPercent)),
      y: Math.max(8, Math.min(92, yPercent)),
    };
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    const lat = MAX_LAT - y * (MAX_LAT - MIN_LAT);
    const lng = MIN_LNG + x * (MAX_LNG - MIN_LNG);

    setClickedSpot({
      lat: Number(lat.toFixed(4)),
      lng: Number(lng.toFixed(4)),
      x: x * 100,
      y: y * 100,
    });
    setActiveIssue(null);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8 space-y-4">
      {/* Map Control Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">
              แผนที่แสดงตำแหน่งปัญหาในชุมชน (Community GIS)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            แสดง {filteredIssues.length} จุดปัญหาในพื้นที่ชุมชน • คลิกที่หมุดเพื่อดูข้อมูล หรือคลิกพื้นที่ว่างเพื่อปักหมุดแจ้งเรื่อง
          </p>
        </div>

        {/* Filter Pill Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="text-xs py-1.5 px-3 rounded-xl border border-slate-300 bg-white font-medium focus:outline-teal-500"
          >
            <option value="all">ทุกสถานะปัญหา</option>
            {STATUSES.map((st) => (
              <option key={st.id} value={st.id}>
                {st.label}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="text-xs py-1.5 px-3 rounded-xl border border-slate-300 bg-white font-medium focus:outline-teal-500"
          >
            <option value="all">ทุกประเภทปัญหา</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>

          {/* Map style toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium border border-slate-200">
            <button
              type="button"
              onClick={() => setMapStyle('standard')}
              className={`px-2 py-1 rounded-lg transition-all ${
                mapStyle === 'standard' ? 'bg-white text-teal-800 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              ผังเมือง
            </button>
            <button
              type="button"
              onClick={() => setMapStyle('satellite')}
              className={`px-2 py-1 rounded-lg transition-all ${
                mapStyle === 'satellite' ? 'bg-white text-teal-800 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              ดาวเทียม
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Map Canvas */}
      <div className="relative w-full h-[600px] rounded-3xl overflow-hidden border border-slate-300 shadow-lg bg-slate-900 select-none">
        {/* Map Background Surface */}
        <div
          onClick={handleMapClick}
          className={`absolute inset-0 cursor-crosshair transition-all duration-300 overflow-hidden ${
            mapStyle === 'satellite'
              ? 'bg-[#1b2b2b]'
              : 'bg-[#e2e8f0]'
          }`}
          style={{
            transform: `scale(${mapZoom})`,
            transformOrigin: 'center center',
          }}
        >
          {/* Vector Streets & Rivers */}
          <svg className="w-full h-full absolute inset-0 pointer-events-none opacity-80" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke={mapStyle === 'satellite' ? '#243838' : '#cbd5e1'} strokeWidth="1" />
              </pattern>
            </defs>

            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Canal / River (Khlong) */}
            <path
              d="M -50 200 Q 250 180, 500 280 T 1100 240 T 1500 350"
              fill="none"
              stroke={mapStyle === 'satellite' ? '#0e3a47' : '#38bdf8'}
              strokeWidth="24"
              strokeLinecap="round"
              className="opacity-70"
            />
            <path
              d="M -50 200 Q 250 180, 500 280 T 1100 240 T 1500 350"
              fill="none"
              stroke={mapStyle === 'satellite' ? '#164e63' : '#7dd3fc'}
              strokeWidth="12"
              strokeLinecap="round"
            />

            {/* Main Road Avenues */}
            <line x1="0" y1="420" x2="1600" y2="420" stroke={mapStyle === 'satellite' ? '#334155' : '#ffffff'} strokeWidth="20" strokeLinecap="square" />
            <line x1="0" y1="420" x2="1600" y2="420" stroke={mapStyle === 'satellite' ? '#475569' : '#f59e0b'} strokeWidth="2" strokeDasharray="10 8" />

            <line x1="380" y1="0" x2="440" y2="900" stroke={mapStyle === 'satellite' ? '#334155' : '#ffffff'} strokeWidth="18" strokeLinecap="square" />
            <line x1="920" y1="0" x2="880" y2="900" stroke={mapStyle === 'satellite' ? '#334155' : '#ffffff'} strokeWidth="18" strokeLinecap="square" />

            {/* Secondary Sois / Streets */}
            <line x1="120" y1="120" x2="1400" y2="120" stroke={mapStyle === 'satellite' ? '#1e293b' : '#f8fafc'} strokeWidth="10" />
            <line x1="180" y1="600" x2="1450" y2="600" stroke={mapStyle === 'satellite' ? '#1e293b' : '#f8fafc'} strokeWidth="10" />
            <line x1="650" y1="120" x2="650" y2="800" stroke={mapStyle === 'satellite' ? '#1e293b' : '#f8fafc'} strokeWidth="10" />

            {/* Park Zone */}
            <rect x="180" y="240" width="160" height="130" rx="20" fill={mapStyle === 'satellite' ? '#143621' : '#bbf7d0'} opacity="0.6" />
            <rect x="720" y="470" width="150" height="100" rx="16" fill={mapStyle === 'satellite' ? '#143621' : '#bbf7d0'} opacity="0.6" />

            {/* Public building blocks */}
            <rect x="480" y="160" width="100" height="70" rx="8" fill={mapStyle === 'satellite' ? '#273549' : '#cbd5e1'} opacity="0.7" />
            <rect x="980" y="460" width="120" height="80" rx="8" fill={mapStyle === 'satellite' ? '#273549' : '#cbd5e1'} opacity="0.7" />
          </svg>

          {/* Landmark labels */}
          <div className="absolute top-1/4 left-[14%] pointer-events-none text-xs font-bold text-emerald-800 bg-white/80 px-2 py-0.5 rounded-md shadow-xs backdrop-blur-xs">
            🌳 สวนสุขภาพชุมชน
          </div>
          <div className="absolute top-1/5 left-[34%] pointer-events-none text-xs font-bold text-sky-800 bg-white/80 px-2 py-0.5 rounded-md shadow-xs backdrop-blur-xs">
            🏫 โรงเรียนเทศบาล 1
          </div>
          <div className="absolute top-[68%] left-[48%] pointer-events-none text-xs font-bold text-amber-800 bg-white/80 px-2 py-0.5 rounded-md shadow-xs backdrop-blur-xs">
            🏪 ตลาดสดเทศบาล
          </div>
          <div className="absolute top-[38%] right-[15%] pointer-events-none text-xs font-bold text-teal-800 bg-white/80 px-2 py-0.5 rounded-md shadow-xs backdrop-blur-xs">
            🏛️ ศาลากลางหมู่บ้านสุขใจ
          </div>

          {/* Issue Pins */}
          {filteredIssues.map((issue) => {
            const pos = getCoordinatesPercent(issue.latitude, issue.longitude);
            const isSelected = activeIssue?.id === issue.id;
            const catMeta = CATEGORIES.find((c) => c.id === issue.category) || CATEGORIES[0];

            // Color by status
            const pinBg = {
              pending: 'bg-amber-500 ring-amber-200',
              acknowledged: 'bg-sky-500 ring-sky-200',
              in_progress: 'bg-indigo-600 ring-indigo-200',
              resolved: 'bg-emerald-500 ring-emerald-200',
              closed: 'bg-slate-600 ring-slate-300',
            }[issue.status];

            return (
              <div
                key={issue.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIssue(issue);
                  setClickedSpot(null);
                }}
                className="absolute -translate-x-1/2 -translate-y-full cursor-pointer z-20 group transition-transform duration-200"
                style={{ top: `${pos.y}%`, left: `${pos.x}%` }}
              >
                <div className={`flex flex-col items-center ${isSelected ? 'scale-125 z-30' : 'hover:scale-115'}`}>
                  {/* Pin label tooltip */}
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900/90 text-white shadow-md mb-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {issue.ticketCode}: {issue.title.slice(0, 18)}...
                  </span>

                  {/* Marker Pin Icon */}
                  <div
                    className={`w-9 h-9 rounded-full text-white flex items-center justify-center shadow-lg ring-4 transition-all ${pinBg}`}
                  >
                    <CategoryIcon category={issue.category} size={16} />
                  </div>

                  {/* Pin pointer triangle */}
                  <div
                    className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px]"
                    style={{
                      borderTopColor:
                        issue.status === 'pending'
                          ? '#f59e0b'
                          : issue.status === 'acknowledged'
                          ? '#0ea5e9'
                          : issue.status === 'in_progress'
                          ? '#4f46e5'
                          : issue.status === 'resolved'
                          ? '#10b981'
                          : '#475569',
                    }}
                  />
                </div>
              </div>
            );
          })}

          {/* User clicked new pin preview */}
          {clickedSpot && (
            <div
              className="absolute -translate-x-1/2 -translate-y-full z-20"
              style={{ top: `${clickedSpot.y}%`, left: `${clickedSpot.x}%` }}
            >
              <div className="flex flex-col items-center animate-bounce">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-800 text-white shadow-lg mb-1 whitespace-nowrap">
                  คลิกที่นี่เพื่อแจ้งเหตุ
                </span>
                <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center ring-4 ring-teal-200 shadow-xl">
                  <MapPin size={18} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Floating Active Issue Popup Card */}
        {activeIssue && (
          <div className="absolute bottom-6 left-6 right-6 sm:left-auto sm:right-6 sm:max-w-sm bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 p-4 z-30 animate-in fade-in slide-in-from-bottom-3">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  {activeIssue.ticketCode}
                </span>
                <StatusBadge status={activeIssue.status} size="sm" />
              </div>
              <button
                type="button"
                onClick={() => setActiveIssue(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex gap-3 my-2">
              <img
                src={activeIssue.imageUrl}
                alt={activeIssue.title}
                className="w-20 h-20 rounded-xl object-cover shrink-0 border border-slate-200"
              />
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                  {activeIssue.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 line-clamp-1">
                  <MapPin size={12} className="text-rose-500 shrink-0" />
                  <span>{activeIssue.locationName}</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                  <Calendar size={11} />
                  <span>{activeIssue.createdAt.split('T')[0]}</span>
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                ผู้แจ้ง: {activeIssue.reporterName}
              </span>
              <button
                type="button"
                onClick={() => onSelectIssue(activeIssue)}
                className="flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg border border-teal-200 transition-colors"
              >
                <Eye size={13} />
                <span>ดูรายละเอียดเต็ม</span>
              </button>
            </div>
          </div>
        )}

        {/* Floating "Report At Location" Prompt Card */}
        {clickedSpot && !activeIssue && (
          <div className="absolute bottom-6 left-6 right-6 sm:left-auto sm:right-6 sm:max-w-xs bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-teal-200 p-4 z-30 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <MapPin size={14} className="text-teal-600" /> ปักหมุด ณ จุดนี้
              </span>
              <button
                type="button"
                onClick={() => setClickedSpot(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={15} />
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mb-3 font-mono">
              พิกัด: {clickedSpot.lat}, {clickedSpot.lng}
            </p>
            <button
              type="button"
              onClick={() => onReportAtLocation(clickedSpot.lat, clickedSpot.lng, `พิกัดชุมชน (${clickedSpot.lat}, ${clickedSpot.lng})`)}
              className="w-full flex items-center justify-center gap-1.5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
            >
              <PlusCircle size={15} />
              <span>แจ้งปัญหาที่จุดนี้ทันที</span>
            </button>
          </div>
        )}

        {/* Zoom and Map Tools Overlay */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 bg-white/90 backdrop-blur-xs p-1 rounded-xl shadow-md border border-slate-200">
          <button
            type="button"
            onClick={() => setMapZoom((prev) => Math.min(prev + 0.2, 1.8))}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="ขยายแผนที่"
          >
            <ZoomIn size={18} />
          </button>
          <button
            type="button"
            onClick={() => setMapZoom((prev) => Math.max(prev - 0.2, 0.8))}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="ย่อแผนที่"
          >
            <ZoomOut size={18} />
          </button>
          <button
            type="button"
            onClick={() => setMapZoom(1)}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors text-[10px] font-bold"
            title="รีเซ็ตขนาด"
          >
            100%
          </button>
        </div>

        {/* Map Legend */}
        <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-xs px-3 py-2 rounded-xl shadow-md border border-slate-200 text-xs hidden sm:flex items-center gap-3">
          <span className="text-[11px] font-bold text-slate-500">สถานะหมุด:</span>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-[11px] text-slate-700">รอตรวจ</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
            <span className="text-[11px] text-slate-700">กำลังทำ</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-[11px] text-slate-700">แก้ไขแล้ว</span>
          </div>
        </div>
      </div>
    </div>
  );
};
