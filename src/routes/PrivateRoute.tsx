import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '@app/hooks';

/**
 * Ruta protegida por autenticación.
 * Si no hay tokens en el estado, redirige a /login.
 */
export default function PrivateRoute() {
  const location = useLocation();
  const isAuthenticated = useAppSelector((s) => Boolean(s.auth.tokens));

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

