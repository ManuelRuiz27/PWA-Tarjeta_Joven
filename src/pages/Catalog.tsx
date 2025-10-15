import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import BenefitCard from '../components/BenefitCard';
import FilterChips, { type FilterChipOption } from '../components/FilterChips';
import MerchantModal from '../components/MerchantModal';
import ErrorState from '@app/components/ErrorState';
import type { CatalogItem } from '@features/catalog/types';
import { useGetCatalogQuery, useLazyGetMerchantQuery } from '@features/catalog/catalogSlice';
import { track } from '@lib/analytics';

const DEFAULT_CATEGORY = 'todos';
const DEFAULT_MUNICIPALITY = 'todos';

function normalizeParam(value: string | null, defaultValue: string) {
  if (!value) return defaultValue;
  return value.toLowerCase() === defaultValue.toLowerCase() ? defaultValue : value;
}

function buildOptions(defaultValue: string, values: Array<string | undefined>): FilterChipOption[] {
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
  return Array.from(entries.values()).map((value) => ({ value, label: formatChipLabel(value) }));
}

function formatChipLabel(value: string) {
  if (value.toLowerCase() === 'todos') return 'Todos';
  return value
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toLocaleUpperCase('es-ES') + part.slice(1))
    .join(' ');
}

export default function CatalogPage() {
  const [params, setParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState(params.get('q') ?? '');
  const [selectedBenefit, setSelectedBenefit] = useState<CatalogItem | null>(null);
  const [fetchMerchant, { data: merchantData, isFetching: isMerchantLoading }] = useLazyGetMerchantQuery();
  const filtersRef = useRef<{ category: string; municipality: string } | null>(null);
  const searchRef = useRef<{ query: string; count: number } | null>(null);

  const categoryParam = params.get('categoria');
  const municipalityParam = params.get('municipio');
  const queryParam = params.get('q');
  const pageParam = params.get('page');

  const currentCategory = normalizeParam(categoryParam, DEFAULT_CATEGORY);
  const currentMunicipality = normalizeParam(municipalityParam, DEFAULT_MUNICIPALITY);
  const currentQuery = queryParam ?? '';
  const currentPage = pageParam ? Math.max(1, Number.parseInt(pageParam, 10) || 1) : 1;

  useEffect(() => {
    setSearchValue(currentQuery);
  }, [currentQuery]);

  const { data, isLoading, isFetching, isError, error, refetch } = useGetCatalogQuery({
    category: currentCategory === DEFAULT_CATEGORY ? undefined : currentCategory,
    municipality: currentMunicipality === DEFAULT_MUNICIPALITY ? undefined : currentMunicipality,
    q: currentQuery || undefined,
    page: currentPage,
  });

  const items = data?.items ?? [];
  const totalPages = Math.max(1, data?.totalPages ?? 1);

  useEffect(() => {
    const nextFilters = { category: currentCategory, municipality: currentMunicipality };
    if (!filtersRef.current) {
      filtersRef.current = nextFilters;
      return;
    }
    const prev = filtersRef.current;
    const changed = prev.category !== nextFilters.category || prev.municipality !== nextFilters.municipality;
    if (changed) {
      filtersRef.current = nextFilters;
      void track('filter', {
        source: 'catalog',
        category: currentCategory,
        municipality: currentMunicipality,
      });
    }
  }, [currentCategory, currentMunicipality]);

  useEffect(() => {
    const normalized = currentQuery.trim();
    const state = searchRef.current;
    if (!state) {
      searchRef.current = { query: normalized, count: items.length };
      return;
    }
    const queryChanged = state.query !== normalized;
    const countChanged = state.count !== items.length;
    if (!queryChanged && !countChanged) return;
    searchRef.current = { query: normalized, count: items.length };
    if (!normalized) {
      return;
    }
    void track('search', {
      source: 'catalog',
      query: normalized,
      results: items.length,
    });
  }, [currentQuery, items.length]);

  const categoryOptions = useMemo<FilterChipOption[]>(() => {
    const fromFilters = data?.filters?.categories ?? [];
    const fromItems = items.map((item) => item.category);
    return buildOptions(DEFAULT_CATEGORY, [...fromFilters, ...fromItems]);
  }, [data?.filters?.categories, items]);

  const municipalityOptions = useMemo<FilterChipOption[]>(() => {
    const fromFilters = data?.filters?.municipalities ?? [];
    const fromItems = items.map((item) => item.municipality);
    return buildOptions(DEFAULT_MUNICIPALITY, [...fromFilters, ...fromItems]);
  }, [data?.filters?.municipalities, items]);

  const updateParams = useCallback(
    (updates: Record<string, string | null | undefined>) => {
      const next = new URLSearchParams(params);
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '') {
          next.delete(key);
        } else {
          next.set(key, value);
        }
      });
      if (!next.get('page')) {
        next.set('page', '1');
      }
      setParams(next, { replace: true });
    },
    [params, setParams]
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchValue(value);
      const trimmed = value.trim();
      updateParams({ q: trimmed === '' ? null : trimmed, page: '1' });
    },
    [updateParams]
  );

  const handleCategoryChange = useCallback(
    (value?: string) => {
      const normalized = !value || value === DEFAULT_CATEGORY ? null : value;
      updateParams({ categoria: normalized, page: '1' });
    },
    [updateParams]
  );

  const handleMunicipalityChange = useCallback(
    (value?: string) => {
      const normalized = !value || value === DEFAULT_MUNICIPALITY ? null : value;
      updateParams({ municipio: normalized, page: '1' });
    },
    [updateParams]
  );

    const handleClearFilters = useCallback(() => {
      setSearchValue('');
      updateParams({ categoria: null, municipio: null, q: null, page: '1' });
      void track('filter', { source: 'catalog', action: 'clear' });
    }, [updateParams]);

  const handlePageChange = useCallback(
    (nextPage: number) => {
      const newPage = Math.min(Math.max(nextPage, 1), totalPages);
      const next = new URLSearchParams(params);
      next.set('page', String(newPage));
      setParams(next, { replace: true });
    },
    [params, setParams, totalPages]
  );

  const onSelectBenefit = useCallback(
    (benefit: CatalogItem) => {
      setSelectedBenefit(benefit);
      if (benefit.merchantId) {
        fetchMerchant(benefit.merchantId);
      }
      void track('open_merchant', {
        source: 'catalog',
        merchantId: benefit.merchantId ?? benefit.id,
        category: benefit.category,
        municipality: benefit.municipality,
      });
    },
    [fetchMerchant]
  );

  const closeModal = useCallback(() => {
    setSelectedBenefit(null);
  }, []);

  const isBusy = isLoading && items.length === 0;
  const isRefetching = isFetching && !isBusy;

  const errorMessage = useMemo(() => {
    if (!error) return 'No pudimos cargar los beneficios en este momento.';
    if ('status' in error) {
      return typeof error.data === 'string' && error.data ? error.data : 'Ocurrió un problema al consultar el catálogo.';
    }
    return error.message ?? 'Ocurrió un problema al consultar el catálogo.';
  }, [error]);

  return (
    <section style={pageStyles} aria-live="polite">
      <header style={headerStyles}>
        <div>
          <p style={eyebrowStyles}>Tarjeta Joven</p>
          <h1 style={titleStyles}>Catálogo de beneficios</h1>
          <p style={subtitleStyles}>Explora descuentos cerca de ti y filtra por categoría, municipio o nombre.</p>
        </div>
      </header>

      <FilterChips
        categories={categoryOptions}
        municipalities={municipalityOptions}
        selectedCategory={currentCategory}
        selectedMunicipality={currentMunicipality}
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        onCategoryChange={handleCategoryChange}
        onMunicipalityChange={handleMunicipalityChange}
        onClear={handleClearFilters}
        isDisabled={isFetching}
      />

      {isError && !isBusy ? (
        <ErrorState message={errorMessage} onReload={refetch} reloadLabel="Reintentar" />
      ) : (
        <>
          <AnimatePresence initial={false}>
            {isBusy ? (
              <motion.div
                key="skeleton"
                style={gridStyles}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                aria-busy="true"
                aria-live="polite"
              >
                {Array.from({ length: 6 }).map((_, index) => (
                  <motion.div
                    key={index}
                    style={skeletonCardStyles}
                    animate={{ opacity: [0.45, 0.9, 0.45] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: index * 0.1 }}
                  />
                ))}
              </motion.div>
            ) : items.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                style={emptyStateStyles}
              >
                <span role="img" aria-hidden style={emptyEmojiStyles}>
                  🎯
                </span>
                <h2 style={emptyTitleStyles}>No se encontraron resultados</h2>
                <p style={emptyDescriptionStyles}>
                  Ajusta los filtros o prueba con otro término de búsqueda para descubrir nuevos beneficios.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key={`grid-${currentPage}`}
                style={gridStyles}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                {items.map((benefit, index) => (
                  <BenefitCard key={benefit.id} benefit={benefit} index={index} onSelect={onSelectBenefit} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div style={paginationStyles} aria-label="Paginación de catálogo">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1 || isFetching}
            >
              Anterior
            </button>
            <span style={paginationLabelStyles}>
              Página {currentPage} de {totalPages}
              {isRefetching && <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity }} style={loadingDotStyles} />}
            </span>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || isFetching}
            >
              Siguiente
            </button>
          </div>
        </>
      )}

      <MerchantModal
        isOpen={Boolean(selectedBenefit)}
        onClose={closeModal}
        baseInfo={selectedBenefit}
        merchant={merchantData ?? undefined}
        isLoading={isMerchantLoading}
      />
    </section>
  );
}

const pageStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 24,
  padding: '12px 0 48px',
};

const headerStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
};

const eyebrowStyles: React.CSSProperties = {
  fontSize: 13,
  textTransform: 'uppercase',
  letterSpacing: 1.2,
  fontWeight: 600,
  color: 'var(--color-text-muted, #475569)',
  margin: 0,
};

const titleStyles: React.CSSProperties = {
  margin: 0,
  fontSize: 28,
  lineHeight: 1.1,
};

const subtitleStyles: React.CSSProperties = {
  margin: 0,
  fontSize: 15,
  color: 'var(--color-text-muted, #475569)',
  maxWidth: 520,
};

const gridStyles: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
  gap: 16,
};

const skeletonCardStyles: React.CSSProperties = {
  background: 'linear-gradient(135deg, rgba(226, 232, 240, 0.7), rgba(203, 213, 225, 0.9))',
  borderRadius: 18,
  minHeight: 200,
};

const paginationStyles: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 16,
  marginTop: 8,
};

const paginationLabelStyles: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
};

const loadingDotStyles: React.CSSProperties = {
  width: 8,
  height: 8,
  background: 'var(--color-accent, #22c55e)',
  borderRadius: '50%',
  display: 'inline-block',
};

const emptyStateStyles: React.CSSProperties = {
  display: 'grid',
  placeItems: 'center',
  textAlign: 'center',
  padding: '48px 16px',
  background: 'rgba(248, 250, 252, 0.8)',
  borderRadius: 24,
  gap: 16,
};

const emptyEmojiStyles: React.CSSProperties = {
  fontSize: 42,
};

const emptyTitleStyles: React.CSSProperties = {
  margin: 0,
  fontSize: 22,
  fontWeight: 700,
};

const emptyDescriptionStyles: React.CSSProperties = {
  margin: 0,
  fontSize: 15,
  maxWidth: 420,
  color: 'var(--color-text-muted, #475569)',
};

