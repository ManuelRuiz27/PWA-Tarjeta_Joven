import React from 'react';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  reloadLabel?: string;
  onReload?: () => void;
  helpHref?: string;
  helpLabel?: string;
}

/**
 * Estado de error con mensajes claros en español. Incluye CTA de recarga y enlace de ayuda.
 */
export default function ErrorState({
  title = 'Ocurrió un error',
  message = 'No pudimos completar la acción. Intenta nuevamente.',
  reloadLabel = 'Reintentar',
  onReload,
  helpHref,
  helpLabel,
}: ErrorStateProps) {
  return (
    <div role="alert" className="text-center" style={{ padding: 24 }}>
      <h2 className="h5" style={{ color: 'crimson' }}>{title}</h2>
      <p className="text-muted">{message}</p>
      <div className="d-flex gap-2 justify-content-center">
        {onReload && (
          <button type="button" className="btn btn-outline-danger" onClick={onReload}>
            {reloadLabel}
          </button>
        )}
        {helpHref && helpLabel && (
          <a className="btn btn-link" href={helpHref} target="_blank" rel="noreferrer">
            {helpLabel}
          </a>
        )}
      </div>
    </div>
  );
}

