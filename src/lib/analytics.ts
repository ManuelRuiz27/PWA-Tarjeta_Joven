export type AnalyticsEventName =
  | 'open_app'
  | 'open_map'
  | 'search'
  | 'filter'
  | 'open_merchant'
  | 'install_click'
  | 'installed';

export interface AnalyticsPayload {
  [key: string]: unknown;
}

export interface AnalyticsEvent {
  event: AnalyticsEventName;
  payload?: AnalyticsPayload;
  timestamp: string;
}

const eventBuffer: AnalyticsEvent[] = [];

const endpoint = (import.meta.env.VITE_ANALYTICS_URL as string | undefined) ?? '/api/analytics';
const mode = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.MODE : undefined;
const isTestEnvironment = mode === 'test';

function isBrowser() {
  return typeof window !== 'undefined' && typeof navigator !== 'undefined';
}

function sendWithBeacon(body: string) {
  if (!isBrowser() || typeof navigator.sendBeacon !== 'function') return false;
  try {
    const blob = new Blob([body], { type: 'application/json' });
    return navigator.sendBeacon(endpoint, blob);
  } catch (error) {
    return false;
  }
}

async function sendWithFetch(body: string) {
  if (!isBrowser() || typeof fetch !== 'function') return false;
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

function recordLocally(event: AnalyticsEvent) {
  eventBuffer.push(event);
  if (isTestEnvironment) return;
  if (!isBrowser()) return;
  if (typeof console !== 'undefined') {
    console.debug('[analytics]', event);
  }
}

export async function track(event: AnalyticsEventName, payload?: AnalyticsPayload) {
  const analyticsEvent: AnalyticsEvent = {
    event,
    payload,
    timestamp: new Date().toISOString(),
  };

  if (!isBrowser() || isTestEnvironment || !endpoint) {
    recordLocally(analyticsEvent);
    return;
  }

  const body = JSON.stringify(analyticsEvent);
  const beaconSent = sendWithBeacon(body);
  if (beaconSent) return;

  const fetchSent = await sendWithFetch(body);
  if (!fetchSent) {
    recordLocally(analyticsEvent);
  }
}

export function getBufferedAnalyticsEvents() {
  return [...eventBuffer];
}
