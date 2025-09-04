import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CatalogPage from '@pages/Catalog';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

function mockFetch(data: any) {
  (globalThis.fetch as any) = vi.fn().mockResolvedValue({ ok: true, json: async () => data });
}

function renderAt(path = '/catalog?q=foo&category=todos&page=1') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/catalog" element={<CatalogPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('CatalogPage Map toggle', () => {
  it('alterna a mapa y sincroniza querystring view=map', async () => {
    mockFetch({ items: [{ id: '1', title: 'x', imageUrl: '/', terms: 't', validUntil: '2099-01-01', merchantId: 'm', category: 'c' }], page: 1, totalPages: 1 });
    const { container } = renderAt();
    fireEvent.click(screen.getByRole('tab', { name: /Mapa/i }));
    expect(container.baseURI).toContain('view=map');
    expect(screen.getByLabelText(/Mapa de catálogo/i)).toBeInTheDocument();
  });
});

