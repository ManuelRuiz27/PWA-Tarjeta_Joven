import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BottomNav from '@app/components/BottomNav';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@routes/prefetch', () => ({ prefetchRoute: vi.fn() }));
import { prefetchRoute } from '@routes/prefetch';

describe('BottomNav prefetch', () => {
  it('prefetch de ruta al hacer hover/focus', () => {
    render(
      <MemoryRouter>
        <BottomNav />
      </MemoryRouter>
    );
    const catalog = screen.getByRole('link', { name: /Catálogo/i });
    fireEvent.mouseEnter(catalog);
    expect(prefetchRoute).toHaveBeenCalled();
  });
});

