import { useOnline } from '@lib/useOnline';

/**
 * Banner global de estado offline. Aparece bajo el AppBar cuando no hay conexión.
 */
export default function OfflineBanner() {
  const online = useOnline();
  if (online) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        top: `calc(var(--app-header-height) + var(--safe-top))`,
        left: 0,
        right: 0,
        zIndex: 1050,
        background: '#ffe8cc',
        color: '#8a4b00',
        borderBottom: '1px solid #ffd4a6',
        padding: '6px 12px',
        textAlign: 'center',
      }}
    >
      Estás sin conexión. Algunas funciones se sincronizarán al reconectar.
    </div>
  );
}

