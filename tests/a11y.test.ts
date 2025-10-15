import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import HelpPage from '../src/pages/Help';
import { IntlProvider } from 'react-intl';
import { describe, expect, it } from 'vitest';

describe('accesibilidad global', () => {
  it('Help no reporta violaciones críticas', async () => {
    const { container } = render(
      <IntlProvider locale="es" messages={{}}>
        <HelpPage />
      </IntlProvider>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
