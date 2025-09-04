import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SupportTicketForm from '../components/SupportTicketForm';

describe('SupportTicketForm', () => {
  it('valida campos requeridos y muestra errores', async () => {
    render(<SupportTicketForm />);
    fireEvent.click(screen.getByRole('button', { name: /Abrir ticket/i }));
    expect(await screen.findByText(/El asunto es obligatorio/i)).toBeInTheDocument();
    expect(await screen.findByText(/El mensaje es obligatorio/i)).toBeInTheDocument();
  });

  it('envía ticket y muestra estado enviado', async () => {
    (globalThis.fetch as any) = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
    render(<SupportTicketForm />);
    fireEvent.change(screen.getByLabelText(/Asunto/), { target: { value: 'Prueba' } });
    fireEvent.change(screen.getByLabelText(/Mensaje/), { target: { value: 'Hola' } });
    fireEvent.click(screen.getByRole('button', { name: /Abrir ticket/i }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(/fue enviado/));
  });
});

