import { useState } from 'react';

export interface SupportTicketFormProps {
  onSubmitted?: () => void;
}

/**
 * Formulario para abrir un ticket al soporte con validación básica.
 * Campos: asunto (título) y mensaje. Mensajes de error en español y accesibles.
 */
export default function SupportTicketForm({ onSubmitted }: SupportTicketFormProps) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<{ subject?: string; message?: string }>({});
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [netError, setNetError] = useState<string | null>(null);

  function validate() {
    const e: typeof errors = {};
    if (!subject.trim()) e.subject = 'El asunto es obligatorio.';
    if (!message.trim()) e.message = 'El mensaje es obligatorio.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(false);
    setNetError(null);
    if (!validate()) return;
    try {
      setLoading(true);
      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, message }),
      });
      if (!res.ok) throw new Error('No se pudo enviar el ticket');
      setSent(true);
      setSubject('');
      setMessage('');
      onSubmitted?.();
    } catch (err: any) {
      setNetError(err.message || 'Error al enviar ticket');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      {sent && <p role="status">Tu ticket fue enviado correctamente.</p>}
      {netError && <p role="alert" style={{ color: 'crimson' }}>{netError}</p>}
      <div className="mb-2">
        <label htmlFor="subject" className="form-label">Asunto</label>
        <input
          id="subject"
          className="form-control"
          value={subject}
          onChange={(e) => setSubject(e.currentTarget.value)}
          aria-invalid={Boolean(errors.subject)}
          aria-describedby={errors.subject ? 'subject-error' : undefined}
        />
        {errors.subject && <div id="subject-error" className="text-danger" role="alert">{errors.subject}</div>}
      </div>
      <div className="mb-2">
        <label htmlFor="message" className="form-label">Mensaje</label>
        <textarea
          id="message"
          className="form-control"
          value={message}
          onChange={(e) => setMessage(e.currentTarget.value)}
          rows={4}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? 'message-error' : undefined}
        />
        {errors.message && <div id="message-error" className="text-danger" role="alert">{errors.message}</div>}
      </div>
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Enviando...' : 'Abrir ticket'}
      </button>
    </form>
  );
}

