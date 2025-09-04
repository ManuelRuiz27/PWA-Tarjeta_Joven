import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BottomNav from '@app/components/BottomNav';
import { MemoryRouter } from 'react-router-dom';

function renderWithRoute(route: string) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <BottomNav />
    </MemoryRouter>
  );
}

describe('BottomNav', () => {
  it('renderiza tabs con labels visibles y navegación accesible', () => {
    renderWithRoute('/');
    // Nav landmark
    expect(screen.getByRole('navigation', { name: /Navegación inferior/i })).toBeInTheDocument();
    // Labels
    expect(screen.getByRole('link', { name: /Home/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Catálogo/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Wallet/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Perfil/i })).toBeInTheDocument();
  });

  it('marca el tab activo con aria-current', () => {
    renderWithRoute('/wallet');
    const walletLink = screen.getByRole('link', { name: /Wallet/i });
    expect(walletLink).toHaveAttribute('aria-current', 'page');
  });

  it('navega al hacer click y actualiza el activo', () => {
    renderWithRoute('/');
    const catalogLink = screen.getByRole('link', { name: /Catálogo/i });
    fireEvent.click(catalogLink);
    expect(catalogLink).toHaveAttribute('aria-current', 'page');
  });
});

