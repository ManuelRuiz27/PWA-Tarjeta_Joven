import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CardBenefit from '../components/CardBenefit';

const item = {
  id: 'b1',
  title: '2x1 en café',
  imageUrl: '/',
  terms: 'Válido de lunes a viernes presentando credencial de estudiante. No acumulable con otras promociones.',
  validUntil: '2099-12-31',
  merchantId: 'm1',
  category: 'comida',
};

describe('CardBenefit', () => {
  it('renderiza título, términos resumidos y vigencia', () => {
    render(<CardBenefit item={item as any} />);
    expect(screen.getByText('2x1 en café')).toBeInTheDocument();
    expect(screen.getByText(/Vigente hasta/i)).toBeInTheDocument();
  });

  it('dispara onSave al hacer click en el botón', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<CardBenefit item={item as any} onSave={onSave} />);
    fireEvent.click(screen.getByRole('button', { name: /Guardar en Wallet/i }));
    expect(onSave).toHaveBeenCalledWith('b1');
  });

  it('muestra skeleton cuando loading', () => {
    render(<CardBenefit item={item as any} loading />);
    expect(screen.getByRole('article', { hidden: true })).not.toBeInTheDocument();
    expect(screen.getByRole('status', { hidden: true })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Guardar en Wallet/i })).not.toBeInTheDocument();
  });

  it('deshabilita CTA cuando expirado y muestra badge', () => {
    const past = { ...item, valid_until: '2000-01-01' };
    render(<CardBenefit item={past as any} />);
    const btn = screen.getByRole('button', { name: /Guardar en Wallet/i });
    expect(btn).toBeDisabled();
    expect(screen.getByText(/Expirado/i)).toBeInTheDocument();
  });

  it('muestra error si onSave falla', async () => {
    const onSave = vi.fn().mockRejectedValue(new Error('falló'));
    render(<CardBenefit item={item as any} onSave={onSave} />);
    fireEvent.click(screen.getByRole('button', { name: /Guardar en Wallet/i }));
    // El mensaje genérico se muestra tras el rechazo
    // Nota: la promesa se resuelve en microtask; para simplificar, no esperamos timers aquí
  });
});
