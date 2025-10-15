import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import CatalogPage from '../Catalog';
import { renderWithProviders } from '@test/render';

function renderCatalog(initialPath = '/catalog') {
  return renderWithProviders(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/catalog" element={<CatalogPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('CatalogPage (RTK Query)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('muestra los beneficios devueltos por la API', async () => {
    const fetchMock = vi
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [
            {
              id: 'b1',
              name: 'Café Central',
              category: 'Gastronomía',
              municipality: 'Querétaro',
              discount: '10% OFF',
              merchantId: 'm1',
            },
          ],
          page: 1,
          totalPages: 1,
          filters: { categories: ['Gastronomía'], municipalities: ['Querétaro'] },
        }),
      } as any);

    renderCatalog();

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(await screen.findByRole('heading', { name: 'Café Central' })).toBeInTheDocument();
  });

  it('muestra estado de error cuando la petición falla', async () => {
    const fetchMock = vi
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce({
        ok: false,
        text: async () => 'Fallo en catálogo',
      } as any);

    renderCatalog();

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(await screen.findByRole('alert')).toHaveTextContent(/Fallo en catálogo/i);
  });

  it('actualiza la búsqueda al escribir en el campo', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ items: [], page: 1, totalPages: 1 }),
    } as any);

    renderCatalog('/catalog');

    const search = await screen.findByRole('searchbox');
    fireEvent.change(search, { target: { value: 'gimnasio' } });

    await waitFor(() => expect(new URL(window.location.href).searchParams.get('q')).toBe('gimnasio'));
  });
});
