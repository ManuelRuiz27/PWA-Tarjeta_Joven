import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import AppBar from './AppBar';
import BottomNav from './BottomNav';
import Toast from './Toast';

interface AppShellContextValue {
  loading: boolean;
  setLoading: (v: boolean) => void;
  showToast: (msg: string, variant?: 'info' | 'success' | 'error') => void;
}

const AppShellContext = createContext<AppShellContextValue | undefined>(undefined);

export function useAppShell() {
  const ctx = useContext(AppShellContext);
  if (!ctx) throw new Error('useAppShell debe usarse dentro de <AppShell>');
  return ctx;
}

export interface AppShellProps {
  children: React.ReactNode;
}

/**
 * AppShell para PWA: Header fijo, `main` scrollable y BottomNav fijo.
 * Incluye soporte de safe-area (iOS), variables CSS para alturas, estado global de loading y toasts.
 */
export default function AppShell({ children }: AppShellProps) {
  const [loading, setLoading] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastVariant, setToastVariant] = useState<'info' | 'success' | 'error'>('info');

  const showToast = useCallback((msg: string, variant: 'info' | 'success' | 'error' = 'info') => {
    setToastMsg(msg);
    setToastVariant(variant);
    setToastOpen(true);
  }, []);

  const value = useMemo(() => ({ loading, setLoading, showToast }), [loading, showToast]);

  return (
    <AppShellContext.Provider value={value}>
      <div className="app-shell d-flex flex-column" style={{ minHeight: '100vh' }}>
        <AppBar />
        <main id="main-content" role="main" className="app-main container" tabIndex={-1}>
          {children}
        </main>
        <BottomNav />

        {/* Loading global accesible */}
        {loading && (
          <div role="status" aria-live="polite" className="app-loading-overlay">
            <div className="spinner-border text-light" role="img" aria-label="Cargando" />
          </div>
        )}

        {/* Toast */}
        <Toast open={toastOpen} message={toastMsg} variant={toastVariant} onClose={() => setToastOpen(false)} />
      </div>
    </AppShellContext.Provider>
  );
}

