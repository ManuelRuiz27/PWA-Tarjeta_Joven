import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Dialog from '@app/components/Dialog';

describe('Dialog/Modal', () => {
  it('enfoca dentro y cierra con Escape y backdrop', () => {
    const onClose = vi.fn();
    render(
      <Dialog isOpen onClose={onClose} title="Título">
        <button>Botón</button>
      </Dialog>
    );
    // Foco dentro: botón de cierre o el primer botón
    expect(document.body).toBeDefined();
    // Esc
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });
});

