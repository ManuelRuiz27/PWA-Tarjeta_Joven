import { useEffect, useState } from 'react';

/**
 * Maneja el evento beforeinstallprompt para mostrar un CTA de instalación.
 */
export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<any>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onBeforeInstall(e: any) {
      e.preventDefault();
      setDeferred(e);
      setVisible(true);
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall as any);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall as any);
  }, []);

  if (!visible) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      style={{ position: 'fixed', left: 16, right: 16, bottom: `calc(70px + var(--safe-bottom))`, zIndex: 1100 }}
      className="d-flex justify-content-center"
    >
      <div className="alert d-inline-flex align-items-center gap-2 shadow" style={{ background: '#fff', color: '#000', borderRadius: 8, padding: '8px 12px', border: '1px solid var(--color-border)' }}>
        <span>¿Quieres instalar esta app?</span>
        <button
          className="btn btn-sm btn-success"
          onClick={async () => {
            try {
              const choice = await deferred.prompt?.();
              deferred.userChoice = choice;
            } finally {
              setVisible(false);
              setDeferred(null);
            }
          }}
        >
          Instalar
        </button>
        <button className="btn btn-sm btn-outline-secondary" onClick={() => setVisible(false)} aria-label="Cerrar">Más tarde</button>
      </div>
    </div>
  );
}

