import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import OTPInput from '@app/components/OTPInput';

describe('OTPInput', () => {
  it('completa con pegado en la primera celda', () => {
    const onComplete = vi.fn();
    render(<OTPInput length={6} onComplete={onComplete} />);
    const first = screen.getByLabelText('Dígito 1 de 6') as HTMLInputElement;
    fireEvent.paste(first, {
      clipboardData: {
        getData: () => '123456',
      },
    } as any);
    expect(onComplete).toHaveBeenCalledWith('123456');
  });

  it('mueve atrás con Backspace y borra', () => {
    render(<OTPInput length={4} />);
    const first = screen.getByLabelText('Dígito 1 de 4') as HTMLInputElement;
    const second = screen.getByLabelText('Dígito 2 de 4') as HTMLInputElement;
    fireEvent.change(first, { target: { value: '1' } });
    fireEvent.change(second, { target: { value: '2' } });
    expect(second.value).toBe('2');
    fireEvent.keyDown(second, { key: 'Backspace' });
    expect(second.value).toBe('');
    // backspace otra vez debería ir al anterior
    fireEvent.keyDown(second, { key: 'Backspace' });
    expect(first.value).toBe('');
  });

  it('dispara onComplete al ingresar todos los dígitos', () => {
    const onComplete = vi.fn();
    render(<OTPInput length={3} onComplete={onComplete} />);
    fireEvent.change(screen.getByLabelText('Dígito 1 de 3'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Dígito 2 de 3'), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText('Dígito 3 de 3'), { target: { value: '3' } });
    expect(onComplete).toHaveBeenCalledWith('123');
  });
});

