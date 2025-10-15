import React from 'react';

interface State { hasError: boolean; error?: unknown }

/**
 * Captura errores de render y muestra un fallback, indicando si no hay conexión.
 */
export default class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  override state: Readonly<State> = { hasError: false };

  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: unknown, info: React.ErrorInfo) {
    // Ya tenemos Sentry inicializado en @lib/sentry
    // Podemos añadir logs aquí si se requiere.
  }

  override render(): React.ReactNode {
    if (this.state.hasError) {
      const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
      return (
        <section style={{ padding: 24 }}>
          <h1>{offline ? 'Sin conexión' : 'Ha ocurrido un error'}</h1>
          <p className="text-muted">
            {offline
              ? 'No hay conexión a Internet. Revisa tu red e intenta nuevamente.'
              : 'Intenta recargar la página o volver al inicio.'}
          </p>
          <div className="d-flex gap-2">
            <button className="btn btn-primary" onClick={() => window.location.reload()}>Recargar</button>
            <a className="btn btn-outline-secondary" href="/">Inicio</a>
          </div>
        </section>
      );
    }
    return this.props.children as any;
  }
}

