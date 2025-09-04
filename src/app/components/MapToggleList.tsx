import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export interface MapToggleListProps<T = any> {
  items?: T[];
  /** Render de la lista (usa los filtros actuales) */
  renderList: () => React.ReactNode;
  /** Render del mapa; si no se pasa, se usa un stub accesible */
  renderMap?: (items: T[]) => React.ReactNode;
  /** Etiquetas accesibles */
  ariaLabel?: string;
}

/**
 * Componente que alterna entre vista Lista/Mapa conservando filtros en el querystring (`view=list|map`).
 * Accesible (tablist/aria-selected) y responsive. El mapa es un stub si no se provee `renderMap`.
 */
export default function MapToggleList<T>({ items = [], renderList, renderMap, ariaLabel = 'Alternar vista' }: MapToggleListProps<T>) {
  const [params, setParams] = useSearchParams();
  const view = (params.get('view') as 'list' | 'map') || 'list';

  function setView(next: 'list' | 'map') {
    const nextParams = new URLSearchParams(params);
    nextParams.set('view', next);
    setParams(nextParams);
  }

  const content = useMemo(() => {
    if (view === 'map') {
      if (renderMap) return renderMap(items);
      // Stub accesible del mapa
      return (
        <div role="region" aria-label="Mapa de resultados" style={{ border: '1px solid var(--color-border)', borderRadius: 8, height: 360, background: '#f8f9fa' }} className="d-flex align-items-center justify-content-center">
          <div className="text-muted">Mapa (stub). Marcadores: {items.length}</div>
        </div>
      );
    }
    return renderList();
  }, [view, items, renderList, renderMap]);

  return (
    <section>
      <div role="tablist" aria-label={ariaLabel} className="d-flex gap-2 mb-2">
        <button
          type="button"
          role="tab"
          aria-selected={view === 'list'}
          className={`btn btn-sm ${view === 'list' ? 'btn-success' : 'btn-outline-secondary'}`}
          onClick={() => setView('list')}
        >
          Lista
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={view === 'map'}
          className={`btn btn-sm ${view === 'map' ? 'btn-success' : 'btn-outline-secondary'}`}
          onClick={() => setView('map')}
        >
          Mapa
        </button>
      </div>
      {content}
    </section>
  );
}

