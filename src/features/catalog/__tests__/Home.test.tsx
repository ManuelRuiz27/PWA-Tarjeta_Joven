import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Home from '@pages/Home';

function mockFetchOnce(data: any, ok = true) {
  (globalThis.fetch as any) = vi.fn().mockResolvedValue({
    ok,
    json: async () => data,
    text: async () => JSON.stringify(data),
  });
}

describe('Home catálogo', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('muestra skeletons durante la carga y luego items', async () => {
    mockFetchOnce({ items: [{ id: '1', title: 'Descuento', imageUrl: '/', terms: '10%', validUntil: '2099-01-01', merchantId: 'm1', category: 'comida' }], page: 1, totalPages: 1 });
    render(<Home />);
    // Skeletons presentes
    expect(screen.getAllByRole('article', { hidden: true }).length >= 0).toBeTruthy();
    // Espera a que se renderice el item
    await waitFor(() => expect(screen.getByText('Descuento')).toBeInTheDocument());
  });

  it('muestra estado vacío cuando no hay beneficios', async () => {
    mockFetchOnce({ items: [], page: 1, totalPages: 1 });
    render(<Home />);
    await waitFor(() => expect(screen.getByText(/No hay beneficios/i)).toBeInTheDocument());
  });

  it('muestra estado de error ante fallo de red', async () => {
    (globalThis.fetch as any) = vi.fn().mockResolvedValue({ ok: false, text: async () => 'Fallo' });
    render(<Home />);
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/Fallo|error/i));
  });
});

