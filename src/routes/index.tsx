import { Route, Routes } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { lazy, Suspense } from 'react';
import PrivateRoute from './PrivateRoute';
import Layout from '@app/components/Layout';

const Home = lazy(() => import('@pages/Home'));
const Login = lazy(() => import('@pages/Login'));
const Register = lazy(() => import('@pages/Register'));
const Wallet = lazy(() => import('@pages/Wallet'));
const Profile = lazy(() => import('@pages/Profile'));
const Settings = lazy(() => import('@pages/Settings'));
const Help = lazy(() => import('@pages/Help'));
const Catalog = lazy(() => import('@pages/Catalog'));
const MapPage = lazy(() => import('@pages/Map'));
const Notifications = lazy(() => import('@pages/Notifications'));
const NotFound = lazy(() => import('@pages/NotFound'));

export default function AppRoutes() {
  return (
    <Suspense fallback={<div role="status" aria-busy="true" style={{ padding: 16 }}>Cargando…</div>}>
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/catalog" element={<Layout><Catalog /></Layout>} />
        <Route path="/map" element={<Layout><MapPage /></Layout>} />
        <Route path="/login" element={<Layout><Login /></Layout>} />
        <Route path="/register" element={<Layout><Register /></Layout>} />
        {/* Rutas protegidas */}
        <Route element={<Layout><PrivateRoute /></Layout>}>
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="/help" element={<Layout><Help /></Layout>} />
        <Route path="/notifications" element={<Layout><Notifications /></Layout>} />
        <Route path="*" element={<Layout><NotFound /></Layout>} />
      </Routes>
    </Suspense>
  );
}
