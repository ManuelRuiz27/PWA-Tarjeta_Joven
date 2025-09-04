import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AppShell, { useAppShell } from '@app/components/AppShell';

function DemoChild() {
  const { setLoading, showToast } = useAppShell();
  return (
    <div>
      <button onClick={() => setLoading(true)}>Load</button>
      <button onClick={() => showToast('Hola')}>Toast</button>
    </div>
  );
}

describe('AppShell', () => {
  it('renderiza landmarks: header, main y nav', () => {
    render(
      <AppShell>
        <div>Contenido</div>
      </AppShell>
    );
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: /Navegación inferior/i })).toBeInTheDocument();
  });

  it('muestra overlay de loading y toast', () => {
    render(
      <AppShell>
        <DemoChild />
      </AppShell>
    );
    fireEvent.click(screen.getByText('Load'));
    expect(screen.getByRole('status')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Toast'));
    expect(screen.getByText('Hola')).toBeInTheDocument();
  });
});

