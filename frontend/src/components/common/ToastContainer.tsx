import React, { useEffect, useState } from 'react';
import { useToast, ToastItem } from '../../context/ToastContext';
import { CheckCircle2, AlertTriangle, AlertOctagon, Info, X, ChevronRight } from 'lucide-react';

const ToastCard: React.FC<{ toast: ToastItem; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  const [progress, setProgress] = useState(100);
  const duration = toast.duration || 4500;

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (elapsed >= duration) {
        clearInterval(interval);
        onDismiss(toast.id);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [duration, onDismiss, toast.id]);

  const config = {
    success: {
      border: 'border-emerald-500/40 dark:border-emerald-500/50',
      bg: 'bg-white/95 dark:bg-[#0B1528]/95',
      iconBg: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
      bar: 'bg-emerald-500',
      icon: CheckCircle2,
    },
    warning: {
      border: 'border-amber-500/40 dark:border-amber-500/50',
      bg: 'bg-white/95 dark:bg-[#1E190A]/95',
      iconBg: 'bg-amber-500/20 text-amber-600 dark:text-amber-400',
      bar: 'bg-amber-500',
      icon: AlertTriangle,
    },
    critical: {
      border: 'border-rose-500/50 dark:border-rose-500/70',
      bg: 'bg-white/95 dark:bg-[#1F0D15]/95',
      iconBg: 'bg-rose-500/20 text-rose-600 dark:text-rose-400',
      bar: 'bg-rose-500',
      icon: AlertOctagon,
    },
    error: {
      border: 'border-rose-500/40 dark:border-rose-500/50',
      bg: 'bg-white/95 dark:bg-[#1F0D15]/95',
      iconBg: 'bg-rose-500/20 text-rose-600 dark:text-rose-400',
      bar: 'bg-rose-500',
      icon: AlertOctagon,
    },
    info: {
      border: 'border-blue-500/40 dark:border-blue-500/50',
      bg: 'bg-white/95 dark:bg-[#0B172E]/95',
      iconBg: 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
      bar: 'bg-blue-500',
      icon: Info,
    },
  }[toast.type] || {
    border: 'border-slate-300 dark:border-slate-700',
    bg: 'bg-white/95 dark:bg-[#0F172A]/95',
    iconBg: 'bg-slate-200 text-slate-700',
    bar: 'bg-blue-500',
    icon: Info,
  };

  const Icon = config.icon;

  return (
    <div
      role="alert"
      className={`relative w-80 sm:w-96 rounded-2xl border ${config.border} ${config.bg} backdrop-blur-md shadow-2xl overflow-hidden p-3.5 transition-all duration-300 animate-fadeIn`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-xl ${config.iconBg} flex items-center justify-center shrink-0 mt-0.5 shadow-sm`}>
          <Icon className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0 pr-1">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
            {toast.title}
          </h4>
          {toast.message && (
            <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-snug line-clamp-2">
              {toast.message}
            </p>
          )}

          {toast.action && (
            <button
              onClick={() => {
                toast.action?.onClick();
                onDismiss(toast.id);
              }}
              className="mt-2 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>{toast.action.label}</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>

        <button
          onClick={() => onDismiss(toast.id)}
          className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg transition-colors shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-200/50 dark:bg-slate-800/50">
        <div
          className={`h-full ${config.bar} transition-all duration-75`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <aside
      aria-label="Notifications"
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[99999] flex flex-col gap-2.5 pointer-events-auto max-w-full"
    >
      {toasts.map((t) => (
        <ToastCard key={t.id} toast={t} onDismiss={dismissToast} />
      ))}
    </aside>
  );
};
