import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface FileUploaderProps {
  label?: string;
  accept?: string; // por defecto PDF/JPG
  maxSizeBytes?: number; // por defecto 4MB
  onUploaded?: (result: { fileId: string; file: File; url?: string }) => void;
  disabled?: boolean;
}

/**
 * Cargador de archivos para PDF/JPG con validación de tipo y tamaño (<4MB).
 * - Muestra vista previa si es imagen.
 * - Realiza POST a /api/files (stub) y devuelve `file_id`.
 * - Maneja estados de carga, error y reintento.
 */
export default function FileUploader({
  label = 'Subir archivo (PDF/JPG)',
  accept = 'application/pdf,image/jpeg',
  maxSizeBytes = 4 * 1024 * 1024,
  onUploaded,
  disabled = false,
}: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Vista previa si es imagen
  useEffect(() => {
    if (!file) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      return;
    }
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    return;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  const acceptList = useMemo(() => accept.split(',').map((s) => s.trim()), [accept]);

  function validate(f: File): string | null {
    if (!acceptList.includes(f.type)) return 'Formato inválido. Solo PDF o JPG.';
    if (f.size > maxSizeBytes) return 'El archivo debe ser menor a 4MB.';
    return null;
  }

  const doUpload = useCallback(async (f: File) => {
    setError(null);
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('file', f);
      const res = await fetch('/api/files', { method: 'POST', body: fd });
      if (!res.ok) throw new Error(await res.text().catch(() => 'Error al subir archivo'));
      const data = (await res.json()) as { file_id: string; url?: string };
      const payload: { fileId: string; file: File; url?: string } = { fileId: data.file_id, file: f };
      if (typeof data.url === 'string') {
        payload.url = data.url;
      }
      onUploaded?.(payload);
    } catch (e: any) {
      setError(e?.message || 'Error al subir archivo');
    } finally {
      setLoading(false);
    }
  }, [onUploaded]);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.currentTarget.files?.[0] || null;
    setFile(f);
    if (!f) return;
    const v = validate(f);
    if (v) {
      setError(v);
      return;
    }
    await doUpload(f);
  }

  async function onRetry() {
    if (file) await doUpload(file);
  }

  return (
    <div className="d-grid gap-2">
      <label className="form-label" htmlFor="file-uploader-input">{label}</label>
      <input
        id="file-uploader-input"
        ref={inputRef}
        type="file"
        accept={accept}
        className="form-control"
        onChange={onChange}
        disabled={disabled || loading}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? 'file-uploader-error' : undefined}
      />
      {previewUrl && (
        <img src={previewUrl} alt="Vista previa" style={{ maxWidth: 220, borderRadius: 8, border: '1px solid var(--color-border)' }} />
      )}
      {loading && <div role="status" aria-live="polite">Subiendo...</div>}
      {error && (
        <div id="file-uploader-error" role="alert" className="text-danger d-flex align-items-center gap-2">
          <span>{error}</span>
          {file && (
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onRetry} disabled={loading}>Reintentar</button>
          )}
        </div>
      )}
    </div>
  );
}

