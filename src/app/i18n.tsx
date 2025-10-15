import { IntlProvider } from 'react-intl';
import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { messages, type Locale } from '@i18n/messages';
import { useAppDispatch, useAppSelector } from './hooks';
import { setLocale as setLocaleAction } from '@features/settings/settingsSlice';

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const locale = useAppSelector((state) => state.settings.locale);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale: (next: Locale) => dispatch(setLocaleAction(next)),
    }),
    [dispatch, locale],
  );
  return (
    <I18nContext.Provider value={value}>
      <IntlProvider locale={locale} messages={messages[locale]} defaultLocale="es">
        {children}
      </IntlProvider>
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n debe usarse dentro de I18nProvider');
  return ctx;
}
