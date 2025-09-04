import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Profile from '@pages/Profile';

describe('Profile page', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('edita y guarda datos básicos', async () => {
    (globalThis.fetch as any) = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
    render(<Profile />);
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ana@example.com' } });
    fireEvent.change(screen.getByLabelText('Teléfono'), { target: { value: '5512345678' } });
    fireEvent.click(screen.getByRole('button', { name: /Guardar|Guardando/ }));
    await waitFor(() => expect(screen.getByText(/Datos guardados/i)).toBeInTheDocument());
  });

  it('toggle de notificaciones persiste en localStorage y guarda', async () => {
    (globalThis.fetch as any) = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
    render(<Profile />);
    const btn = screen.getByRole('switch');
    fireEvent.click(btn);
    expect(localStorage.getItem('pref.notificationsEnabled')).toBe('true');
  });

  it('sube documento y lo registra en /api/profile/documents', async () => {
    const calls: string[] = [];
    (globalThis.fetch as any) = vi.fn((url: string) => {
      calls.push(url);
      if (url === '/api/files') {
        return Promise.resolve({ ok: true, json: async () => ({ file_id: 'f123', url: '/files/f123' }) });
      }
      if (url === '/api/profile/documents') {
        return Promise.resolve({ ok: true, json: async () => ({ ok: true }) });
      }
      return Promise.resolve({ ok: true, json: async () => ({}) });
    });

    render(<Profile />);
    const input = screen.getByLabelText(/Subir documento/i) as HTMLInputElement;
    const file = new File([new Uint8Array(10)], 'doc.jpg', { type: 'image/jpeg' });
    await fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => expect(calls.some((u) => u === '/api/profile/documents')).toBeTruthy());
  });
});
