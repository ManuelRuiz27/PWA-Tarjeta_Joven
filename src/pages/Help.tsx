import { useCallback, useMemo, useState, type ReactNode } from 'react';
import Accordion from '@features/help/components/Accordion';
import SupportTicketForm from '@features/help/components/SupportTicketForm';
import { FormattedMessage } from 'react-intl';
import { useOnline } from '@lib/useOnline';
import { track } from '@lib/analytics';

const categories = [
  { id: 'all', label: 'Todo', description: 'Todas las preguntas' },
  { id: 'program', label: 'Programa', description: 'Requisitos y uso de la tarjeta' },
  { id: 'discounts', label: 'Descuentos', description: 'Beneficios y catálogo' },
  { id: 'support', label: 'Soporte técnico', description: 'Cuenta, app y notificaciones' },
] as const;

type CategoryId = (typeof categories)[number]['id'];

interface FaqEntry {
  id: string;
  category: Exclude<CategoryId, 'all'>;
  question: string;
  answer: ReactNode;
  keywords: string[];
}

const faqs: FaqEntry[] = [
  {
    id: 'program-what-is',
    category: 'program',
    question: '¿Qué es Tarjeta Joven?',
    answer: (
      <>
        <p>
          Tarjeta Joven es el programa del Gobierno del Estado que reúne descuentos y experiencias para personas de 12 a 30 años.
          Regístrate gratis, verifica tu identidad y accede a beneficios en comercios aliados.
        </p>
        <p>
          Conoce la convocatoria oficial en{' '}
          <a href="https://www.jalisco.gob.mx/" target="_blank" rel="noopener noreferrer">
            jalisco.gob.mx
          </a>
          .
        </p>
      </>
    ),
    keywords: ['beneficios', 'programa', 'registro', 'tarjeta joven'],
  },
  {
    id: 'program-requirements',
    category: 'program',
    question: '¿Quiénes pueden obtener la tarjeta?',
    answer: (
      <>
        <p>Pueden solicitarla jóvenes residentes en Jalisco de entre 12 y 30 años con CURP válida.</p>
        <p>
          Durante el registro necesitas una identificación oficial o, si eres menor de edad, una carta responsiva. Puedes consultar la guía completa en{' '}
          <a href="https://tarjetajoven.jalisco.gob.mx" target="_blank" rel="noopener noreferrer">
            tarjetajoven.jalisco.gob.mx
          </a>
          .
        </p>
      </>
    ),
    keywords: ['requisitos', 'edad', 'documentos', 'registro'],
  },
  {
    id: 'program-wallet',
    category: 'program',
    question: '¿Cómo uso mi tarjeta digital y la Wallet?',
    answer: (
      <>
        <p>
          Desde la app agrega beneficios a tu Wallet para generar un código QR dinámico. Al llegar al comercio, abre la Wallet, muestra el QR y el personal lo escaneará para validar la promoción.
        </p>
        <p>También puedes guardar el QR en tu Apple Wallet o Google Wallet si tu dispositivo lo permite.</p>
      </>
    ),
    keywords: ['wallet', 'qr', 'digital', 'guardar beneficios'],
  },
  {
    id: 'discounts-filters',
    category: 'discounts',
    question: '¿Cómo encuentro descuentos cercanos?',
    answer: (
      <>
        <p>
          Utiliza el mapa de comercios para filtrar por categoría y municipio. El botón “Ver en Google Maps” abre la ruta en una pestaña nueva para que navegues sin perder la app.
        </p>
        <p>
          Si prefieres una lista, en el catálogo puedes buscar por nombre, municipio o categoría y guardar los beneficios que más te interesen.
        </p>
      </>
    ),
    keywords: ['mapa', 'catalogo', 'busqueda', 'filtros'],
  },
  {
    id: 'discounts-expiration',
    category: 'discounts',
    question: '¿Los descuentos caducan?',
    answer: (
      <>
        <p>
          Cada beneficio tiene vigencia específica. Revisa la sección “Condiciones” dentro del detalle del comercio y, si el beneficio requiere reservación, comunícate antes de visitarlo.
        </p>
        <p>
          Suscríbete a las notificaciones para recibir alertas cuando haya nuevas campañas cerca de ti.
        </p>
      </>
    ),
    keywords: ['caducidad', 'vigencia', 'condiciones', 'reservacion'],
  },
  {
    id: 'discounts-wallet-limit',
    category: 'discounts',
    question: '¿Cuántos cupones puedo guardar?',
    answer: (
      <>
        <p>No existe un límite fijo, pero algunos comercios restringen el canje a una vez por usuario.</p>
        <p>Cuando un beneficio alcance el límite, la app te avisará y podrás retirar el cupón de tu Wallet.</p>
      </>
    ),
    keywords: ['cupones', 'limite', 'canje'],
  },
  {
    id: 'support-account',
    category: 'support',
    question: 'Olvidé mi contraseña, ¿qué hago?',
    answer: (
      <>
        <p>
          En la pantalla de acceso selecciona “¿Olvidaste tu contraseña?”. Ingresa tu correo y te enviaremos un enlace temporal para restablecerla.
        </p>
        <p>
          Si no recibes el correo en unos minutos revisa la bandeja de spam o contacta al equipo en{' '}
          <a href="mailto:soporte@tarjetajoven.mx" target="_blank" rel="noopener noreferrer">
            soporte@tarjetajoven.mx
          </a>
          .
        </p>
      </>
    ),
    keywords: ['contraseña', 'password', 'recuperar'],
  },
  {
    id: 'support-install',
    category: 'support',
    question: '¿Cómo instalo la app como PWA?',
    answer: (
      <>
        <p>
          En Android presiona el botón “Instalar” cuando aparezca la notificación o abre el menú de tu navegador y elige “Añadir a pantalla principal”.
        </p>
        <p>En iOS abre la opción “Compartir” y selecciona “Agregar a pantalla de inicio”.</p>
      </>
    ),
    keywords: ['instalar', 'pwa', 'android', 'ios'],
  },
  {
    id: 'support-offline',
    category: 'support',
    question: '¿Puedo usar la app sin conexión?',
    answer: (
      <>
        <p>
          Sí. El mapa y el catálogo se guardan cuando los visitas, así puedes consultar tus beneficios aunque no tengas Internet. Algunas acciones como enviar un ticket se encolan y se enviarán al reconectarte.
        </p>
        <p>
          Para optimizar datos, activa la opción “Sólo Wi-Fi” en la sección de Configuración &gt; Notificaciones.
        </p>
      </>
    ),
    keywords: ['offline', 'sin conexion', 'datos', 'pwa'],
  },
];

function normalize(text: string) {
  return text
    .toLocaleLowerCase('es-MX')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export default function Help() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryId>('all');
  const [lastSearch, setLastSearch] = useState<string>('');
  const isOnline = useOnline();

  const filteredFaqs = useMemo(() => {
    const normalizedQuery = normalize(query);
    return faqs.filter((faq) => {
      const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
      if (!matchesCategory) return false;
      if (!normalizedQuery) return true;
      const haystack = [faq.question, ...faq.keywords].map(normalize).join(' ');
      return haystack.includes(normalizedQuery);
    });
  }, [activeCategory, query]);

  const handleCategoryChange = useCallback(
    (next: CategoryId) => {
      if (next === activeCategory) return;
      setActiveCategory(next);
      void track('filter', { source: 'help', category: next });
    },
    [activeCategory],
  );

  const handleSearchSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const normalizedQuery = normalize(query);
      setLastSearch(normalizedQuery);
      void track('search', {
        source: 'help',
        query: normalizedQuery,
        category: activeCategory,
        results: filteredFaqs.length,
      });
    },
    [activeCategory, filteredFaqs.length, query],
  );

  const accordionItems = useMemo(
    () =>
      filteredFaqs.map((faq) => ({
        title: faq.question,
        content: faq.answer,
      })),
    [filteredFaqs],
  );

  return (
    <section className="page" style={{ gap: 32 }}>
      <header style={headerStyles}>
        <div>
          <p style={eyebrowStyles}>Tarjeta Joven</p>
          <h1 style={titleStyles}>
            <FormattedMessage id="help.title" defaultMessage="Centro de ayuda" />
          </h1>
          <p style={subtitleStyles}>
            Encuentra respuestas rápidas, filtra por tema o contáctanos para recibir acompañamiento personalizado.
          </p>
        </div>
      </header>

      {!isOnline ? (
        <div role="status" aria-live="assertive" style={offlineNoticeStyles}>
          Estás sin conexión. Mostramos la última versión guardada del centro de ayuda.
        </div>
      ) : null}

      <form role="search" aria-label="Buscar preguntas frecuentes" onSubmit={handleSearchSubmit} style={searchFormStyles}>
        <label htmlFor="help-search" style={searchLabelStyles}>
          Busca por palabra clave
        </label>
        <div style={searchFieldWrapperStyles}>
          <input
            id="help-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            placeholder="Ej. registro, mapa, instalar…"
            autoComplete="off"
            style={searchInputStyles}
          />
          <button type="submit" className="btn btn-primary" style={searchButtonStyles}>
            Buscar
          </button>
        </div>
        {lastSearch ? (
          <p role="status" aria-live="polite" style={searchSummaryStyles}>
            Resultados para “{lastSearch}”: {filteredFaqs.length}
          </p>
        ) : (
          <p style={searchSummaryStyles}>
            {filteredFaqs.length} {filteredFaqs.length === 1 ? 'resultado' : 'resultados'} disponibles.
          </p>
        )}
      </form>

      <nav aria-label="Filtrar por categoría" style={categoriesWrapperStyles}>
        {categories.map((category) => {
          const isActive = activeCategory === category.id;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => handleCategoryChange(category.id)}
              className="btn btn-outline-secondary"
              aria-pressed={isActive}
              style={{
                ...categoryButtonStyles,
                ...(isActive ? activeCategoryButtonStyles : {}),
              }}
            >
              <span style={{ fontWeight: 600 }}>{category.label}</span>
              <span style={categoryDescriptionStyles}>{category.description}</span>
            </button>
          );
        })}
      </nav>

      {accordionItems.length > 0 ? (
        <Accordion items={accordionItems} />
      ) : (
        <div role="status" style={emptyStateStyles}>
          No encontramos resultados con los filtros actuales. Intenta con otra palabra o categoría.
        </div>
      )}

      <section aria-labelledby="ticket-heading" style={ticketSectionStyles}>
        <h2 id="ticket-heading" className="page__section-title">
          <FormattedMessage id="help.ticket.title" defaultMessage="¿Necesitas más ayuda?" />
        </h2>
        <p style={ticketSubtitleStyles}>
          Escríbenos y el equipo de soporte te responderá en menos de 24 horas hábiles.
        </p>
        <SupportTicketForm />
      </section>
    </section>
  );
}

const headerStyles: React.CSSProperties = {
  display: 'grid',
  gap: 8,
  padding: '16px 0 8px',
};

const eyebrowStyles: React.CSSProperties = {
  margin: 0,
  fontSize: 13,
  fontWeight: 600,
  letterSpacing: 0.6,
  textTransform: 'uppercase',
  color: 'rgba(15, 23, 42, 0.6)',
};

const titleStyles: React.CSSProperties = {
  margin: 0,
  fontSize: 'clamp(1.75rem, 3vw, 2.25rem)',
  fontWeight: 800,
  color: 'color-mix(in srgb, var(--color-green-900) 86%, black 14%)',
};

const subtitleStyles: React.CSSProperties = {
  margin: 0,
  maxWidth: 640,
  fontSize: 16,
  color: 'rgba(15, 23, 42, 0.75)',
};

const offlineNoticeStyles: React.CSSProperties = {
  padding: '12px 16px',
  borderRadius: 12,
  background: 'rgba(234, 179, 8, 0.15)',
  color: 'rgba(202, 138, 4, 0.95)',
  fontWeight: 600,
};

const searchFormStyles: React.CSSProperties = {
  display: 'grid',
  gap: 8,
  alignItems: 'start',
};

const searchLabelStyles: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: 'var(--color-text-muted, #475569)',
};

const searchFieldWrapperStyles: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 12,
};

const searchInputStyles: React.CSSProperties = {
  flex: '1 1 240px',
  minWidth: 240,
  padding: '12px 16px',
  borderRadius: 12,
  border: '1px solid rgba(148, 163, 184, 0.6)',
  fontSize: 15,
  background: 'var(--surface-color, #fff)',
  color: 'var(--color-text, #0f172a)',
};

const searchButtonStyles: React.CSSProperties = {
  alignSelf: 'stretch',
  paddingInline: 20,
};

const searchSummaryStyles: React.CSSProperties = {
  margin: 0,
  fontSize: 14,
  color: 'rgba(15, 23, 42, 0.7)',
};

const categoriesWrapperStyles: React.CSSProperties = {
  display: 'grid',
  gap: 12,
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
};

const categoryButtonStyles: React.CSSProperties = {
  display: 'grid',
  gap: 4,
  justifyItems: 'start',
  padding: '16px',
  borderRadius: 16,
  border: '1px solid rgba(148, 163, 184, 0.6)',
  background: 'var(--surface-color, #fff)',
  color: 'var(--color-text, #0f172a)',
  textAlign: 'left' as const,
};

const activeCategoryButtonStyles: React.CSSProperties = {
  borderColor: 'rgba(34, 197, 94, 0.65)',
  boxShadow: '0 12px 22px rgba(34, 197, 94, 0.2)',
  background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.12), rgba(34, 197, 94, 0.22))',
};

const categoryDescriptionStyles: React.CSSProperties = {
  fontSize: 13,
  color: 'rgba(15, 23, 42, 0.65)',
};

const emptyStateStyles: React.CSSProperties = {
  padding: '24px 16px',
  borderRadius: 16,
  background: 'var(--surface-muted, #f8fafc)',
  textAlign: 'center' as const,
};

const ticketSectionStyles: React.CSSProperties = {
  display: 'grid',
  gap: 12,
};

const ticketSubtitleStyles: React.CSSProperties = {
  margin: 0,
  maxWidth: 520,
  color: 'rgba(15, 23, 42, 0.7)',
};
