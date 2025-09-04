import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CatalogPage from '@pages/Catalog';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

function mockFetch(data: any) {
  (globalThis.fetch as any) = vi.fn().mockResolvedValue({ ok: true, json: async () => data });
}

function renderAt(path = '/catalog') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/catalog" element={<CatalogPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('CatalogPage', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('sincroniza la URL al cambiar de página', async () => {
    mockFetch({ items: [], page: 1, totalPages: 3 });
    const { container } = renderAt('/catalog?q=&category=todos&page=1');
    const next = screen.getByRole('button', { name: /Siguiente/ });
    fireEvent.click(next);
    // Verifica que el querystring cambió a page=2
    expect(container.baseURI.includes('page=2')).toBeTruthy();
  });

  it('aplica categoría al hacer click en chip', () => {
    mockFetch({ items: [], page: 1, totalPages: 1 });
    const { container } = renderAt('/catalog');
    fireEvent.click(screen.getByRole('tab', { name: /comida/i }));
    expect(container.baseURI.includes('category=comida')).toBeTruthy();
  });
});

