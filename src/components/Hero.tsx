import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

interface HeroProps {
  title: string;
  tagline: string;
  description: string;
  primaryCta: { label: string; to: string };
  secondaryCta: { label: string; to: string };
}

/**
 * Hero institucional con gradiente, logo y botones de acción.
 */
export default function Hero({ title, tagline, description, primaryCta, secondaryCta }: HeroProps) {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__content">
        <div>
          <span className="hero__badge" aria-label="Programa Tarjeta Joven">
            <Sparkles aria-hidden="true" size={18} />
            Nuevo beneficio estatal
          </span>
          <h1 id="hero-title" className="hero__title">{title}</h1>
          <p className="hero__tagline">{tagline}</p>
          <p style={{ margin: 'var(--space-3) 0', maxWidth: 520 }}>{description}</p>
          <div className="hero__cta" role="group" aria-label="Acciones principales">
            <Link className="btn btn-primary" to={primaryCta.to}>
              {primaryCta.label}
            </Link>
            <Link className="btn btn-outline" to={secondaryCta.to}>
              {secondaryCta.label}
            </Link>
          </div>
        </div>
        <img
          src="/icons/icon-192.png"
          alt="Escudo institucional"
          className="hero__image"
        />
      </div>
    </section>
  );
}
