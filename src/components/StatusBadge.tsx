import React from 'react';
import { Clock, CheckCircle2, AlertCircle, Wrench, Archive } from 'lucide-react';
import { IssueStatus } from '../types';
import { STATUSES } from '../data/categories';

interface StatusBadgeProps {
  status: IssueStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
}) => {
  const meta = STATUSES.find((s) => s.id === status) || STATUSES[0];

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs sm:text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-medium',
  }[size];

  const iconSize = size === 'sm' ? 12 : size === 'md' ? 14 : 16;

  const renderIcon = () => {
    switch (status) {
      case 'pending':
        return <Clock size={iconSize} className="text-amber-600 animate-pulse" />;
      case 'acknowledged':
        return <AlertCircle size={iconSize} className="text-sky-600" />;
      case 'in_progress':
        return <Wrench size={iconSize} className="text-indigo-600" />;
      case 'resolved':
        return <CheckCircle2 size={iconSize} className="text-emerald-600" />;
      case 'closed':
        return <Archive size={iconSize} className="text-slate-600" />;
      default:
        return null;
    }
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border shadow-2xs transition-colors whitespace-nowrap ${meta.badgeBg} ${sizeClasses}`}
    >
      {showIcon && renderIcon()}
      <span>{meta.label}</span>
    </span>
  );
};
