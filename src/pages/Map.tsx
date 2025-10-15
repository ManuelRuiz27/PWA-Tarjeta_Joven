import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import MapCard from '@components/MapCard';
import ErrorState from '@app/components/ErrorState';
import type { CatalogItem } from '@features/catalog/types';
import { useGetCatalogQuery, type CatalogQueryParams } from '@features/catalog/catalogSlice';
import { track } from '@lib/analytics';

const DEFAULT_CATEGORY = 'todos';
const DEFAULT_MUNICIPALITY = 'todos';

/**
 * Normalizes a URL parameter to fall back to a default value when empty.
 */
function normalizeParam(value: string | null, defaultValue: string) {
  if (!value) return defaultValue;
  return value.toLowerCase() === defaultValue.toLowerCase() ? defaultValue : value;
}

/**
 * Builds a deduplicated list of option values including the provided default option.
 */
function buildOptions(defaultValue: string, values: Array<string | undefined>) {
  const entries = new Map<string, string>();
  entries.set(defaultValue.toLowerCase(), defaultValue);
  values.forEach((value) => {
    const normalized = (value ?? '').trim();
    if (!normalized) return;
    const key = normalized.toLowerCase();
    if (!entries.has(key)) {
      entries.set(key, normalized);
    }
  });
  return Array.from(entries.values());
}

/**
 * Formats an option label by capitalizing each word.
 */
function formatLabel(value: string) {
  if (value.toLowerCase() === 'todos') return 'Todos';
  return value
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toLocaleUpperCase('es-ES') + part.slice(1))
    .join(' ');
}

/**
 * Tracks whether the current viewport matches a media query.
 */
function useMediaQuery(query: string) {
  const getMatches = useCallback(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  }, [query]);

  const [matches, setMatches] = useState<boolean>(getMatches);

  useEffect(() => {
    const mediaQueryList = typeof window !== 'undefined' ? window.matchMedia(query) : null;
    if (!mediaQueryList) return undefined;

    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQueryList.addEventListener('change', listener);
    setMatches(mediaQueryList.matches);

    return () => {
      mediaQueryList.removeEventListener('change', listener);
    };
  }, [query]);

  return matches;
}

/**
 * Business map page that embeds Google MyMaps and allows filtering by catalog data.
 */
export default function MapPage() {
  const [params, setParams] = useSearchParams();
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const hasTrackedOpen = useRef(false);
  const previousFilters = useRef<{ category: string; municipality: string } | null>(null);
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));
  const isWideLayout = useMediaQuery('(min-width: 768px)');

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    function handleOnline() {
      setIsOnline(true);
    }

    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const categoryParam = params.get('categoria');
  const municipalityParam = params.get('municipio');

  const currentCategory = normalizeParam(categoryParam, DEFAULT_CATEGORY);
  const currentMunicipality = normalizeParam(municipalityParam, DEFAULT_MUNICIPALITY);

  const catalogQueryArgs: CatalogQueryParams = {
    page: 1,
    ...(currentCategory === DEFAULT_CATEGORY ? {} : { category: currentCategory }),
    ...(currentMunicipality === DEFAULT_MUNICIPALITY ? {} : { municipality: currentMunicipality }),
  };

  const { data, isLoading, isFetching, isError, error, refetch } = useGetCatalogQuery(catalogQueryArgs);

  const items = useMemo(() => data?.items ?? [], [data]);

  useEffect(() => {
    if (hasTrackedOpen.current) return;
    hasTrackedOpen.current = true;
    void track('open_map', {
      category: currentCategory,
      municipality: currentMunicipality,
    });
  }, [currentCategory, currentMunicipality]);

  useEffect(() => {
    const nextFilters = { category: currentCategory, municipality: currentMunicipality };
    if (!previousFilters.current) {
      previousFilters.current = nextFilters;
      return;
    }
    const prev = previousFilters.current;
    const changed = prev.category !== nextFilters.category || prev.municipality !== nextFilters.municipality;
    if (changed) {
      previousFilters.current = nextFilters;
      void track('filter', {
        source: 'map',
        category: currentCategory,
        municipality: currentMunicipality,
      });
    }
  }, [currentCategory, currentMunicipality]);

  useEffect(() => {
    if (selectedItem && items.some((item) => item.id === selectedItem.id)) {
      return;
    }
    if (items.length === 0) {
      setSelectedItem(null);
      return;
    }
    const [firstItem] = items;
    if (firstItem) {
      setSelectedItem(firstItem);
    }
  }, [items, selectedItem]);

  const categoryOptions = useMemo(() => {
    const fromFilters = data?.filters?.categories ?? [];
    const fromItems = items.map((item) => item.category);
    return buildOptions(DEFAULT_CATEGORY, [...fromFilters, ...fromItems]);
  }, [data?.filters?.categories, items]);

  const municipalityOptions = useMemo(() => {
    const fromFilters = data?.filters?.municipalities ?? [];
    const fromItems = items.map((item) => item.municipality);
    return buildOptions(DEFAULT_MUNICIPALITY, [...fromFilters, ...fromItems]);
  }, [data?.filters?.municipalities, items]);

  const updateParams = useCallback(
    (updates: Record<string, string | null | undefined>) => {
      const next = new URLSearchParams(params);
      Object.entries(updates).forEach(([key, value]) => {
        if (!value) {
          next.delete(key);
        } else {
          next.set(key, value);
        }
      });
      setParams(next, { replace: true });
    },
    [params, setParams]
  );

  const handleCategoryChange = useCallback(
    (value: string) => {
      const normalized = !value || value === DEFAULT_CATEGORY ? null : value;
      updateParams({ categoria: normalized });
    },
    [updateParams]
  );

  const handleMunicipalityChange = useCallback(
    (value: string) => {
      const normalized = !value || value === DEFAULT_MUNICIPALITY ? null : value;
      updateParams({ municipio: normalized });
    },
    [updateParams]
  );

  const handleClearFilters = useCallback(() => {
    updateParams({ categoria: null, municipio: null });
    void track('filter', { source: 'map', action: 'clear' });
  }, [updateParams]);

  const handleSelectItem = useCallback(
    (item: CatalogItem) => {
      setSelectedItem(item);
      void track('open_merchant', {
        source: 'map',
        merchantId: item.merchantId ?? item.id,
        category: item.category,
        municipality: item.municipality,
      });
    },
    []
  );

  const defaultMyMapsUrl =
    'https://www.google.com/maps/d/u/0/embed?mid=1Am2-NMQ95WxJDxw7DmngYmkJw-h1GX4&ehbc=2E312F&noprof=1';
  const mapBaseUrl = (import.meta.env['VITE_MAPS_URL'] as string | undefined) ?? defaultMyMapsUrl;

  const mapUrl = useMemo(() => {
    if (!mapBaseUrl) return undefined;
    if (!selectedItem) return mapBaseUrl;

    try {
      const url = new URL(mapBaseUrl);
      url.searchParams.set('q', selectedItem.name);
      return url.toString();
    } catch (err) {
      const separator = mapBaseUrl.includes('?') ? '&' : '?';
      return `${mapBaseUrl}${separator}q=${encodeURIComponent(selectedItem.name)}`;
    }
  }, [mapBaseUrl, selectedItem]);

  const isBusy = isLoading && items.length === 0;

  const errorMessage = useMemo(() => {
    if (!error) return 'No pudimos cargar los comercios en este momento.';
    if ('status' in error) {
      return typeof error.data === 'string' && error.data ? error.data : 'Ocurrió un problema al consultar el catálogo.';
    }
    return error.message ?? 'Ocurrió un problema al consultar el catálogo.';
  }, [error]);

  const layoutStyles: React.CSSProperties = {
    display: 'grid',
    gap: 24,
    gridTemplateColumns: isWideLayout && items.length > 0 ? 'minmax(0, 2fr) minmax(0, 1fr)' : 'minmax(0, 1fr)',
    alignItems: 'start',
  };

  const mapWrapperStyles: React.CSSProperties = {
    position: 'relative',
    background: 'var(--surface-muted, #f1f5f9)',
    borderRadius: 20,
    overflow: 'hidden',
    minHeight: isWideLayout ? 520 : 360,
    boxShadow: '0 20px 45px rgba(15, 23, 42, 0.12)',
  };

  return (
    <section className="page" style={{ gap: 24 }} aria-live="polite">
      <header style={headerStyles}>
        <div>
          <p style={eyebrowStyles}>Tarjeta Joven</p>
          <h1 style={titleStyles}>Mapa de comercios aliados</h1>
          <p style={subtitleStyles}>
            Explora el mapa interactivo y filtra por categoría o municipio para encontrar el beneficio ideal.
          </p>
        </div>
      </header>

      <section aria-label="Filtros del mapa" style={filtersStyles}>
        <div style={filterGroupStyles}>
          <label htmlFor="map-category" style={filterLabelStyles}>
            Categoría
          </label>
          <select
            id="map-category"
            name="categoria"
            value={currentCategory}
            onChange={(event) => handleCategoryChange(event.currentTarget.value)}
            disabled={isFetching}
            style={selectStyles}
          >
            {categoryOptions.map((option) => (
              <option key={option} value={option}>
                {formatLabel(option)}
              </option>
            ))}
          </select>
        </div>

        <div style={filterGroupStyles}>
          <label htmlFor="map-municipality" style={filterLabelStyles}>
            Municipio
          </label>
          <select
            id="map-municipality"
            name="municipio"
            value={currentMunicipality}
            onChange={(event) => handleMunicipalityChange(event.currentTarget.value)}
            disabled={isFetching}
            style={selectStyles}
          >
            {municipalityOptions.map((option) => (
              <option key={option} value={option}>
                {formatLabel(option)}
              </option>
            ))}
          </select>
        </div>

        <button type="button" onClick={handleClearFilters} disabled={isFetching} className="btn btn-secondary">
          Limpiar filtros
        </button>
      </section>

      {isError && !isBusy ? (
        <ErrorState message={errorMessage} onReload={refetch} reloadLabel="Reintentar" />
      ) : (
        <div style={layoutStyles}>
          <div style={mapWrapperStyles} aria-live="polite">
            {!isOnline ? (
              <div style={offlineStyles} role="status" aria-live="assertive">
                Mapa no disponible sin conexión
              </div>
            ) : mapUrl ? (
              <iframe
                key={mapUrl}
                title="Mapa de comercios"
                src={mapUrl}
                loading="lazy"
                allowFullScreen
                style={iframeStyles}
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <div style={offlineStyles} role="status">
                No fue posible cargar el mapa en este momento.
              </div>
            )}
          </div>

          {isBusy ? (
            <div style={listSkeletonStyles} role="status" aria-live="polite">
              Cargando comercios…
            </div>
          ) : items.length > 0 ? (
            <div style={listStyles} role="list" aria-label="Resultados filtrados">
              {items.map((item) => (
                <MapCard
                  key={item.id}
                  item={item}
                  onSelect={handleSelectItem}
                  isActive={selectedItem?.id === item.id}
                />
              ))}
            </div>
          ) : (
            <div style={emptyStateStyles} role="status">
              No encontramos comercios con los filtros seleccionados.
            </div>
          )}
        </div>
      )}
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
  fontSize: 'clamp(1.75rem, 3vw, 2.2rem)',
  fontWeight: 800,
  color: 'color-mix(in srgb, var(--color-green-900) 86%, black 14%)',
};

const subtitleStyles: React.CSSProperties = {
  margin: 0,
  maxWidth: 620,
  fontSize: 16,
  color: 'rgba(15, 23, 42, 0.75)',
};

const filtersStyles: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 16,
  alignItems: 'flex-end',
};

const filterGroupStyles: React.CSSProperties = {
  display: 'grid',
  gap: 8,
  minWidth: 180,
};

const filterLabelStyles: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: 'rgba(15, 23, 42, 0.75)',
};

const selectStyles: React.CSSProperties = {
  appearance: 'none',
  padding: '12px 16px',
  borderRadius: 12,
  border: '1px solid rgba(148, 163, 184, 0.6)',
  background: 'var(--surface-color, #fff)',
  color: 'var(--color-text, #0f172a)',
  fontSize: 15,
  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.06)',
};

const iframeStyles: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  border: 0,
};

const listStyles: React.CSSProperties = {
  display: 'grid',
  gap: 16,
  maxHeight: 520,
  overflowY: 'auto',
  paddingRight: 8,
};

const listSkeletonStyles: React.CSSProperties = {
  alignSelf: 'stretch',
  display: 'grid',
  placeItems: 'center',
  minHeight: 160,
  borderRadius: 16,
  background: 'rgba(15, 23, 42, 0.04)',
  color: 'rgba(15, 23, 42, 0.65)',
  fontWeight: 600,
};

const emptyStateStyles: React.CSSProperties = {
  alignSelf: 'stretch',
  display: 'grid',
  placeItems: 'center',
  minHeight: 160,
  borderRadius: 16,
  background: 'rgba(15, 23, 42, 0.04)',
  color: 'rgba(15, 23, 42, 0.65)',
  textAlign: 'center',
  padding: 16,
};

const offlineStyles: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  padding: 24,
  fontWeight: 600,
  color: 'rgba(15, 23, 42, 0.75)',
  textAlign: 'center',
  background: 'linear-gradient(135deg, rgba(226, 232, 240, 0.7), rgba(148, 163, 184, 0.4))',
};
