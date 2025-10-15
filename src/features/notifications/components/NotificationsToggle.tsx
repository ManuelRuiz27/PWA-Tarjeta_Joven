import { useEffect, useMemo, useState } from 'react';
import { deleteSubscription, saveSubscription } from '../push.api';
import { getNotificationPermission, getSubscription, isPushSupported, subscribePush, unsubscribePush } from '@lib/push';
import { FormattedMessage, useIntl } from 'react-intl';
import { useAppDispatch, useAppSelector } from '@app/hooks';
import { setNotificationsEnabled } from '@features/settings/settingsSlice';

/**
 * Toggle para suscripción a Web Push (VAPID) con indicadores de permisos.
 */
interface NotificationsToggleProps {
  hideTitle?: boolean;
  label?: string;
}

export default function NotificationsToggle({ hideTitle = false, label }: NotificationsToggleProps) {
  const supported = isPushSupported();
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const preference = useAppSelector((state) => state.settings.notificationsEnabled);
  const [permission, setPermission] = useState<NotificationPermission>(getNotificationPermission());
  const [enabled, setEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!supported) return;
    getSubscription()
      .then((s) => {
        const hasSub = Boolean(s);
        setEnabled(hasSub);
        if (hasSub !== preference) {
          dispatch(setNotificationsEnabled(hasSub));
        }
      })
      .catch(() => {});
  }, [dispatch, preference, supported]);

  const statusLabel = useMemo(() => {
    if (!supported) return intl.formatMessage({ id: 'notifications.unsupported' });
    if (permission === 'denied') return intl.formatMessage({ id: 'notifications.denied' });
    if (permission === 'default') return intl.formatMessage({ id: 'notifications.default' });
    return enabled ? intl.formatMessage({ id: 'notifications.enabled' }) : intl.formatMessage({ id: 'notifications.disabled' });
  }, [supported, permission, enabled, intl]);

  async function handleToggle() {
    setError(null);
    if (!supported) return;

    // Si no hay permiso, solicitarlo
    if (permission !== 'granted') {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result !== 'granted') return;
    }

    const vapid = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;
    if (!vapid) {
      setError('Falta VAPID public key (VITE_VAPID_PUBLIC_KEY)');
      return;
    }

    try {
      setLoading(true);
      if (!enabled) {
        const sub = await subscribePush(vapid);
        await saveSubscription(sub);
        setEnabled(true);
        dispatch(setNotificationsEnabled(true));
      } else {
        const sub = await getSubscription();
        await unsubscribePush();
        await deleteSubscription(sub?.endpoint);
        setEnabled(false);
        dispatch(setNotificationsEnabled(false));
      }
    } catch (e: any) {
      setError(e.message || 'Error de notificaciones');
    } finally {
      setLoading(false);
    }
  }

  const controlLabel = label ?? intl.formatMessage({ id: 'notifications.title' });

  return (
    <div style={{ display: 'grid', gap: 'var(--space-1)' }}>
      {!hideTitle && (
        <h2 style={{ margin: 0 }}>
          <FormattedMessage id="notifications.title" defaultMessage="Notificaciones Push" />
        </h2>
      )}
      <p aria-live="polite" style={{ margin: 0 }}>
        <FormattedMessage id="notifications.status" defaultMessage="Estado" />: {statusLabel}
      </p>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={controlLabel}
        onClick={handleToggle}
        disabled={!supported || loading || permission === 'denied'}
        className="btn btn-outline-primary"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
        }}
      >
        {loading ? (
          '…'
        ) : enabled ? (
          <FormattedMessage id="notifications.toggle.disable" defaultMessage="Desactivar" />
        ) : (
          <FormattedMessage id="notifications.toggle.enable" defaultMessage="Activar" />
        )}
      </button>
      {!supported && <p role="note"><FormattedMessage id="notifications.unsupported" defaultMessage="No soportado por este navegador" /></p>}
      {error && <p role="alert" style={{ color: 'crimson' }}>{error}</p>}
    </div>
  );
}
