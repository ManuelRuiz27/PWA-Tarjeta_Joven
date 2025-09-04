import React from 'react';
import { Provider } from 'react-redux';
import { store } from '@app/store';
import { I18nProvider } from '@app/i18n';
import { render, RenderOptions } from '@testing-library/react';

export function renderWithProviders(ui: React.ReactNode, options?: RenderOptions) {
  return render(
    <Provider store={store}>
      <I18nProvider>{ui}</I18nProvider>
    </Provider>,
    options
  );
}

