/// <reference lib="WebWorker" />
/* eslint-disable no-restricted-globals */

import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst, NetworkOnly } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { BackgroundSyncPlugin } from 'workbox-background-sync';
import type { WorkboxPlugin } from 'workbox-core/types';

declare let self: ServiceWorkerGlobalScope & { __WB_MANIFEST: any };

const asWorkboxPlugin = (plugin: unknown): WorkboxPlugin => plugin as WorkboxPlugin;

// Precache generado por Workbox (injectManifest)
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Cache de imágenes: CacheFirst con expiración
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images-cache',
    plugins: [
      asWorkboxPlugin(new CacheableResponsePlugin({ statuses: [0, 200] })),
      asWorkboxPlugin(new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 })) // 30 días
    ]
  })
);

// NetworkFirst para /api/catalog
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/catalog'),
  new NetworkFirst({
    cacheName: 'api-catalog',
    networkTimeoutSeconds: 10,
    plugins: [
      asWorkboxPlugin(new CacheableResponsePlugin({ statuses: [0, 200] })),
      asWorkboxPlugin(new ExpirationPlugin({ maxAgeSeconds: 60 * 60 * 24 })) // 24 horas
    ]
  })
);

// Background Sync para POST de wallet (guardar/redimir)
const walletBgSync = asWorkboxPlugin(new BackgroundSyncPlugin('wallet-queue', {
  maxRetentionTime: 24 * 60, // minutos
}));

registerRoute(
  ({ url, request }) => request.method === 'POST' && url.pathname.startsWith('/api/wallet'),
  new NetworkOnly({
    plugins: [walletBgSync],
  }),
  'POST'
);

// Soporte para skipWaiting desde la app
self.addEventListener('message', (event) => {
  if (event.data && (event.data as any).type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
