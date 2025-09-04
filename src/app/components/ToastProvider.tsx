import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

type Variant = 'info' | 'success' | 'error';

interface ToastItem {
  id: string;
  message: string;
  variant: Variant;
  duration: number;
}

interface ToastContextValue {
  show: (message: string, opts?: { variant?: Variant; duration?: number }) => string;
  hide: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast debe usarse dentro de ToastProvider');
  return ctx;
}

/**
 * Proveedor de toasts con contexto global.
 *
 * API:
 * - `useToast().show(message, { variant, duration })` → devuelve `id`.
 * - `useToast().hide(id)` → cierra programáticamente.
 *
 * Accesibilidad: cada toast expone `role="status"` o `role="alert"` según variante.
 */
export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const hide = useCallback((id: string) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);

  const show = useCallback((message: string, opts?: { variant?: Variant; duration?: number }) => {
    const id = Math.random().toString(36).slice(2);
    const item: ToastItem = { id, message, variant: opts?.variant ?? 'info', duration: opts?.duration ?? 3000 };
    setToasts((prev) => prev.concat(item));
    // Auto hide
    setTimeout(() => hide(id), item.duration);
    return id;
  }, [hide]);

  const value = useMemo(() => ({ show, hide }), [show, hide]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div aria-live="polite" aria-atomic="true" style={{ position: 'fixed', insetInline: 0, bottom: `calc(16px + var(--safe-bottom))`, pointerEvents: 'none', zIndex: 1080 }}>
        <div className="d-flex justify-content-center">
          <AnimatePresence>
            {toasts.map((t) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                role={t.variant === 'error' ? 'alert' : 'status'}
                className="alert d-inline-flex align-items-center"
                style={{ pointerEvents: 'auto', background: '#222', color: '#fff', padding: '8px 12px', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.25)' }}
              >
                <span>{t.message}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </ToastContext.Provider>
  );
}
