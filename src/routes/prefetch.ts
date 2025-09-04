/**
 * Utilidades de prefetch para rutas. Ejecuta import() de los módulos
 * de página cuando el usuario insinúe intención (hover/focus).
 */

export const prefetch = {
  home: () => import('@pages/Home'),
  catalog: () => import('@pages/Catalog'),
  wallet: () => import('@pages/Wallet'),
  profile: () => import('@pages/Profile'),
  settings: () => import('@pages/Settings'),
  notifications: () => import('@pages/Notifications'),
  help: () => import('@pages/Help'),
};

export type PrefetchKey = keyof typeof prefetch;

export function prefetchRoute(key: PrefetchKey) {
  try {
    const fn = prefetch[key];
    if (fn) fn();
  } catch {
    // Silencia errores de prefetch; no debe bloquear la navegación
  }
}

