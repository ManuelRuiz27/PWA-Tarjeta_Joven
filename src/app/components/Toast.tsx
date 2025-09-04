import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export type ToastVariant = 'info' | 'success' | 'error';

export interface ToastProps {
  open: boolean;
  message: string;
  variant?: ToastVariant;
  autoHideDuration?: number; // ms
  onClose?: () => void;
}

/**
 * Toast accesible con animación suave. Usa role="status" (info/success) o "alert" (error).
 */
export default function Toast({ open, message, variant = 'info', autoHideDuration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => onClose?.(), autoHideDuration);
    return () => clearTimeout(id);
  }, [open, autoHideDuration, onClose]);

  const role = variant === 'error' ? 'alert' : 'status';

  return (
    <div aria-live="polite" aria-atomic="true" style={{ position: 'fixed', insetInline: 0, bottom: `calc(16px + var(--safe-bottom))`, pointerEvents: 'none', zIndex: 1080 }}>
      <div className="d-flex justify-content-center">
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              role={role}
              className="toast alert d-inline-flex align-items-center"
              style={{ pointerEvents: 'auto', background: '#222', color: '#fff', padding: '8px 12px', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.25)' }}
            >
              <span>{message}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

