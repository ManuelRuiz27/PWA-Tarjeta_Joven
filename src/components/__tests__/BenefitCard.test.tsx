import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import BenefitCard from '../BenefitCard';

const benefit = {
  id: 'b1',
  name: 'Descuento en gimnasio',
  category: 'Bienestar',
  municipality: 'Querétaro',
  discount: '20% OFF',
  merchantId: 'm1',
  shortDescription: 'Acceso ilimitado a clases grupales.',
};

describe('BenefitCard', () => {
  it('llama a onSelect al hacer clic', () => {
    const handleSelect = vi.fn();
    render(<BenefitCard benefit={benefit} onSelect={handleSelect} />);

    fireEvent.click(screen.getByRole('button', { name: /ver detalle/i }));

    expect(handleSelect).toHaveBeenCalledWith(benefit);
  });

  it('permite activar con teclado', () => {
    const handleSelect = vi.fn();
    render(<BenefitCard benefit={benefit} onSelect={handleSelect} />);

    const card = screen.getByRole('button', { name: /ver detalle de descuento en gimnasio/i });
    fireEvent.keyDown(card, { key: 'Enter' });

    expect(handleSelect).toHaveBeenCalledTimes(1);
  });
});
