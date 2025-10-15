import * as Sentry from '@sentry/react';

const env = typeof import.meta !== 'undefined' ? import.meta.env : undefined;
const dsn = env?.['VITE_SENTRY_DSN'];
const envMode = env?.['MODE'];

function resolveRelease() {
  const explicitRelease = env?.['VITE_SENTRY_RELEASE']?.trim();
  if (explicitRelease) {
    return explicitRelease;
  }
  const appVersion = env?.['VITE_APP_VERSION']?.trim();
  if (appVersion) {
    return `pwa-tarjeta-joven@${appVersion}`;
  }
  const commitSha = env?.['VITE_COMMIT_SHA']?.trim();
  if (commitSha) {
    return `pwa-tarjeta-joven@${commitSha}`;
  }
  return 'pwa-tarjeta-joven@dev';
}

if (dsn) {
  const options: Sentry.BrowserOptions = {
    dsn,
    release: resolveRelease(),
    tracesSampleRate: 0.1,
    integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  };
  if (envMode) {
    options.environment = envMode;
  }
  Sentry.init(options);

  if (envMode) {
    Sentry.setTag('environment', envMode);
  }
}

export {};
