import { NavLink } from 'react-router-dom';
import { Home, List, Wallet, User } from 'lucide-react';
import { prefetchRoute } from '@routes/prefetch';

/**
 * BottomNav fijo con 4 tabs y navegación con React Router.
 * Accesible: usa nav con role, y NavLink añade aria-current automáticamente.
 */
export default function BottomNav() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    'nav-link d-flex flex-column align-items-center gap-1 ' + (isActive ? 'active fw-semibold' : '');

  return (
    <nav className="navbar bg-light fixed-bottom border-top d-lg-none" role="navigation" aria-label="Navegación inferior" style={{ height: 'var(--app-bottom-nav-height)' }}>
      <div className="container-fluid">
        <ul className="nav nav-pills nav-justified bottom-nav w-100">
          <li className="nav-item">
            <NavLink to="/" className={linkClass} end onMouseEnter={() => prefetchRoute('home')} onFocus={() => prefetchRoute('home')}>
              <Home size={20} aria-hidden="true" />
              <span>Home</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/catalog" className={linkClass} onMouseEnter={() => prefetchRoute('catalog')} onFocus={() => prefetchRoute('catalog')}>
              <List size={20} aria-hidden="true" />
              <span>Catálogo</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/wallet" className={linkClass} onMouseEnter={() => prefetchRoute('wallet')} onFocus={() => prefetchRoute('wallet')}>
              <Wallet size={20} aria-hidden="true" />
              <span>Wallet</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/profile" className={linkClass} onMouseEnter={() => prefetchRoute('profile')} onFocus={() => prefetchRoute('profile')}>
              <User size={20} aria-hidden="true" />
              <span>Perfil</span>
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
}
