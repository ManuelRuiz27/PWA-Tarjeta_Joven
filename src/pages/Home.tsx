import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { fetchCatalog } from '@features/catalog/catalog.api';
import type { Benefit, CatalogResponse } from '@features/catalog/types';
import CardBenefit from '@features/catalog/components/CardBenefit';
import SkeletonCard from '@features/catalog/components/SkeletonCard';
import EmptyState from '@app/components/EmptyState';
import ErrorState from '@app/components/ErrorState';
import { saveToWallet } from '@features/wallet/wallet.api';

const CATEGORIES = ['todos', 'comida', 'entretenimiento', 'salud', 'transporte'];

export default function Home() {
  const intl = useIntl();
  const [category, setCategory] = useState('todos');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<CatalogResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetchCatalog({ category: category === 'todos' ? undefined : category, page });
        if (!cancelled) setData(res);
      } catch (e: any) {
        if (!cancelled) setError(e.message || 'Error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [category, page]);

  const items: Benefit[] = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  const content = useMemo(() => {
    if (loading) {
      return (
        <div style={gridStyles}>
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      );
    }
    if (error) return <ErrorState message={error || intl.formatMessage({ id: 'home.error' })} />;
    if (!items.length) return <EmptyState message={intl.formatMessage({ id: 'home.empty' })} />;
    return (
      <div style={gridStyles}>
        {items.map((it) => (
          <CardBenefit key={it.id} item={it} onSave={async (id) => {
            try { await saveToWallet({ couponId: id }); } catch {}
          }} />
        ))}
      </div>
    );
  }, [loading, error, items]);

  return (
    <section>
      <h1><FormattedMessage id="home.title" defaultMessage="Beneficios" /></h1>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        <label>
          <FormattedMessage id="home.category" defaultMessage="Categoría" />{' '}
          <select value={category} onChange={(e) => { setPage(1); setCategory(e.target.value); }} aria-label="Seleccionar categoría">
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
      </div>

      {content}

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 16 }}>
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
          <FormattedMessage id="home.prev" defaultMessage="Anterior" />
        </button>
        <span>
          <FormattedMessage id="home.page" defaultMessage="Página {page} de {total}" values={{ page, total: totalPages }} />
        </span>
        <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
          <FormattedMessage id="home.next" defaultMessage="Siguiente" />
        </button>
      </div>
    </section>
  );
}

const gridStyles: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
  gap: 12,
};
