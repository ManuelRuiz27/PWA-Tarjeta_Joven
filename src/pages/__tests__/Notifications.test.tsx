import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NotificationsPage from '@pages/Notifications';

function setupSupported(permission: NotificationPermission, subscribed = false) {
  (globalThis as any).Notification = {
    permission,
    requestPermission: vi.fn().mockResolvedValue('granted'),
  } as any;
  (globalThis as any).navigator = {
    serviceWorker: {
      ready: Promise.resolve({
        pushManager: {
          getSubscription: vi.fn().mockResolvedValue(subscribed ? ({ endpoint: 'e' } as any) : null),
          subscribe: vi.fn().mockResolvedValue({ endpoint: 'e' }),
        },
      }),
    },
  } as any;
  (globalThis as any).window = { ...window, PushManager: function () {} } as any;
  (globalThis.fetch as any) = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
  (import.meta as any).env = { VITE_VAPID_PUBLIC_KEY: 'ABC' };
}

describe('NotificationsPage', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('muestra mensaje de no soporte', () => {
    (globalThis as any).Notification = undefined;
    (globalThis as any).navigator = { serviceWorker: undefined } as any;
    (globalThis as any).window = { ...window, PushManager: undefined } as any;
    render(<NotificationsPage />);
    expect(screen.getByText(/No soportado/)).toBeInTheDocument();
  });

  it('flujo de permiso → suscribir', async () => {
    setupSupported('default');
    render(<NotificationsPage />);
    fireEvent.click(screen.getByRole('button', { name: /Solicitar permiso/ }));
    await waitFor(() => expect(screen.getByRole('button', { name: /Suscribir/ })).not.toBeDisabled());
    fireEvent.click(screen.getByRole('button', { name: /Suscribir/ }));
    await waitFor(() => expect(screen.getByText(/Suscripción activa|Suscripción inactiva|Suscrib/)).toBeInTheDocument());
  });

  it('flujo de desuscribir', async () => {
    setupSupported('granted', true);
    render(<NotificationsPage />);
    const btn = screen.getByRole('button', { name: /Desuscribir/ });
    fireEvent.click(btn);
    await waitFor(() => expect(btn).not.toBeDisabled());
  });
});

