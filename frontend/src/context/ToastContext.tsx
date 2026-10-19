import React, { createContext, useContext, useState, useCallback } from 'react';
import { sound } from '../services/sound';

export type ToastType = 'success' | 'warning' | 'error' | 'info' | 'critical';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: ToastAction;
  createdAt: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (toast: Omit<ToastItem, 'id' | 'createdAt'>) => string;
  dismissToast: (id: string) => void;
  toast: {
    success: (title: string, message?: string, action?: ToastAction) => string;
    warning: (title: string, message?: string, action?: ToastAction) => string;
    error: (title: string, message?: string, action?: ToastAction) => string;
    info: (title: string, message?: string, action?: ToastAction) => string;
    critical: (title: string, message?: string, action?: ToastAction) => string;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (item: Omit<ToastItem, 'id' | 'createdAt'>) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastItem = {
        ...item,
        id,
        duration: item.duration ?? 4500,
        createdAt: Date.now(),
      };

      // Play matching audio cue
      if (item.type === 'critical') {
        sound.playCritical();
      } else if (item.type === 'warning') {
        sound.playWarning();
      } else if (item.type === 'success') {
        sound.playSuccess();
      } else {
        sound.playClick();
      }

      setToasts((prev) => [newToast, ...prev.slice(0, 4)]);
      return id;
    },
    []
  );

  const toastHelpers = {
    success: (title: string, message?: string, action?: ToastAction) =>
      showToast({ type: 'success', title, message, action }),
    warning: (title: string, message?: string, action?: ToastAction) =>
      showToast({ type: 'warning', title, message, action }),
    error: (title: string, message?: string, action?: ToastAction) =>
      showToast({ type: 'error', title, message, action }),
    info: (title: string, message?: string, action?: ToastAction) =>
      showToast({ type: 'info', title, message, action }),
    critical: (title: string, message?: string, action?: ToastAction) =>
      showToast({ type: 'critical', title, message, action, duration: 6000 }),
  };

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast, toast: toastHelpers }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
