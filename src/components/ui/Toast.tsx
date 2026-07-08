'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type ToastVariant = 'success' | 'info' | 'warning' | 'danger';

type ToastState = { id: number; message: string; variant: ToastVariant };

const ToastContext = React.createContext<{
  show: (message: string, variant?: ToastVariant) => void;
} | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastState[]>([]);

  const show = React.useCallback((message: string, variant: ToastVariant = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed z-[100] bottom-4 left-1/2 -translate-x-1/2 md:left-auto md:right-6 md:translate-x-0 flex flex-col gap-2 items-center md:items-end">
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.variant === 'danger' ? 'alert' : 'status'}
            className={cn(
              'rounded-md px-4 py-3 text-small font-medium shadow-raised max-w-[92vw]',
              t.variant === 'success' && 'bg-success-tint text-success',
              t.variant === 'info' && 'bg-bg-inset text-ink-900',
              t.variant === 'warning' && 'bg-warning-tint text-warning',
              t.variant === 'danger' && 'bg-danger-tint text-danger',
            )}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
