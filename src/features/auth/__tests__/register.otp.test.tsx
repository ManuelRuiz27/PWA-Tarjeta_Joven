import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Register from '@pages/Register';

vi.mock('react-router-dom', async (orig) => {
  const actual: any = await (orig as any)();
  return { ...actual, useNavigate: () => vi.fn() };
});

describe('Register OTP flow', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('pasa a verificación y acepta OTP pegado', async () => {
    // Mock registro OK, luego verificación OK
    (globalThis.fetch as any) = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ tokens: { accessToken: 'a', refreshToken: 'b', expiresAt: 1 }, user: { id: '1' } }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ tokens: { accessToken: 'a', refreshToken: 'b', expiresAt: 1 }, user: { id: '1' } }) });

    render(<Register />);
    fireEvent.change(screen.getByLabelText('CURP'), { target: { value: 'GODE561231HDFRRN09' } });
    fireEvent.change(screen.getByLabelText('Teléfono'), { target: { value: '5512345678' } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'secreto' } });
    fireEvent.click(screen.getByRole('button', { name: /Registrarme/i }));

    // Debe entrar a pantalla OTP
    await waitFor(() => expect(screen.getByText(/Verificación SMS/i)).toBeInTheDocument());

    const first = screen.getByLabelText('Dígito 1 de 6');
    fireEvent.paste(first, { clipboardData: { getData: () => '123456' } } as any);

    const verifyBtn = screen.getByRole('button', { name: /Verificar/i });
    expect(verifyBtn).not.toBeDisabled();
    fireEvent.click(verifyBtn);
    await waitFor(() => expect((globalThis.fetch as any)).toHaveBeenCalledTimes(2));
  });

  it('muestra error si OTP falla y permite reintento', async () => {
    // Registro OK; verificación falla primero, luego éxito
    (globalThis.fetch as any) = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ tokens: { accessToken: 'a', refreshToken: 'b', expiresAt: 1 }, user: { id: '1' } }) })
      .mockResolvedValueOnce({ ok: false, text: async () => 'OTP inválido' })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ tokens: { accessToken: 'a', refreshToken: 'b', expiresAt: 1 }, user: { id: '1' } }) });

    render(<Register />);
    fireEvent.change(screen.getByLabelText('CURP'), { target: { value: 'GODE561231HDFRRN09' } });
    fireEvent.change(screen.getByLabelText('Teléfono'), { target: { value: '5512345678' } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'secreto' } });
    fireEvent.click(screen.getByRole('button', { name: /Registrarme/i }));
    await waitFor(() => expect(screen.getByText(/Verificación SMS/i)).toBeInTheDocument());

    const first = screen.getByLabelText('Dígito 1 de 6');
    fireEvent.paste(first, { clipboardData: { getData: () => '123456' } } as any);

    const verifyBtn = screen.getByRole('button', { name: /Verificar/i });
    fireEvent.click(verifyBtn);
    // Debe mostrar error accesible
    await waitFor(() => expect(screen.getByText(/Código incorrecto|expirado/i)).toBeInTheDocument());

    // Reintento (la siguiente llamada será exitosa)
    fireEvent.click(verifyBtn);
    await waitFor(() => expect((globalThis.fetch as any)).toHaveBeenCalledTimes(3));
  });
});
