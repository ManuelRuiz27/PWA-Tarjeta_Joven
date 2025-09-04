import NotificationsToggle from '@features/notifications/components/NotificationsToggle';
import { useI18n } from '@app/i18n';
import { useTheme } from '@app/theme';
import { FormattedMessage } from 'react-intl';

export default function Settings() {
  const { locale, setLocale } = useI18n();
  const { theme, setTheme } = useTheme();
  return (
    <section>
      <h1><FormattedMessage id="settings.title" defaultMessage="Configuración" /></h1>
      <div style={{ marginBottom: 16 }}>
        <label>
          Idioma
          <select value={locale} onChange={(e) => setLocale(e.target.value as any)} style={{ marginLeft: 8 }} aria-label="Seleccionar idioma">
            <option value="es">Español</option>
            <option value="en">English</option>
          </select>
        </label>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label>
          <FormattedMessage id="settings.theme" defaultMessage="Tema" />
          <select value={theme} onChange={(e) => setTheme(e.target.value as any)} style={{ marginLeft: 8 }} aria-label="Seleccionar tema">
            <option value="light"><FormattedMessage id="theme.light" defaultMessage="Claro" /></option>
            <option value="dark"><FormattedMessage id="theme.dark" defaultMessage="Oscuro" /></option>
          </select>
        </label>
      </div>
      <NotificationsToggle />
    </section>
  );
}
