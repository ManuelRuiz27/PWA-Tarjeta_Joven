import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchCatalog } from '@features/catalog/catalog.api';
import type { Benefit, CatalogResponse } from '@features/catalog/types';
import CardBenefit from '@features/catalog/components/CardBenefit';
import SkeletonList from '@app/components/SkeletonList';
import EmptyState from '@app/components/EmptyState';
import ErrorState from '@app/components/ErrorState';
import { saveToWallet } from '@features/wallet/wallet.api';
import MapToggleList from '@app/components/MapToggleList';

const CATEGORIES = ['todos', 'comida', 'entretenimiento', 'salud', 'transporte'];

export default function CatalogPage() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState<CatalogResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchRef = useRef<HTMLInputElement | null>(null);

  const q = params.get('q') ?? '';
  const category = params.get('category') ?? 'todos';
  const page = Number(params.get('page') ?? '1');

  // Accesos directos de teclado: '/' enfoca búsqueda, Alt+←/→ paginación
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === '/' && !(e.target as HTMLElement)?.matches('input,textarea')) {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        if (page > 1) setParams({ q, category, page: String(page - 1) });
      }
      if (e.altKey && e.key === 'ArrowRight') {
        e.preventDefault();
        setParams({ q, category, page: String(page + 1) });
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [q, category, page, setParams]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetchCatalog({ category: category === 'todos' ? undefined : category, page, near: undefined });
        if (!cancelled) setData(res);
      } catch (e: any) {
        if (!cancelled) setError(e.message || 'Error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [category, page]);

  const items: Benefit[] = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  const grid = useMemo(() => {
    if (loading) return <SkeletonList count={6} />;
    if (error) return <ErrorState message={error} onReload={() => setParams({ q, category, page: String(page) })} reloadLabel="Reintentar" />;
    if (!items.length) return <EmptyState title="Sin resultados" message="No hay beneficios que coincidan con tu búsqueda." helpHref="/help" helpLabel="Ayuda" />;
    return (
      <div style={gridStyles}>
        {items.map((it) => (
          <CardBenefit key={it.id} item={it as any} onSave={async (id) => { try { await saveToWallet({ couponId: id }); } catch {} }} />
        ))}
      </div>
    );
  }, [loading, error, items, category, page, q, setParams]);

  function setCategory(next: string) {
    setParams({ q, category: next, page: '1' });
  }
  function setQuery(next: string) {
    setParams({ q: next, category, page: '1' });
  }

  return (
    <section>
      <h1>Catálogo</h1>
      <div className="d-flex flex-wrap gap-2 align-items-center mb-2">
        <label className="me-2" htmlFor="catalog-search">Búsqueda</label>
        <input
          ref={searchRef}
          id="catalog-search"
          type="search"
          className="form-control"
          placeholder="Buscar beneficios... (atajo '/')"
          style={{ maxWidth: 360 }}
          value={q}
          onChange={(e) => setQuery(e.currentTarget.value)}
          aria-label="Buscar en catálogo"
        />
      </div>

      <div role="tablist" aria-label="Categorías" className="d-flex flex-wrap gap-2 mb-3">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            role="tab"
            aria-selected={category === c}
            aria-pressed={category === c}
            className={`btn btn-sm ${category === c ? 'btn-success' : 'btn-outline-secondary'}`}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <MapToggleList
        items={items}
        renderList={() => grid}
        renderMap={(arr) => (
          <div role="region" aria-label="Mapa de catálogo" style={{ height: 360, border: '1px solid var(--color-border)', borderRadius: 8 }} className="d-flex align-items-center justify-content-center">
            <span className="text-muted">Mapa (stub) con {arr.length} marcador(es)</span>
          </div>
        )}
        ariaLabel="Alternar vista de catálogo"
      />

      <div className="d-flex align-items-center gap-2 mt-3" aria-label="Paginación">
        <button className="btn btn-outline-secondary" onClick={() => setParams({ q, category, page: String(Math.max(1, page - 1)) })} disabled={page <= 1} aria-label="Página anterior (Alt + Flecha izquierda)">
          Anterior
        </button>
        <span> Página {page} de {totalPages} </span>
        <button className="btn btn-outline-secondary" onClick={() => setParams({ q, category, page: String(Math.min(totalPages, page + 1)) })} disabled={page >= totalPages} aria-label="Página siguiente (Alt + Flecha derecha)">
          Siguiente
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
