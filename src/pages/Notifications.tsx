import { useEffect, useMemo, useState } from 'react';
import { isPushSupported, getNotificationPermission, subscribePush, unsubscribePush, getSubscription } from '@lib/push';
import { saveSubscription, deleteSubscription } from '@features/notifications/push.api';

/**
 * Página de notificaciones: solicita permisos, muestra estado y permite suscribir/desuscribir.
 * Maneja navegadores sin soporte (incluidos iOS antiguos < 16.4).
 */
export default function NotificationsPage() {
  const supported = isPushSupported();
  const [permission, setPermission] = useState<NotificationPermission>(getNotificationPermission());
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supported) return;
    getSubscription().then((s) => setSubscribed(Boolean(s))).catch(() => {});
  }, [supported]);

  const status = useMemo(() => {
    if (!supported) return 'No soportado por este navegador (iOS < 16.4 / Safari)';
    if (permission === 'denied') return 'Permiso denegado';
    if (permission === 'default') return 'Permiso no concedido';
    return subscribed ? 'Suscripción activa' : 'Suscripción inactiva';
  }, [supported, permission, subscribed]);

  async function requestPerm() {
    setError(null);
    try {
      const p = await Notification.requestPermission();
      setPermission(p);
    } catch (e: any) {
      setError(e?.message || 'No se pudo solicitar el permiso');
    }
  }

  async function doSubscribe() {
    setError(null);
    if (!supported || permission !== 'granted') return;
    const vapid = import.meta.env['VITE_VAPID_PUBLIC_KEY'];
    if (!vapid) {
      setError('Falta VAPID public key (VITE_VAPID_PUBLIC_KEY)');
      return;
    }
    try {
      setLoading(true);
      const sub = await subscribePush(vapid);
      await saveSubscription(sub);
      setSubscribed(true);
    } catch (e: any) {
      setError(e?.message || 'No se pudo suscribir');
    } finally {
      setLoading(false);
    }
  }

  async function doUnsubscribe() {
    setError(null);
    try {
      setLoading(true);
      const sub = await getSubscription();
      await unsubscribePush();
      await deleteSubscription(sub?.endpoint);
      setSubscribed(false);
    } catch (e: any) {
      setError(e?.message || 'No se pudo desuscribir');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <h1>Notificaciones</h1>
      <p aria-live="polite">Estado: {status}</p>
      {error && <p role="alert" style={{ color: 'crimson' }}>{error}</p>}

      <div className="d-flex gap-2">
        <button className="btn btn-outline-secondary" onClick={requestPerm} disabled={!supported || loading || permission !== 'default'}>
          Solicitar permiso
        </button>
        <button className="btn btn-primary" onClick={doSubscribe} disabled={!supported || loading || permission !== 'granted' || subscribed}>
          Suscribir
        </button>
        <button className="btn btn-outline-danger" onClick={doUnsubscribe} disabled={!supported || loading || !subscribed}>
          Desuscribir
        </button>
      </div>

      {!supported && (
        <div className="mt-3 text-muted" role="note">
          Este dispositivo/navegador no soporta Web Push (iOS solo desde 16.4 en Safari).
        </div>
      )}
    </section>
  );
}

