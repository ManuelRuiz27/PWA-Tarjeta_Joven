import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import QRView from '@app/components/QRView';

describe('QRView (canvas)', () => {
  it('muestra cuenta regresiva y cambia a expirado', () => {
    vi.useFakeTimers();
    const now = Date.now();
    vi.setSystemTime(now);
    const expiresAt = new Date(now + 2000).toISOString();
    render(<QRView qrToken="TOKEN" expiresAt={expiresAt} walletItemId="w1" />);
    expect(screen.getByText(/Expira en/i)).toBeInTheDocument();
    vi.advanceTimersByTime(2100);
    expect(screen.getByText(/Expirado/i)).toBeInTheDocument();
    vi.useRealTimers();
  });
});

