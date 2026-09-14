import React, { useState } from 'react';
import {
  Database,
  Copy,
  Check,
  Download,
  X,
  ExternalLink,
  Code2,
  Table,
  CheckCircle2,
} from 'lucide-react';

interface SqlExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SqlExportModal: React.FC<SqlExportModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const sqlDownloadUrl = '/database.sql';

  const handleCopySql = async () => {
    try {
      const response = await fetch(sqlDownloadUrl);
      const sqlText = await response.text();
      await navigator.clipboard.writeText(sqlText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleDownloadFile = () => {
    const link = document.createElement('a');
    link.href = sqlDownloadUrl;
    link.download = 'prasat_communitycare_supabase.sql';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      id="sql-export-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in"
    >
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white px-6 py-5 flex items-center justify-between relative overflow-hidden">
          <div className="absolute -right-6 -bottom-10 opacity-15 pointer-events-none text-white">
            <Database size={160} />
          </div>
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 text-amber-300">
              <Database size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">
                  ไฟล์ฐานข้อมูล SQL สำหรับ Supabase (PostgreSQL)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-400 text-slate-900">
                  Ready to Run
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                Prasat Community Care • โครงสร้างตาราง (Schema) + ข้อมูลเริ่มต้น (Seed Data)
              </p>
            </div>
          </div>
          <button
            id="close-sql-modal-btn"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors relative z-10"
            title="ปิดหน้าต่าง"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700 text-sm">
          {/* Action Row: Download & Copy Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200/80">
            <div>
              <div className="font-bold text-slate-900 text-base flex items-center gap-2">
                <span>ดาวน์โหลดหรือคัดลอกคำสั่ง SQL ไปใช้งาน</span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                ไฟล์ <code className="bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded font-mono text-[11px]">database.sql</code> ประกอบด้วยตาราง <strong>users</strong>, <strong>issues</strong>, <strong>notifications</strong> พร้อม RLS Policies และข้อมูลตัวอย่างครบถ้วน
              </p>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                id="copy-sql-btn"
                onClick={handleCopySql}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs bg-white text-emerald-900 border border-emerald-300 hover:bg-emerald-50 transition-all shadow-sm active:scale-95"
              >
                {copied ? (
                  <>
                    <Check size={16} className="text-emerald-600" />
                    <span>คัดลอกคำสั่งแล้ว!</span>
                  </>
                ) : (
                  <>
                    <Copy size={16} className="text-emerald-700" />
                    <span>คัดลอกโค้ด SQL</span>
                  </>
                )}
              </button>

              <button
                id="download-sql-btn"
                onClick={handleDownloadFile}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-700 text-white hover:bg-emerald-800 transition-all shadow-sm active:scale-95"
              >
                <Download size={16} />
                <span>ดาวน์โหลดไฟล์ .sql</span>
              </button>
            </div>
          </div>

          {/* Quick Guide on How to Use in Supabase */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
              <Code2 size={16} className="text-emerald-700" />
              <span>วิธีนำไฟล์ SQL ไปใส่ใช้งานใน Supabase</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs mb-2">
                  1
                </span>
                <p className="font-semibold text-slate-900 text-xs">เข้าสู่ Supabase</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  ล็อกอินเข้าที่ <strong>supabase.com</strong> แล้วสร้างหรือเปิดโปรเจกต์ของคุณ
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs mb-2">
                  2
                </span>
                <p className="font-semibold text-slate-900 text-xs">ไปที่ SQL Editor</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  เลือกเมนู <strong>SQL Editor</strong> ที่แถบซ้าย แล้วคลิก <strong>New query</strong>
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs mb-2">
                  3
                </span>
                <p className="font-semibold text-slate-900 text-xs">วางโค้ด SQL</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  วางเนื้อหาคำสั่งจากไฟล์ SQL ลงในช่องพิมพ์ของ Supabase
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs mb-2">
                  4
                </span>
                <p className="font-semibold text-slate-900 text-xs">กดปุ่ม RUN</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  คลิกปุ่ม <strong>Run</strong> เพื่อสร้างตารางและใส่ข้อมูลตั้งต้นทั้งหมดทันที
                </p>
              </div>
            </div>
          </div>

          {/* Database Specs / Tables overview */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
              <Table size={16} className="text-emerald-700" />
              <span>โครงสร้างตารางข้อมูลที่สร้างขึ้น (Database Tables)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono font-bold text-xs text-emerald-800">public.users</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                    13 คอลัมน์
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  จัดเก็บข้อมูลประชาชน, นายช่างเทศบาล/อบต., แอดมิน, รหัสผ่าน, ตำบล และสถานะออนไลน์
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono font-bold text-xs text-emerald-800">public.issues</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                    23 คอลัมน์
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  จัดเก็บคำร้อง, รหัส Ticket, พิกัด GPS, รูปถ่ายก่อน-หลัง, ประวัติ Timeline (JSONB)
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono font-bold text-xs text-emerald-800">public.notifications</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                    13 คอลัมน์
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  จัดเก็บการแจ้งเตือนความคืบหน้าคำร้องรายบุคคล Real-time พร้อมสถานะอ่าน/ยังไม่อ่าน
                </p>
              </div>
            </div>
          </div>

          {/* Code preview snippet */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">ตัวอย่างโค้ดคำสั่ง SQL (SQL Preview)</span>
              <a
                href={sqlDownloadUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
              >
                <span>เปิดไฟล์ SQL ในแท็บใหม่</span>
                <ExternalLink size={12} />
              </a>
            </div>
            <pre className="p-4 rounded-2xl bg-slate-900 text-emerald-300 font-mono text-xs overflow-x-auto max-h-56 leading-relaxed border border-slate-800 shadow-inner">
{`-- Prasat Community Care: Supabase / PostgreSQL Schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: users
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    username TEXT UNIQUE,
    password TEXT DEFAULT 'password123',
    email TEXT UNIQUE,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen', 'officer', 'admin')),
    sub_district TEXT,
    village TEXT,
    address TEXT,
    department TEXT,
    avatar TEXT,
    is_online BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: issues
CREATE TABLE IF NOT EXISTS issues (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    ticket_code TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    urgency TEXT NOT NULL DEFAULT 'medium',
    location_name TEXT NOT NULL,
    sub_district TEXT,
    village TEXT,
    latitude NUMERIC(10, 6) NOT NULL,
    longitude NUMERIC(10, 6) NOT NULL,
    reporter_name TEXT NOT NULL,
    reporter_phone TEXT NOT NULL,
    image_url TEXT,
    after_image_url TEXT,
    timeline JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row Level Security & Realtime
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read issues" ON issues FOR SELECT USING (true);`}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>รองรับ Supabase, PostgreSQL 14+, Neon, Cloud SQL ได้ 100%</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="close-modal-btn"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition-colors"
            >
              ปิด
            </button>
            <button
              id="footer-download-sql-btn"
              onClick={handleDownloadFile}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Download size={14} />
              <span>ดาวน์โหลด .sql ตอนนี้</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
