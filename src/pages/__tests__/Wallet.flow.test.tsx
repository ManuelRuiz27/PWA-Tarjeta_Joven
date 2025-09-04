import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Wallet from '@pages/Wallet';

describe('Flujo Wallet', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('carga lista y permite añadir cupón de demo', async () => {
    // Primera llamada GET /api/wallet
    (globalThis.fetch as any) = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ([] as any) }) // getWallet
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 'w9', title: 'Cupón Demo', status: 'active', qrToken: 'T', qrExpiresAt: new Date(Date.now() + 60_000).toISOString() }) }); // saveToWallet

    render(<Wallet />);
    // Añadir demo
    const btn = await screen.findByRole('button', { name: /Añadir cupón de prueba/i });
    fireEvent.click(btn);
    await waitFor(() => expect(screen.getByText(/Cupón Demo|Cupón en cola/)).toBeInTheDocument());
  });
});

