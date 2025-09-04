import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('virtual:pwa-register/react', () => {
  const needRefresh = [true, vi.fn()] as any;
  const offlineReady = [false, vi.fn()] as any;
  return {
    useRegisterSW: () => ({ needRefresh, offlineReady, updateServiceWorker: vi.fn() }),
  };
});

import SWUpdatePrompt from '@app/components/SWUpdatePrompt';

describe('SWUpdatePrompt', () => {
  it('muestra aviso de actualización y botón Actualizar', () => {
    render(<SWUpdatePrompt />);
    expect(screen.getByText(/actualización disponible/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Actualizar/i })).toBeInTheDocument();
  });
});

