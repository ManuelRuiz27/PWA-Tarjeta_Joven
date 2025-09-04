import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Help from '@pages/Help';

describe('Help (FAQ y ticket)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renderiza acordiones de FAQ', async () => {
    render(<Help />);
    expect(screen.getByText(/Centro de ayuda/i)).toBeInTheDocument();
    // Acordeones presentes
    expect(screen.getByRole('button', { name: /¿Qué es Tarjeta Joven/i })).toBeInTheDocument();
  });

  it('envía ticket de soporte', async () => {
    (globalThis.fetch as any) = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
    render(<Help />);
    fireEvent.change(screen.getByLabelText(/Asunto/), { target: { value: 'Prueba' } });
    fireEvent.change(screen.getByLabelText(/Mensaje/), { target: { value: 'Hola' } });
    fireEvent.click(screen.getByRole('button', { name: /Abrir ticket/i }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(/fue enviado/));
  });
});
