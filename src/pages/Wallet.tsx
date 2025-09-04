import { useEffect, useState } from 'react';
import { getWallet, redeemItem, saveToWallet } from '@features/wallet/wallet.api';
import type { WalletItem } from '@features/wallet/types';
import QRView from '@app/components/QRView';
import { FormattedMessage } from 'react-intl';
import { useOnline } from '@lib/useOnline';
import { useToast } from '@app/components/ToastProvider';

export default function Wallet() {
  const [items, setItems] = useState<WalletItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isOnline = useOnline();
  const { show } = useToast();

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const data = await getWallet();
      setItems(data);
    } catch (e: any) {
      setError(e.message || 'Error al cargar wallet');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function onAddDemo() {
    const res = await saveToWallet({ couponId: 'demo-1' });
    if ((res as any).queued) {
      // Refresco optimista
      setItems((prev) => prev.concat({
        id: 'queued-' + (prev.length + 1),
        title: 'Cupón en cola',
        status: 'active',
        qrToken: 'PENDIENTE',
        qrExpiresAt: new Date(Date.now() + 5 * 60_000).toISOString(),
        syncing: true,
      }));
      show('Cupón en cola: se guardará al reconectar', { variant: 'info' });
    } else {
      setItems((prev) => prev.concat(res as WalletItem));
      show('Guardado en Wallet', { variant: 'success' });
    }
  }

  async function onRedeem(id: string) {
    const res = await redeemItem(id);
    if ((res as any).queued) {
      setItems((prev) => prev.map((it) => (it.id === id ? { ...it, status: 'redeemed' } : it)));
      show('Redención en cola', { variant: 'info' });
    } else {
      const updated = res as WalletItem;
      setItems((prev) => prev.map((it) => (it.id === id ? updated : it)));
      show('Cupón redimido', { variant: 'success' });
    }
  }

  function handleExpired(id: string) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, status: 'expired' } : it)));
  }

  return (
    <section>
      <h1><FormattedMessage id="wallet.title" defaultMessage="Wallet" /></h1>
      <div style={{ marginBottom: 12 }}>
        <button onClick={onAddDemo}><FormattedMessage id="wallet.addDemo" defaultMessage="Añadir cupón de prueba" /></button>
      </div>
      {loading && <p aria-busy="true"><FormattedMessage id="wallet.loading" defaultMessage="Cargando..." /></p>}
      {error && <p role="alert" style={{ color: 'crimson' }}>{error}</p>}

      {!isOnline && (
        <div role="status" aria-live="polite" style={{ marginBottom: 8, color: '#a15c00' }}>
          Estás sin conexión. Algunas acciones se encolarán y se sincronizarán al reconectar.
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
        {items.map((it) => (
          <div key={it.id} style={{ position: 'relative', border: '1px solid #e2e2e2', borderRadius: 8, padding: 12 }}>
            {!isOnline && (
              <span
                style={{
                  position: 'absolute',
                  top: 6,
                  right: 6,
                  background: '#ffe8cc',
                  color: '#8a4b00',
                  border: '1px solid #ffd4a6',
                  borderRadius: 6,
                  padding: '2px 6px',
                  fontSize: 12,
                }}
                aria-label="Sin conexión"
              >
                Sin conexión
              </span>
            )}
            <h3 style={{ marginTop: 0 }}>{it.title}</h3>
            <p>Estado: <strong>{it.status}</strong></p>
            {it.status === 'active' && it.qrToken && it.qrExpiresAt && (
              <QRView
                qrToken={it.qrToken}
                expiresAt={it.qrExpiresAt}
                walletItemId={it.id}
              />
            )}
            <div style={{ marginTop: 8 }}>
              <button onClick={() => onRedeem(it.id)} disabled={it.status !== 'active' || !isOnline}>
                <FormattedMessage id="wallet.redeem" defaultMessage="Redimir" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
