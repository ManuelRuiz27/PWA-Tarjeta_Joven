import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import QRView from '../components/QRView';

describe('QRView', () => {
  it('muestra cuenta regresiva y cambia a expirado', () => {
    vi.useFakeTimers();
    const now = Date.now();
    vi.setSystemTime(now);
    const expiresAt = new Date(now + 3000).toISOString();
    render(<QRView qrToken="ABC" expiresAt={expiresAt} />);

    // Inicialmente no expirado
    expect(screen.getByText(/Expira en/i)).toBeInTheDocument();

    // Avanzar 3s
    vi.advanceTimersByTime(3000);
    // Forzar timers
    vi.runOnlyPendingTimers();

    expect(screen.getByText(/Expirado/i)).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('invoca onExpired al expirar', () => {
    vi.useFakeTimers();
    const now = Date.now();
    vi.setSystemTime(now);
    const onExpired = vi.fn();
    const expiresAt = new Date(now + 1000).toISOString();
    render(<QRView qrToken="XYZ" expiresAt={expiresAt} onExpired={onExpired} />);
    vi.advanceTimersByTime(1100);
    expect(onExpired).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('muestra estado de sincronización', () => {
    const expiresAt = new Date(Date.now() + 60_000).toISOString();
    render(<QRView qrToken="SYNC" expiresAt={expiresAt} syncing />);
    expect(screen.getByText(/Sincronizando/)).toBeInTheDocument();
  });
});
