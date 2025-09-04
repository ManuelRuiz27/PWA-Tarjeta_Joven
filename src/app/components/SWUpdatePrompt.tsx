import { useRegisterSW } from 'virtual:pwa-register/react';

/**
 * Muestra un banner cuando hay una actualización del Service Worker y permite actualizar.
 * También informa cuando la app está lista para uso offline.
 */
export default function SWUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW: () => {},
    onRegisterError: () => {},
  });

  if (!needRefresh && !offlineReady) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        left: 16,
        right: 16,
        bottom: `calc(16px + var(--safe-bottom))`,
        zIndex: 1200,
      }}
      className="d-flex justify-content-center"
    >
      <div className="alert d-inline-flex align-items-center gap-2 shadow" style={{ background: '#222', color: '#fff', borderRadius: 8, padding: '8px 12px' }}>
        {offlineReady && <span>La app está lista para funcionar sin conexión.</span>}
        {needRefresh && <span>Hay una actualización disponible.</span>}
        {needRefresh && (
          <button
            className="btn btn-sm btn-primary"
            onClick={async () => {
              await updateServiceWorker(true);
              setNeedRefresh(false);
              setOfflineReady(false);
            }}
          >
            Actualizar
          </button>
        )}
        <button className="btn btn-sm btn-outline-light" onClick={() => { setNeedRefresh(false); setOfflineReady(false); }} aria-label="Cerrar">
          Cerrar
        </button>
      </div>
    </div>
  );
}

