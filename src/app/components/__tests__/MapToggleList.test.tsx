import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MapToggleList from '@app/components/MapToggleList';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

function renderAt(initial = '/catalog?q=x&category=todos&page=1') {
  return render(
    <MemoryRouter initialEntries={[initial]}>
      <Routes>
        <Route
          path="/catalog"
          element={
            <MapToggleList
              items={[1, 2, 3]}
              renderList={() => <div>VISTA LISTA</div>}
              renderMap={() => <div>VISTA MAPA</div>}
            />
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('MapToggleList', () => {
  it('muestra lista por defecto y conserva filtros al alternar', () => {
    const { container } = renderAt();
    expect(screen.getByText('VISTA LISTA')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: /Mapa/i }));
    expect(screen.getByText('VISTA MAPA')).toBeInTheDocument();
    expect(container.baseURI).toContain('view=map');
    // Alternar de vuelta
    fireEvent.click(screen.getByRole('tab', { name: /Lista/i }));
    expect(screen.getByText('VISTA LISTA')).toBeInTheDocument();
    expect(container.baseURI).toContain('view=list');
    // Conserva otros parámetros
    expect(container.baseURI).toContain('q=x');
    expect(container.baseURI).toContain('category=todos');
  });
});

