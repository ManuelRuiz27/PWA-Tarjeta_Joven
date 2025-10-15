import type { SettingsState, ThemePreference } from './settingsSlice';
import type { Locale } from '@i18n/messages';

const STORAGE_KEY = 'app.settings';
const LEGACY_LOCALE_KEY = 'app.locale';
const LEGACY_THEME_KEY = 'app.theme';
const LEGACY_NOTIFICATIONS_KEY = 'pref.notificationsEnabled';

function isBrowser() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function parseLocale(value: string | null | undefined): Locale | undefined {
  if (value === 'es' || value === 'en') {
    return value;
  }
  return undefined;
}

function parseTheme(value: string | null | undefined): ThemePreference | undefined {
  if (value === 'light' || value === 'dark') {
    return value;
  }
  return undefined;
}

export function loadSettingsState(): SettingsState {
  const defaults: SettingsState = {
    locale: 'es',
    theme: 'light',
    notificationsEnabled: false,
  };

  if (!isBrowser()) {
    return defaults;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SettingsState>;
      return {
        locale: parseLocale(parsed.locale) ?? parseLocale(window.localStorage.getItem(LEGACY_LOCALE_KEY)) ?? defaults.locale,
        theme: parseTheme(parsed.theme) ?? parseTheme(window.localStorage.getItem(LEGACY_THEME_KEY)) ?? defaults.theme,
        notificationsEnabled:
          typeof parsed.notificationsEnabled === 'boolean'
            ? parsed.notificationsEnabled
            : window.localStorage.getItem(LEGACY_NOTIFICATIONS_KEY) === 'true' || defaults.notificationsEnabled,
      };
    }
  } catch (error) {
    // Ignora errores de parsing y continúa con defaults
  }

  const locale = parseLocale(window.localStorage.getItem(LEGACY_LOCALE_KEY)) ?? defaults.locale;
  const theme = parseTheme(window.localStorage.getItem(LEGACY_THEME_KEY)) ?? defaults.theme;
  const notificationsEnabled = window.localStorage.getItem(LEGACY_NOTIFICATIONS_KEY) === 'true';

  return {
    locale,
    theme,
    notificationsEnabled,
  };
}

export function saveSettingsState(state: SettingsState) {
  if (!isBrowser()) {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.localStorage.setItem(LEGACY_LOCALE_KEY, state.locale);
    window.localStorage.setItem(LEGACY_THEME_KEY, state.theme);
    window.localStorage.setItem(LEGACY_NOTIFICATIONS_KEY, String(state.notificationsEnabled));
  } catch (error) {
    // En modo privado u otros errores, ignorar
  }
}
