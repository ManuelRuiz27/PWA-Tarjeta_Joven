import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import NotificationsList from '../components/NotificationsList';

const items = [
  { id: 'n1', title: 'Bienvenido', body: 'Gracias por registrarte', date: new Date().toISOString(), read: false },
  { id: 'n2', title: 'Nuevo cupón', body: 'Tienes un 10% en cine', date: new Date().toISOString(), read: true },
] as const;

describe('NotificationsList', () => {
  it('renderiza elementos y estados', () => {
    render(<NotificationsList items={items as any} />);
    expect(screen.getByText('Bienvenido')).toBeInTheDocument();
    expect(screen.getByText('Nuevo cupón')).toBeInTheDocument();
    expect(screen.getAllByRole('switch').length).toBe(2);
  });

  it('dispara onToggleRead al cambiar estado', () => {
    const onToggle = vi.fn();
    render(<NotificationsList items={items as any} onToggleRead={onToggle} />);
    const firstSwitch = screen.getAllByRole('switch')[0];
    fireEvent.click(firstSwitch);
    expect(onToggle).toHaveBeenCalledWith('n1', true);
  });

  it('muestra estado vacío', () => {
    render(<NotificationsList items={[]} />);
    expect(screen.getByText(/No tienes notificaciones/i)).toBeInTheDocument();
  });
});

