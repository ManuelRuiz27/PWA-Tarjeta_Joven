import { describe, it, expect, vi, beforeEach } from 'vitest';
import { axe } from 'jest-axe';
import Home from '@pages/Home';
import Register from '@pages/Register';
import NotificationsToggle from '@features/notifications/components/NotificationsToggle';
import { renderWithProviders } from '@test/render';
import { waitFor } from '@testing-library/react';

describe('Auditoría de accesibilidad (axe)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('Home no tiene violaciones básicas', async () => {
    (globalThis.fetch as any) = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ items: [], page: 1, totalPages: 1 }) });
    const { container } = renderWithProviders(<Home />);
    await waitFor(() => void 0);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Register (form inicial) no tiene violaciones básicas', async () => {
    const { container } = renderWithProviders(<Register />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('NotificationsToggle (entorno no soportado) no tiene violaciones básicas', async () => {
    (globalThis as any).Notification = undefined;
    (globalThis as any).navigator = { ...navigator, serviceWorker: undefined } as any;
    (globalThis as any).window = { ...window, PushManager: undefined } as any;
    const { container } = renderWithProviders(<NotificationsToggle />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

