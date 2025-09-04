import { queueAdd, queueDelete, queueList, queuePut, type QueueItem } from '@lib/idb';

let processing = false;
let initialized = false;

/**
 * Inicializa el procesador de cola para reintentos exponenciales cuando vuelva la conexión.
 */
export function initWalletQueueProcessor() {
  if (initialized) return;
  initialized = true;
  window.addEventListener('online', () => processQueue());
  // Intento inicial en arranque
  processQueue();
}

function backoffDelay(attempt: number) {
  // 2^attempt * 1000 hasta 32s
  return Math.min(32000, Math.pow(2, attempt) * 1000);
}

export async function enqueuePost(url: string, body?: any, headers?: Record<string, string>) {
  await queueAdd({ url, method: 'POST', body, headers });
}

export async function processQueue(now = Date.now()) {
  if (processing || !navigator.onLine) return;
  processing = true;
  try {
    const items = await queueList();
    for (const item of items) {
      if (item.nextTryAt > now) continue;
      try {
        const res = await fetch(item.url, {
          method: item.method,
          headers: { 'Content-Type': 'application/json', ...(item.headers || {}) },
          body: item.body ? JSON.stringify(item.body) : undefined,
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        await queueDelete((item as any).id);
      } catch {
        const attempts = item.attempts + 1;
        const nextTryAt = Date.now() + backoffDelay(attempts);
        await queuePut({ ...(item as QueueItem), id: (item as any).id, attempts, nextTryAt });
      }
    }
  } finally {
    processing = false;
  }
}

