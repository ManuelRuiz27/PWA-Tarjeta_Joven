import type { WalletItem } from './types';
import { enqueuePost, initWalletQueueProcessor } from './queue';

const BASE_URL = '/api/wallet';

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || res.statusText);
  }
  return res.json() as Promise<T>;
}

/** Guarda un cupón/tarjeta en la wallet. POST /api/wallet */
export async function saveToWallet(payload: { couponId: string }): Promise<WalletItem | { queued: true }> {
  try {
    return await request<WalletItem>(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    // Fallback offline: encola la acción para reintentar luego
    initWalletQueueProcessor();
    await enqueuePost(BASE_URL, payload);
    return { queued: true };
  }
}

/** Lista de items de la wallet. GET /api/wallet */
export async function getWallet(): Promise<WalletItem[]> {
  return request<WalletItem[]>(BASE_URL);
}

/** Detalle de un item. GET /api/wallet/:id */
export async function getWalletItem(id: string): Promise<WalletItem> {
  return request<WalletItem>(`${BASE_URL}/${id}`);
}

/** Redimir un item. POST /api/wallet/:id/redeem */
export async function redeemItem(id: string): Promise<WalletItem | { queued: true }> {
  const url = `${BASE_URL}/${id}/redeem`;
  try {
    return await request<WalletItem>(url, { method: 'POST' });
  } catch {
    // Fallback offline: encola y procesará cuando haya red
    initWalletQueueProcessor();
    await enqueuePost(url);
    return { queued: true };
  }
}

