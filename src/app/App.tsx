import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import './global.css';
import { useEffect } from 'react';
import { initWalletQueueProcessor } from '@features/wallet/queue';
import { I18nProvider } from './i18n';
import { ThemeProvider } from './theme';
import SWUpdatePrompt from '@app/components/SWUpdatePrompt';
import InstallPrompt from '@app/components/InstallPrompt';
import ErrorBoundary from '@app/components/ErrorBoundary';
import ToastProvider from '@app/components/ToastProvider';
import OfflineBanner from '@app/components/OfflineBanner';
import AppRoutes from '@routes';

function App() {
  useEffect(() => {
    initWalletQueueProcessor();
  }, []);
  return (
    <Provider store={store}>
      <I18nProvider>
        <ThemeProvider>
          <ToastProvider>
            <BrowserRouter>
              <ErrorBoundary>
                <AppRoutes />
                <OfflineBanner />
                <SWUpdatePrompt />
                <InstallPrompt />
              </ErrorBoundary>
            </BrowserRouter>
          </ToastProvider>
        </ThemeProvider>
      </I18nProvider>
    </Provider>
  );
}

export default App;
