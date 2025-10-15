import { useCallback, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { track } from '@lib/analytics';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt: () => Promise<void>;
  userChoice?: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const DISMISS_KEY = 'a2hs.dismissedAt';
const DISMISS_FOR_MS = 7 * 24 * 60 * 60 * 1000; // 7 días

function isBrowser() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function getLastDismiss(): number | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(DISMISS_KEY);
    if (!raw) return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  } catch (error) {
    return null;
  }
}

function saveDismissedAt(timestamp: number) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(DISMISS_KEY, String(timestamp));
  } catch (error) {
    // Ignorar errores de almacenamiento
  }
}

export default function A2HSBanner() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  const hideBanner = useCallback(() => {
    setVisible(false);
    setPromptEvent(null);
  }, []);

  useEffect(() => {
    function handleBeforeInstall(event: Event) {
      const dismissedAt = getLastDismiss();
      if (dismissedAt && Date.now() - dismissedAt < DISMISS_FOR_MS) {
        return;
      }
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
      setVisible(true);
    }

    function handleAppInstalled() {
      hideBanner();
      void track('installed', { source: 'a2hs' });
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [hideBanner]);

  const onDismiss = useCallback(() => {
    saveDismissedAt(Date.now());
    hideBanner();
  }, [hideBanner]);

  if (!visible || !promptEvent) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        insetInline: 'var(--space-4)',
        bottom: `calc(var(--space-4) + var(--app-bottom-nav-height) + var(--safe-bottom))`,
        zIndex: 1200,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          background: 'var(--color-bg)',
          color: 'var(--color-text)',
          border: `1px solid var(--color-border)`,
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow)',
          padding: 'var(--space-3) var(--space-4)',
          maxWidth: 480,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
        }}
      >
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontWeight: 600 }}>
            <FormattedMessage id="a2hs.title" defaultMessage="Instala Tarjeta Joven" />
          </p>
          <p style={{ margin: 0, color: 'var(--color-muted)', fontSize: 'var(--font-size-sm)' }}>
            <FormattedMessage
              id="a2hs.body"
              defaultMessage="Añádela a tu pantalla principal para acceder más rápido a los beneficios."
            />
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={async () => {
              try {
                void track('install_click', { source: 'a2hs' });
                await promptEvent.prompt();
                if (promptEvent.userChoice) {
                  await promptEvent.userChoice.catch(() => undefined);
                }
              } finally {
                hideBanner();
              }
            }}
          >
            <FormattedMessage id="a2hs.install" defaultMessage="Instalar" />
          </button>
          <button type="button" className="btn btn-outline-secondary" onClick={onDismiss}>
            <FormattedMessage id="a2hs.dismiss" defaultMessage="Ahora no" />
          </button>
        </div>
      </div>
    </div>
  );
}
