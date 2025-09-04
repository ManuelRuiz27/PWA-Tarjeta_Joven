import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FileUploader from '@app/components/FileUploader';

function makeFile(name: string, type: string, size = 10) {
  const file = new File([new Uint8Array(size)], name, { type });
  Object.defineProperty(file, 'size', { value: size, writable: false });
  return file;
}

describe('FileUploader', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('valida tipo inválido', async () => {
    render(<FileUploader onUploaded={vi.fn()} />);
    const input = screen.getByLabelText(/Subir archivo/i) as HTMLInputElement;
    const bad = makeFile('doc.txt', 'text/plain', 1000);
    await fireEvent.change(input, { target: { files: [bad] } });
    expect(await screen.findByText(/Formato inválido/i)).toBeInTheDocument();
  });

  it('valida tamaño > 4MB', async () => {
    render(<FileUploader onUploaded={vi.fn()} />);
    const input = screen.getByLabelText(/Subir archivo/i) as HTMLInputElement;
    const big = makeFile('big.jpg', 'image/jpeg', 5 * 1024 * 1024);
    await fireEvent.change(input, { target: { files: [big] } });
    expect(await screen.findByText(/menor a 4MB/i)).toBeInTheDocument();
  });

  it('sube archivo OK y llama onUploaded', async () => {
    const onUploaded = vi.fn();
    (globalThis.fetch as any) = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ file_id: 'f1', url: '/f1' }) });
    render(<FileUploader onUploaded={onUploaded} />);
    const input = screen.getByLabelText(/Subir archivo/i) as HTMLInputElement;
    const img = makeFile('img.jpg', 'image/jpeg', 1024);
    await fireEvent.change(input, { target: { files: [img] } });
    await waitFor(() => expect(onUploaded).toHaveBeenCalledWith(expect.objectContaining({ fileId: 'f1' })));
  });

  it('muestra error y permite reintentar', async () => {
    const onUploaded = vi.fn();
    const mock = vi.fn()
      .mockResolvedValueOnce({ ok: false, text: async () => 'Err' })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ file_id: 'f2' }) });
    (globalThis.fetch as any) = mock;

    render(<FileUploader onUploaded={onUploaded} />);
    const input = screen.getByLabelText(/Subir archivo/i) as HTMLInputElement;
    const pdf = makeFile('doc.pdf', 'application/pdf', 1024);
    await fireEvent.change(input, { target: { files: [pdf] } });
    expect(await screen.findByText(/Error al subir/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Reintentar/i }));
    await waitFor(() => expect(onUploaded).toHaveBeenCalledWith(expect.objectContaining({ fileId: 'f2' })));
  });
});

