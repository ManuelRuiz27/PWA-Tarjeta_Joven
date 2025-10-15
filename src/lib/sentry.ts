import * as Sentry from '@sentry/react';

const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;

function resolveRelease() {
  const explicitRelease = import.meta.env.VITE_SENTRY_RELEASE as string | undefined;
  if (explicitRelease && explicitRelease.trim()) {
    return explicitRelease.trim();
  }
  const appVersion = (import.meta.env.VITE_APP_VERSION as string | undefined)?.trim();
  if (appVersion) {
    return `pwa-tarjeta-joven@${appVersion}`;
  }
  const commitSha = (import.meta.env.VITE_COMMIT_SHA as string | undefined)?.trim();
  if (commitSha) {
    return `pwa-tarjeta-joven@${commitSha}`;
  }
  return 'pwa-tarjeta-joven@dev';
}

if (dsn) {
  Sentry.init({
    dsn,
    release: resolveRelease(),
    environment: import.meta.env.MODE,
    tracesSampleRate: 0.1,
    integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });

  Sentry.setTag('environment', import.meta.env.MODE);
}

export {}; 
