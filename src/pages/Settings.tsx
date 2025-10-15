import NotificationsToggle from '@features/notifications/components/NotificationsToggle';
import { useI18n } from '@app/i18n';
import { useTheme } from '@app/theme';
import { FormattedMessage, useIntl } from 'react-intl';
import { useAppSelector } from '@app/hooks';

export default function Settings() {
  const { locale, setLocale } = useI18n();
  const { theme, setTheme } = useTheme();
  const intl = useIntl();
  const notificationsEnabled = useAppSelector((state) => state.settings.notificationsEnabled);
  return (
    <section style={{ display: 'grid', gap: 'var(--space-4)' }}>
      <header>
        <h1 style={{ marginBottom: 'var(--space-3)' }}>
          <FormattedMessage id="settings.title" defaultMessage="Configuración" />
        </h1>
        <p style={{ color: 'var(--color-muted)', maxWidth: 520 }}>
          <FormattedMessage
            id="settings.subtitle"
            defaultMessage="Personaliza tu experiencia sin recargar la página. Los cambios se guardan automáticamente."
          />
        </p>
      </header>

      <div
        style={{
          background: 'var(--color-bg)',
          border: `1px solid var(--color-border)`,
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-4)',
          boxShadow: 'var(--shadow-sm)',
          display: 'grid',
          gap: 'var(--space-4)',
        }}
        aria-label={intl.formatMessage({ id: 'settings.preferences', defaultMessage: 'Preferencias de interfaz' })}
      >
        <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
          <label htmlFor="settings-language" style={{ fontWeight: 600 }}>
            <FormattedMessage id="settings.language" defaultMessage="Idioma" />
          </label>
          <select
            id="settings-language"
            value={locale}
            onChange={(e) => setLocale(e.target.value as any)}
            style={{
              padding: 'var(--space-2) var(--space-3)',
              borderRadius: 'var(--radius)',
              border: `1px solid var(--color-border)`,
              background: 'var(--color-bg)',
              color: 'var(--color-text)',
            }}
          >
            <option value="es">Español</option>
            <option value="en">English</option>
          </select>
        </div>

        <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
          <label htmlFor="settings-theme" style={{ fontWeight: 600 }}>
            <FormattedMessage id="settings.theme" defaultMessage="Tema" />
          </label>
          <select
            id="settings-theme"
            value={theme}
            onChange={(e) => setTheme(e.target.value as any)}
            style={{
              padding: 'var(--space-2) var(--space-3)',
              borderRadius: 'var(--radius)',
              border: `1px solid var(--color-border)`,
              background: 'var(--color-bg)',
              color: 'var(--color-text)',
            }}
          >
            <option value="light">
              <FormattedMessage id="theme.light" defaultMessage="Claro" />
            </option>
            <option value="dark">
              <FormattedMessage id="theme.dark" defaultMessage="Oscuro" />
            </option>
          </select>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-3)',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'grid', gap: 'var(--space-1)' }}>
            <span style={{ fontWeight: 600 }}>
              <FormattedMessage id="settings.notifications" defaultMessage="Recibir notificaciones" />
            </span>
            <span style={{ color: 'var(--color-muted)', fontSize: 'var(--font-size-sm)' }}>
              {notificationsEnabled ? (
                <FormattedMessage
                  id="settings.notifications.enabled"
                  defaultMessage="Te avisaremos de nuevas promociones."
                />
              ) : (
                <FormattedMessage
                  id="settings.notifications.disabled"
                  defaultMessage="Activa el interruptor para enterarte de novedades."
                />
              )}
            </span>
          </div>
          <NotificationsToggle
            hideTitle
            label={intl.formatMessage({ id: 'settings.notifications', defaultMessage: 'Recibir notificaciones' })}
          />
        </div>
      </div>
    </section>
  );
}
