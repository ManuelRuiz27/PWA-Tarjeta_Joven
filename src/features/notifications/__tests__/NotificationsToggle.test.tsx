import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '@test/render';
import NotificationsToggle from '../components/NotificationsToggle';

function setupSupport(supported: boolean, permission: NotificationPermission) {
  (globalThis as any).Notification = supported
    ? { permission, requestPermission: vi.fn().mockResolvedValue('granted') }
    : undefined;
  (globalThis as any).navigator = {
    ...globalThis.navigator,
    serviceWorker: supported
      ? { ready: Promise.resolve({ pushManager: { getSubscription: vi.fn().mockResolvedValue(null), subscribe: vi.fn().mockResolvedValue({ endpoint: 'x' }) } }) }
      : undefined,
  } as any;
  (globalThis as any).window = { ...globalThis.window, PushManager: supported ? function () {} : undefined } as any;
  (globalThis.fetch as any) = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
  (import.meta as any).env = { VITE_VAPID_PUBLIC_KEY: 'B'.repeat(10) };
}

describe('NotificationsToggle', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('muestra no soportado si el navegador no tiene Push', () => {
    setupSupport(false, 'default');
    renderWithProviders(<NotificationsToggle />);
    expect(screen.getByText(/No soportado/)).toBeInTheDocument();
  });

  it('muestra permiso denegado si Notification.permission=denied', () => {
    setupSupport(true, 'denied');
    renderWithProviders(<NotificationsToggle />);
    expect(screen.getByText(/Permiso denegado/)).toBeInTheDocument();
  });

  it('activa suscripción cuando se hace click y permiso es default', async () => {
    setupSupport(true, 'default');
    renderWithProviders(<NotificationsToggle />);
    const btn = screen.getByRole('switch');
    await fireEvent.click(btn);
    expect(screen.getByText(/Suscripción/)).toBeInTheDocument();
  });
});

