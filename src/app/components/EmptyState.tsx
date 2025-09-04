import React from 'react';

export interface EmptyStateProps {
  title?: string;
  message?: string;
  reloadLabel?: string;
  onReload?: () => void;
  helpHref?: string;
  helpLabel?: string;
}

/**
 * Estado vacío con mensajes claros en español y CTA opcional de recarga/enlace de ayuda.
 */
export default function EmptyState({
  title = 'Nada por aquí',
  message = 'No hay elementos para mostrar.',
  reloadLabel = 'Recargar',
  onReload,
  helpHref,
  helpLabel,
}: EmptyStateProps) {
  return (
    <div role="status" aria-live="polite" className="text-center" style={{ padding: 24 }}>
      <h2 className="h5">{title}</h2>
      <p className="text-muted">{message}</p>
      <div className="d-flex gap-2 justify-content-center">
        {onReload && (
          <button type="button" className="btn btn-outline-primary" onClick={onReload}>
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

