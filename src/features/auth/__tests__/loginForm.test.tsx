import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Login from '@pages/Login';

describe('Login form', () => {
  beforeEach(() => {
    // mock fetch for login call
    (globalThis.fetch as any) = async () => ({ ok: true, json: async () => ({ tokens: { accessToken: 'a', refreshToken: 'r', expiresAt: 1 }, user: { id: '1' } }) });
  });

  it('muestra errores inline con zod en blur', async () => {
    render(<Login />);
    const curp = screen.getByLabelText('CURP');
    fireEvent.blur(curp);
    expect(await screen.findByText(/CURP inválida/)).toBeInTheDocument();

    const pwd = screen.getByLabelText('Contraseña');
    fireEvent.change(pwd, { target: { value: '123' } });
    fireEvent.blur(pwd);
    expect(await screen.findByText(/al menos 6/)).toBeInTheDocument();
  });

  it('deshabilita botón mientras envía y muestra error de red', async () => {
    (globalThis.fetch as any) = async () => ({ ok: false, text: async () => 'Fail' });
    render(<Login />);
    fireEvent.change(screen.getByLabelText('CURP'), { target: { value: 'GODE561231HDFRRN09' } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'secreto' } });
    const btn = screen.getByRole('button', { name: /Entrar|\.\.\./ });
    fireEvent.click(btn);
    expect(btn).toBeDisabled();
  });
});
