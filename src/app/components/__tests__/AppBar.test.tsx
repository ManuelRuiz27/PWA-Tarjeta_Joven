import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AppBar from '@app/components/AppBar';
import { MemoryRouter } from 'react-router-dom';

vi.mock('react-router-dom', async (orig) => {
  const actual: any = await (orig as any)();
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe('AppBar', () => {
  it('renderiza título y botón de notificaciones', () => {
    render(
      <MemoryRouter>
        <AppBar title="Catálogo" />
      </MemoryRouter>
    );
    expect(screen.getByText('Catálogo')).toBeInTheDocument();
    expect(screen.getByLabelText(/Notificaciones/)).toBeInTheDocument();
  });

  it('muestra botón atrás cuando back=true y responde al atajo', () => {
    render(
      <MemoryRouter>
        <AppBar title="Detalle" back />
      </MemoryRouter>
    );
    const backBtn = screen.getByLabelText('Volver');
    expect(backBtn).toBeInTheDocument();
    // Atajo Alt+ArrowLeft
    fireEvent.keyDown(window, { altKey: true, key: 'ArrowLeft' });
  });
});

