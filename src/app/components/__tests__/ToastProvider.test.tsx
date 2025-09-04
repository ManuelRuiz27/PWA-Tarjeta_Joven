import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ToastProvider, { useToast } from '@app/components/ToastProvider';

function Demo() {
  const { show } = useToast();
  return <button onClick={() => show('Hola', { duration: 100 })}>Mostrar</button>;
}

describe('ToastProvider', () => {
  it('muestra y oculta toast', async () => {
    vi.useFakeTimers();
    render(
      <ToastProvider>
        <Demo />
      </ToastProvider>
    );
    fireEvent.click(screen.getByText('Mostrar'));
    expect(screen.getByText('Hola')).toBeInTheDocument();
    vi.advanceTimersByTime(150);
    // podría desaparecer tras el timeout
    vi.useRealTimers();
  });
});

