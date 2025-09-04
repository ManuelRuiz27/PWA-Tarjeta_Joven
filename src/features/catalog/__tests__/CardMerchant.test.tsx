import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CardMerchant from '../components/CardMerchant';
import { MemoryRouter } from 'react-router-dom';

describe('CardMerchant', () => {
  it('renderiza nombre, dirección y beneficios', () => {
    render(
      <MemoryRouter>
        <CardMerchant
          merchant={{ id: 'm1', name: 'Café Central', address: 'Av. Siempre Viva 123', categories: ['Café'] }}
          benefits={[
            { id: 'b1', title: '2x1 Latte', validUntil: '2099-01-01' },
            { id: 'b2', title: '10% descuento', validUntil: '2099-02-01' },
          ]}
        />
      </MemoryRouter>
    );
    expect(screen.getByText('Café Central')).toBeInTheDocument();
    expect(screen.getByText('Av. Siempre Viva 123')).toBeInTheDocument();
    expect(screen.getByText('2x1 Latte')).toBeInTheDocument();
    expect(screen.getByText('10% descuento')).toBeInTheDocument();
  });

  it('es clicable y navega al detalle (href)', () => {
    render(
      <MemoryRouter>
        <CardMerchant merchant={{ id: 'm9', name: 'Tienda', categories: ['Retail'] }} />
      </MemoryRouter>
    );
    const link = screen.getByRole('link', { name: /Comercio Tienda/i });
    expect(link).toHaveAttribute('href', '/merchants/m9');
  });

  it('muestra badge offline cuando no hay conexión', () => {
    const original = Object.getOwnPropertyDescriptor(window.navigator, 'onLine');
    // Fuerza offline
    Object.defineProperty(window.navigator, 'onLine', { value: false, configurable: true });
    render(
      <MemoryRouter>
        <CardMerchant merchant={{ id: 'm1', name: 'Café Central' }} />
      </MemoryRouter>
    );
    expect(screen.getByText(/Offline/i)).toBeInTheDocument();
    // Restaura
    if (original) Object.defineProperty(window.navigator, 'onLine', original);
  });
});
