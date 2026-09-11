import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const config = {
    success: {
      bg: 'bg-white border-emerald-300 text-emerald-950 shadow-lg shadow-emerald-900/10',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
      bar: 'bg-emerald-500',
    },
    error: {
      bg: 'bg-white border-rose-300 text-rose-950 shadow-lg shadow-rose-900/10',
      icon: <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />,
      bar: 'bg-rose-500',
    },
    info: {
      bg: 'bg-white border-sky-300 text-slate-900 shadow-lg shadow-sky-900/10',
      icon: <Info className="w-5 h-5 text-sky-600 shrink-0" />,
      bar: 'bg-sky-500',
    },
  }[toast.type];

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border relative overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 ${config.bg}`}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${config.bar}`} />
      {config.icon}
      <div className="flex-1 min-w-0 pr-2">
        <h4 className="text-sm font-semibold leading-tight">{toast.title}</h4>
        {toast.message && <p className="text-xs text-slate-600 mt-1 leading-relaxed">{toast.message}</p>}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-md"
        aria-label="Close"
      >
        <X size={16} />
      </button>
    </div>
  );
};
