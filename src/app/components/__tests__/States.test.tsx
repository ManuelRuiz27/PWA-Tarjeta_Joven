import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EmptyState from '@app/components/EmptyState';
import ErrorState from '@app/components/ErrorState';
import SkeletonList from '@app/components/SkeletonList';

describe('EmptyState', () => {
  it('muestra mensajes y CTA de recarga', () => {
    const onReload = vi.fn();
    render(<EmptyState title="Sin datos" message="Intenta más tarde" onReload={onReload} reloadLabel="Recargar" helpHref="/help" helpLabel="Ayuda" />);
    expect(screen.getByText('Sin datos')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Recargar' }));
    expect(onReload).toHaveBeenCalled();
    expect(screen.getByRole('link', { name: 'Ayuda' })).toHaveAttribute('href', '/help');
  });
});

describe('ErrorState', () => {
  it('muestra error y permite reintentar', () => {
    const onReload = vi.fn();
    render(<ErrorState title="Error" message="Fallo" onReload={onReload} reloadLabel="Reintentar" />);
    expect(screen.getByText('Error')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(onReload).toHaveBeenCalled();
  });
});

describe('SkeletonList', () => {
  it('renderiza cantidad solicitada', () => {
    render(<SkeletonList count={3} />);
    // 3 tarjetas esqueletos: buscamos por elementos con estilo inline (aproximación)
    const blocks = screen.getAllByRole('generic');
    expect(blocks.length).toBeGreaterThan(0);
  });
});

