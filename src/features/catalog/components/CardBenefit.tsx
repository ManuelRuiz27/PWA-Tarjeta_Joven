import type { Benefit } from '@features/catalog/types';
import { useMemo, useState } from 'react';

export interface CardBenefitProps {
  /** Benefit con campo opcional `valid_until` para compatibilidad */
  item: Benefit & { valid_until?: string };
  /** Handler para guardar en la Wallet. Puede ser async. */
  onSave?: (id: string) => Promise<void> | void;
  /** Muestra estado de carga (skeleton) */
  loading?: boolean;
  /** Marca como agotado (deshabilita CTA) */
  soldOut?: boolean;
}

/**
 * Tarjeta de beneficio con imagen, título, términos, vigencia y CTA "Guardar en Wallet".
 * Estados: loading (skeleton), expirado/agotado, error al guardar.
 */
export default function CardBenefit({ item, onSave, loading = false, soldOut = false }: CardBenefitProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const summary = useMemo(() => summarize(item.terms, 140), [item.terms]);
  const validUntilIso = item.validUntil ?? item.valid_until ?? '';
  const until = useMemo(() => new Date(validUntilIso), [validUntilIso]);
  const hasDate = Boolean(validUntilIso) && !isNaN(until.getTime());
  const expired = hasDate ? until.getTime() < Date.now() : false;
  const untilFmt = hasDate ? until.toLocaleDateString() : '—';

  if (loading) return <CardBenefitSkeleton />;

  async function handleSave() {
    if (!onSave) return;
    try {
      setError(null);
      setSaving(true);
      await onSave(item.id);
    } catch (e: any) {
      setError(e?.message || 'No se pudo guardar. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <article className="card h-100" aria-label={item.title} role="article">
      <div className="position-relative">
        <img
          src={item.imageUrl}
          className="card-img-top"
          alt={`Imagen de ${item.title}`}
          loading="lazy"
          height={160}
          style={{ objectFit: 'cover' }}
        />
        {(expired || soldOut) && (
          <span className="badge text-bg-light position-absolute" style={{ right: 8, top: 8 }}>
            {soldOut ? 'Agotado' : 'Expirado'}
          </span>
        )}
      </div>
      <div className="card-body d-grid gap-2">
        <h3 className="card-title h6 m-0">{item.title}</h3>
        <p className="card-text text-muted" title={item.terms}>{summary}</p>
        <small className="text-muted">Vigente hasta: {untilFmt}</small>
        {error && (
          <div role="alert" className="text-danger">{error}</div>
        )}
        <div className="mt-1">
          <button
            type="button"
            className="btn btn-sm btn-outline-success"
            style={{ borderColor: '#588f41', color: '#588f41' }}
            onClick={handleSave}
            disabled={saving || expired || soldOut}
            aria-disabled={saving || expired || soldOut}
            aria-label={`Guardar ${item.title} en Wallet`}
          >
            {saving ? 'Guardando…' : 'Guardar en Wallet'}
          </button>
        </div>
      </div>
    </article>
  );
}

function summarize(text: string, max: number) {
  const t = (text || '').trim();
  if (t.length <= max) return t;
  return t.slice(0, max - 1) + '…';
}

function CardBenefitSkeleton() {
  return (
    <div className="card h-100" aria-busy="true" aria-live="polite">
      <div style={{ width: '100%', height: 160, background: '#eee' }} />
      <div className="card-body">
        <div style={{ height: 16, background: '#eee', width: '70%', marginBottom: 8 }} />
        <div style={{ height: 12, background: '#eee', width: '100%', marginBottom: 6 }} />
        <div style={{ height: 12, background: '#eee', width: '80%', marginBottom: 8 }} />
        <div style={{ height: 28, background: '#eee', width: 140, borderRadius: 6 }} />
      </div>
    </div>
  );
}
