import { Bell, ChevronLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { prefetchRoute } from '@routes/prefetch';

export interface AppBarProps {
  /** Título a mostrar; puede venir de la ruta */
  title?: string;
  /** Muestra botón atrás si true */
  back?: boolean;
  /** Acciones extra a la derecha (además del ícono de notificaciones) */
  actions?: React.ReactNode;
}

/**
 * AppBar superior fijo con título dinámico, botón atrás opcional e ícono de notificaciones.
 * - Accesible: landmarks header/nav, foco inicial, labels claros.
 * - Atajo: Alt+← para volver cuando `back` está activo.
 */
export default function AppBar({ title = 'Tarjeta Joven', back = false, actions }: AppBarProps) {
  const navigate = useNavigate();
  const backRef = useRef<HTMLButtonElement | null>(null);
  const titleRef = useRef<HTMLAnchorElement | null>(null);
  const [unread, setUnread] = useState<number>(0);

  // Foco inicial: botón atrás si existe; si no, el título
  useEffect(() => {
    const id = setTimeout(() => {
      if (back && backRef.current) backRef.current.focus();
      else titleRef.current?.focus();
    }, 0);
    return () => clearTimeout(id);
  }, [back]);

  // Atajo Alt+← para volver
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (back && e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        navigate(-1);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [back, navigate]);

  // Badge de notificaciones (sincroniza con localStorage)
  useEffect(() => {
    const val = Number(localStorage.getItem('notif.unreadCount') || '0');
    if (!Number.isNaN(val)) setUnread(val);
    function onStorage(e: StorageEvent) {
      if (e.key === 'notif.unreadCount') {
        const n = Number(e.newValue || '0');
        if (!Number.isNaN(n)) setUnread(n);
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <header className="navbar navbar-light bg-light fixed-top" role="banner" style={{ height: 'var(--app-header-height)' }}>
      <nav className="container-fluid" aria-label="Barra superior">
        <div className="d-flex align-items-center justify-content-between w-100">
          <div className="d-flex align-items-center gap-1">
            {back ? (
              <button
                ref={backRef}
                type="button"
                className="btn btn-link text-secondary"
                aria-label="Volver"
                title="Volver"
                onClick={() => navigate(-1)}
              >
                <ChevronLeft size={24} aria-hidden="true" />
              </button>
            ) : (
              <div style={{ width: 40 }} aria-hidden="true" />
            )}
          </div>
          <Link
            to="/"
            ref={titleRef}
            className="navbar-brand m-0 text-truncate"
            aria-label="Ir al inicio"
            tabIndex={-1}
          >
            <span className="fw-bold" title={title}>{title}</span>
          </Link>
          <div className="d-flex align-items-center gap-1">
            {actions}
            <Link to="/notifications" className="btn btn-link text-secondary position-relative" aria-label="Notificaciones" title="Notificaciones" onMouseEnter={() => prefetchRoute('notifications')} onFocus={() => prefetchRoute('notifications')}>
              <Bell size={22} aria-hidden="true" />
              {unread > 0 && (
                <span aria-label={`${unread} notificaciones sin leer`} className="position-absolute" style={{ top: 6, right: 4, background: '#a93257', color: '#fff', borderRadius: 10, fontSize: 10, lineHeight: '14px', minWidth: 14, height: 14, textAlign: 'center', padding: '0 4px' }}>
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
