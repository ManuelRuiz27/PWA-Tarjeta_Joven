import { useEffect, useMemo, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { useOnline } from '@lib/useOnline';
import { AnimatePresence, motion } from 'framer-motion';

export interface QRViewProps {
  /** Token para codificar en el QR */
  qrToken: string;
  /** Fecha de expiración ISO del token */
  expiresAt: string;
  /** ID del item de wallet asociado (para renovar) */
  walletItemId: string;
  /** Callback para renovar el código cuando expira */
  onRenew?: (walletItemId: string) => Promise<void> | void;
}

/**
 * QRView (canvas): genera un QR de alto contraste a partir del token, muestra
 * cuenta regresiva hasta la expiración y permite renovar si aplica.
 * Incluye indicadores de estado offline/online.
 *
 * Casos límite:
 * - Si `expiresAt` ya venció, muestra “Expirado” y el botón “Renovar código” si `onRenew` existe.
 * - Si el navegador no soporta canvas (raro), el hook captura error al generar QR y muestra alerta accesible.
 */
export default function QRView({ qrToken, expiresAt, walletItemId, onRenew }: QRViewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const online = useOnline();
  const [now, setNow] = useState(() => Date.now());
  const [renewing, setRenewing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const expiry = useMemo(() => new Date(expiresAt).getTime(), [expiresAt]);
  const remainMs = Math.max(0, expiry - now);
  const remainSec = Math.ceil(remainMs / 1000);
  const expired = remainMs <= 0;

  // Dibuja el QR en canvas con alto contraste
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Fondo blanco, puntos negros para alto contraste
    QRCode.toCanvas(canvas, qrToken, { errorCorrectionLevel: 'M', margin: 2, color: { dark: '#000000', light: '#ffffff' } }).catch(() => {
      // Si falla, dejamos mensaje de error accesible
      setError('No se pudo generar el código QR');
    });
  }, [qrToken]);

  // Timer 1s
  useEffect(() => {
    if (expired) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [expired]);

  async function handleRenew() {
    if (!onRenew) return;
    try {
      setError(null);
      setRenewing(true);
      await onRenew(walletItemId);
    } catch (e: any) {
      setError(e?.message || 'No se pudo renovar el QR');
    } finally {
      setRenewing(false);
    }
  }

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-1">
        <strong>QR</strong>
        <span className={`badge ${online ? 'text-bg-success' : 'text-bg-secondary'}`} aria-label={online ? 'En línea' : 'Sin conexión'}>
          {online ? 'Online' : 'Offline'}
        </span>
      </div>
      <div className="d-flex justify-content-center" style={{ background: '#fff', padding: 8, borderRadius: 8 }}>
        <canvas ref={canvasRef} width={180} height={180} aria-label="qr-token" />
      </div>

      <div className="mt-2" style={{ minHeight: 22 }}>
        <AnimatePresence mode="wait">
          {expired ? (
            <motion.span key="expired" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ color: 'crimson' }}>
              Expirado
            </motion.span>
          ) : (
            <motion.span key="count" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              Expira en {remainSec}s
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <div role="alert" className="text-danger mt-1">{error}</div>
      )}

      {expired && onRenew && (
        <div className="mt-2">
          <button className="btn btn-sm btn-outline-primary" onClick={handleRenew} disabled={!online || renewing} aria-disabled={!online || renewing}>
            {renewing ? 'Renovando…' : 'Renovar código'}
          </button>
        </div>
      )}
    </div>
  );
}
