import Hero from '@components/Hero';
import { CalendarHeart, CheckCircle2, ShieldCheck, SmartphoneNfc } from 'lucide-react';
import { Link } from 'react-router-dom';

const highlights = [
  {
    icon: <ShieldCheck aria-hidden="true" size={28} />,
    title: 'Descuentos exclusivos',
    text: 'Accede a comercios aliados con promociones especiales para jóvenes sin costo de inscripción.',
  },
  {
    icon: <CalendarHeart aria-hidden="true" size={28} />,
    title: 'Eventos y experiencias',
    text: 'Recibe invitaciones prioritarias a festivales, cursos y actividades culturales del estado.',
  },
  {
    icon: <SmartphoneNfc aria-hidden="true" size={28} />,
    title: 'Wallet digital',
    text: 'Muy pronto podrás guardar tu Tarjeta Joven en tu celular y presentarla desde cualquier lugar.',
  },
];

const steps = [
  {
    title: 'Registra tus datos oficiales',
    description: 'Te pediremos tu CURP y comprobantes para validar identidad y domicilio.',
  },
  {
    title: 'Verifica tu identidad',
    description: 'Confirma tu cuenta con un código OTP enviado a tu medio de contacto.',
  },
  {
    title: 'Activa beneficios',
    description: 'Explora comercios, guarda cupones y recibe notificaciones en tiempo real.',
  },
];

export default function Main() {
  return (
    <div className="page" data-testid="main-page">
      <Hero
        title="Tarjeta Joven"
        tagline="Un programa hecho para impulsar tus oportunidades"
        description="Centralizamos tus beneficios, descuentos y acompañamiento para que construyas un futuro con más posibilidades."
        primaryCta={{ label: 'Registrarme', to: '/register' }}
        secondaryCta={{ label: 'Iniciar sesión', to: '/login' }}
      />

      <section aria-labelledby="beneficios" className="grid-auto grid-auto--cols-3">
        <h2 id="beneficios" className="page__section-title">
          ¿Por qué unirte hoy?
        </h2>
        {highlights.map((item) => (
          <article key={item.title} className="info-card" aria-label={item.title}>
            <span style={{ color: 'var(--color-primary)' }}>{item.icon}</span>
            <h3 className="info-card__title">{item.title}</h3>
            <p className="info-card__text">{item.text}</p>
          </article>
        ))}
      </section>

      <section className="surface surface--muted" aria-labelledby="pasos">
        <div className="surface" style={{ marginBottom: 'var(--space-4)' }}>
          <h2 id="pasos" className="page__section-title" style={{ marginBottom: 'var(--space-2)' }}>
            Registro acompañado de inicio a fin
          </h2>
          <p style={{ margin: 0, maxWidth: 560 }}>
            El proceso es 100% digital y accesible. Guarda tus avances y vuelve cuando quieras; nosotros te guiaremos paso a paso.
          </p>
        </div>
        <div className="steps" role="list">
          {steps.map((step) => (
            <article key={step.title} className="step-item" role="listitem">
              <div>
                <h3 className="step-item__title">{step.title}</h3>
                <p className="step-item__desc">{step.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="surface" aria-labelledby="convocatoria">
        <h2 id="convocatoria" className="page__section-title">
          Documentos requeridos
        </h2>
        <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'grid', gap: 'var(--space-2)' }}>
          <li>CURP vigente en formato PDF o imagen.</li>
          <li>Identificación oficial (INE) del titular.</li>
          <li>Comprobante de domicilio reciente (≤ 3 meses).</li>
        </ul>
        <p className="status-text" style={{ marginTop: 'var(--space-3)' }}>
          ¿Tienes dudas? Consulta la <Link to="/help">sección de ayuda</Link> o escríbenos desde la app.
        </p>
      </section>

      <section className="surface" aria-labelledby="cta-final">
        <h2 id="cta-final" className="page__section-title">
          ¿Listo para empezar?
        </h2>
        <p style={{ margin: 0, maxWidth: 520 }}>
          Crear tu cuenta te tomará menos de cinco minutos y podrás activar beneficios inmediatamente después de validar tu información.
        </p>
        <div className="hero__cta" style={{ marginTop: 'var(--space-3)' }}>
          <Link className="btn btn-primary" to="/register">
            Registrarme
          </Link>
          <Link className="btn btn-secondary" to="/login">
            Ya tengo cuenta
          </Link>
          <span className="status-text" aria-live="polite">
            <CheckCircle2 aria-hidden="true" size={16} style={{ marginRight: 6 }} />
            Registro sin costo
          </span>
        </div>
      </section>
    </div>
  );
}
