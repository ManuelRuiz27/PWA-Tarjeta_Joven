import { useEffect, useMemo, useState } from 'react';
import QRCode from 'react-qr-code';
import { motion, AnimatePresence } from 'framer-motion';

interface QRViewProps {
  qrToken: string;
  /** ISO string de expiración del token */
  expiresAt: string;
  onExpired?: () => void;
  /** Indica si está sincronizando offline (cola) */
  syncing?: boolean;
}

/**
 * Muestra un QR (como texto por simplicidad) con un temporizador de expiración.
 * Cambia a estado expirado cuando el tiempo llega a 0.
 */
export default function QRView({ qrToken, expiresAt, onExpired, syncing }: QRViewProps) {
  const expiry = useMemo(() => new Date(expiresAt).getTime(), [expiresAt]);
  const [now, setNow] = useState(() => Date.now());
  const remainMs = Math.max(0, expiry - now);
  const remainSec = Math.ceil(remainMs / 1000);
  const expired = remainMs <= 0;

  useEffect(() => {
    if (expired) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [expired]);

  useEffect(() => {
    if (expired) onExpired?.();
  }, [expired, onExpired]);

  return (
    <motion.div
      style={{ border: '1px dashed #588f41', padding: 12, borderRadius: 8 }}
      aria-live="polite"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div style={{ fontWeight: 600, marginBottom: 8 }}>QR</div>
      <div className="d-flex justify-content-center">
        <QRCode value={qrToken} size={160} aria-label="qr-token" />
      </div>
      <div style={{ marginTop: 8, minHeight: 22 }}>
        <AnimatePresence mode="wait">
          {syncing ? (
            <motion.span
              key="sync"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ color: '#666' }}
            >
              Sincronizando...
            </motion.span>
          ) : expired ? (
            <motion.span key="expired" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ color: 'crimson' }}>
              Expirado
            </motion.span>
          ) : (
            <motion.span key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              Expira en {remainSec}s
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
