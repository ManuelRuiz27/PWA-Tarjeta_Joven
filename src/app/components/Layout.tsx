import AppBar from './AppBar';
import BottomNav from './BottomNav';

/**
 * Layout responsive con AppBar fijo, contenido scroll y BottomNav fijo.
 */
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="d-flex flex-column" style={{ minHeight: '100vh' }}>
      <AppBar />
      {/* Contenido con padding para no quedar detrás del AppBar/BottomNav */}
      <main id="main-content" role="main" className="container" style={{ paddingTop: 72, paddingBottom: 72 }}>
        {children}
      </main>
      <BottomNav />
    </div>
  );
}

