import React from 'react';

interface MascotProps {
  className?: string;
  size?: number;
  mood?: 'happy' | 'caring' | 'salute' | 'working';
}

/**
 * Modern Friendly Elephant Mascot of Prasat, Surin
 * Clean vector, polite, warm, and community-focused
 */
export const ElephantMascot: React.FC<MascotProps> = ({
  className = '',
  size = 48,
  mood = 'happy',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="มาสคอตช้างน้อยอำเภอปราสาท"
    >
      {/* Background Soft Glow */}
      <circle cx="60" cy="60" r="54" fill="#F0FDF4" />
      <circle cx="60" cy="60" r="52" stroke="#86EFAC" strokeWidth="1.5" strokeDasharray="4 4" />

      {/* Elephant Large Friendly Ears */}
      {/* Left Ear */}
      <path
        d="M34 46C20 44 14 58 15 72C16 82 24 90 35 88C38 87 39 80 39 74"
        fill="#94A3B8"
        stroke="#475569"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M31 52C22 51 18 61 19 70C20 76 25 81 32 80"
        fill="#CBD5E1"
      />

      {/* Right Ear */}
      <path
        d="M86 46C100 44 106 58 105 72C104 82 96 90 85 88C82 87 81 80 81 74"
        fill="#94A3B8"
        stroke="#475569"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M89 52C98 51 102 61 101 70C100 76 95 81 88 80"
        fill="#CBD5E1"
      />

      {/* Elephant Body / Shoulders */}
      <path
        d="M36 86C36 102 46 112 60 112C74 112 84 102 84 86"
        fill="#64748B"
        stroke="#475569"
        strokeWidth="2.5"
      />

      {/* Thai Silk Scarf / Collar (Surin Mudmee Silk motif) */}
      <path
        d="M40 85C47 91 73 91 80 85C77 95 69 101 60 101C51 101 43 95 40 85Z"
        fill="#D97706"
        stroke="#92400E"
        strokeWidth="2"
      />
      {/* Silk diamond pattern on scarf */}
      <path
        d="M52 92L60 86L68 92L60 98Z"
        fill="#FDE68A"
      />
      <circle cx="60" cy="92" r="2" fill="#B45309" />

      {/* Elephant Head */}
      <ellipse
        cx="60"
        cy="58"
        rx="28"
        ry="26"
        fill="#94A3B8"
        stroke="#475569"
        strokeWidth="2.5"
      />

      {/* Soft Cheeks */}
      <ellipse cx="43" cy="65" rx="4" ry="2.5" fill="#FCA5A5" opacity="0.8" />
      <ellipse cx="77" cy="65" rx="4" ry="2.5" fill="#FCA5A5" opacity="0.8" />

      {/* Big Sparkling Eyes */}
      {/* Left Eye */}
      <ellipse cx="48" cy="54" rx="4" ry="5" fill="#1E293B" />
      <circle cx="49.5" cy="52" r="1.5" fill="#FFFFFF" />
      <circle cx="47" cy="56" r="0.8" fill="#FFFFFF" />

      {/* Right Eye */}
      <ellipse cx="72" cy="54" rx="4" ry="5" fill="#1E293B" />
      <circle cx="73.5" cy="52" r="1.5" fill="#FFFFFF" />
      <circle cx="71" cy="56" r="0.8" fill="#FFFFFF" />

      {/* Friendly Eyebrows */}
      <path
        d="M44 46C47 44 51 45 52 47"
        stroke="#475569"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M76 46C73 44 69 45 68 47"
        stroke="#475569"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Small Cute Tusks (Ivory) */}
      <path
        d="M51 72C50 78 48 83 45 84C46 79 49 74 52 71"
        fill="#FEF08A"
        stroke="#CA8A04"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M69 72C70 78 72 83 75 84C74 79 71 74 68 71"
        fill="#FEF08A"
        stroke="#CA8A04"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      {/* Elephant Trunk (Upcurved = Prosperity & Happiness) */}
      <path
        d="M56 64C56 74 57 82 64 82C69 82 71 77 69 73C67 70 63 71 63 74"
        fill="#94A3B8"
        stroke="#475569"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Trunk skin creases */}
      <path d="M57 69C59 69 61 69 62 70" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M58 74C60 74 62 74 63 75" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" />

      {/* Traditional Small Headpiece / Gold Flower Accent (Surin heritage) */}
      <path
        d="M60 30L63 36L69 37L64 41L66 47L60 43L54 47L56 41L51 37L57 36Z"
        fill="#F59E0B"
        stroke="#B45309"
        strokeWidth="1"
      />
      <circle cx="60" cy="38" r="2.5" fill="#DC2626" />
    </svg>
  );
};

/**
 * Modern Khmer Sanctuary Motif (Prasat Silhouette)
 * Refined and architecturally inspired by Prasat Ban Phlai / Ta Muen
 */
export const PrasatIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 24,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Spire Pinnacle / Kalasa */}
      <circle cx="24" cy="4" r="2" fill="currentColor" />
      <path d="M24 6V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />

      {/* Tier 1 (Top Shikhara) */}
      <path
        d="M21 11H27L28 16H20L21 11Z"
        fill="currentColor"
        fillOpacity="0.25"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      {/* Tier 2 */}
      <path
        d="M18 16H30L32 23H16L18 16Z"
        fill="currentColor"
        fillOpacity="0.35"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      {/* Tier 3 (Main Sanctuary Roof & Cornices) */}
      <path
        d="M14 23H34L36 30H12L14 23Z"
        fill="currentColor"
        fillOpacity="0.45"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      {/* Stone Chamber Base with Archway Door */}
      <path
        d="M13 30H35V44H13V30Z"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      {/* Traditional Arch Portal (Gopura Door) */}
      <path
        d="M20 44V36C20 33.79 21.79 32 24 32C26.21 32 28 33.79 28 36V44H20Z"
        fill="currentColor"
      />

      {/* Stepped Stone Terrace Base */}
      <path d="M9 44H39" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M6 47H42" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
};

/**
 * Surin Mudmee Silk Pattern Ribbon
 * Subtle, sophisticated traditional woven motif
 */
export const SurinSilkRibbon: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`w-full h-2 flex items-center overflow-hidden opacity-80 ${className}`}>
      <div
        className="w-full h-full"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            #065F46 0px,
            #065F46 8px,
            #047857 8px,
            #047857 16px,
            #D97706 16px,
            #D97706 20px,
            #047857 20px,
            #047857 28px,
            #064E3B 28px,
            #064E3B 36px
          )`,
        }}
      />
    </div>
  );
};

/**
 * Badge showing Surin - Prasat Community identity
 */
export const SurinCommunityBadge: React.FC<{ variant?: 'light' | 'dark' }> = ({
  variant = 'light',
}) => {
  if (variant === 'dark') {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-900/60 border border-emerald-700/80 text-emerald-200 text-xs font-medium backdrop-blur-md shadow-xs">
        <PrasatIcon size={16} className="text-amber-400" />
        <span className="font-semibold">อำเภอปราสาท จ.สุรินทร์</span>
        <span className="w-1 h-1 rounded-full bg-emerald-400" />
        <span className="text-emerald-300">18 ตำบล 241 หมู่บ้าน</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/90 text-emerald-800 text-xs font-medium shadow-2xs">
      <PrasatIcon size={16} className="text-amber-600" />
      <span className="font-semibold">อำเภอปราสาท จ.สุรินทร์</span>
      <span className="w-1 h-1 rounded-full bg-emerald-400" />
      <span className="text-emerald-700">18 ตำบล 241 หมู่บ้าน</span>
    </div>
  );
};
