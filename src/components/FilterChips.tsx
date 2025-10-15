import { ChangeEvent } from 'react';
import { motion, type MotionStyle } from 'framer-motion';
import { XCircle } from 'lucide-react';

export interface FilterChipOption {
  value: string;
  label: string;
}

export interface FilterChipsProps {
  categories: FilterChipOption[];
  municipalities: FilterChipOption[];
  selectedCategory?: string;
  selectedMunicipality?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value?: string) => void;
  onMunicipalityChange: (value?: string) => void;
  onClear: () => void;
  isDisabled?: boolean;
}

const chipTransition = { type: 'spring', stiffness: 260, damping: 22 };

export default function FilterChips({
  categories,
  municipalities,
  selectedCategory,
  selectedMunicipality,
  searchValue,
  onSearchChange,
  onCategoryChange,
  onMunicipalityChange,
  onClear,
  isDisabled,
}: FilterChipsProps) {
  function handleSearch(event: ChangeEvent<HTMLInputElement>) {
    onSearchChange(event.currentTarget.value);
  }

  return (
    <section style={containerStyles} aria-label="Filtros del catálogo">
      <label htmlFor="catalog-search" style={labelStyles}>
        Busca por nombre
      </label>
      <input
        id="catalog-search"
        type="search"
        value={searchValue}
        onChange={handleSearch}
        placeholder="Ej. Cafetería, gimnasio, cine…"
        autoComplete="off"
        aria-label="Buscar beneficio por nombre"
        disabled={isDisabled}
        style={searchStyles}
      />

      <div style={chipsWrapperStyles}>
        <p style={chipsLabelStyles}>Categorías</p>
        <div style={chipsRowStyles} role="list" aria-label="Filtrar por categoría">
          {categories.map((category) => {
            const isActive = category.value === selectedCategory;
            return (
              <motion.button
                key={category.value || 'all-category'}
                type="button"
                role="listitem"
                aria-pressed={isActive}
                whileTap={{ scale: 0.95 }}
                transition={chipTransition}
                onClick={() => onCategoryChange(isActive ? undefined : category.value)}
                style={{
                  ...chipBaseStyles,
                  ...(isActive ? chipActiveStyles : {}),
                }}
                disabled={isDisabled}
              >
                {category.label}
              </motion.button>
            );
          })}
        </div>
      </div>

      <div style={chipsWrapperStyles}>
        <p style={chipsLabelStyles}>Municipios</p>
        <div style={chipsRowStyles} role="list" aria-label="Filtrar por municipio">
          {municipalities.map((municipality) => {
            const isActive = municipality.value === selectedMunicipality;
            return (
              <motion.button
                key={municipality.value || 'all-municipality'}
                type="button"
                role="listitem"
                aria-pressed={isActive}
                whileTap={{ scale: 0.95 }}
                transition={chipTransition}
                onClick={() => onMunicipalityChange(isActive ? undefined : municipality.value)}
                style={{
                  ...chipBaseStyles,
                  ...(isActive ? chipActiveStyles : {}),
                }}
                disabled={isDisabled}
              >
                {municipality.label}
              </motion.button>
            );
          })}
        </div>
      </div>

      <button type="button" onClick={onClear} style={clearButtonStyles} disabled={isDisabled}>
        <XCircle size={18} aria-hidden />
        Limpiar filtros
      </button>
    </section>
  );
}

const containerStyles: React.CSSProperties = {
  display: 'grid',
  gap: 16,
  padding: '16px 0',
};

const labelStyles: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: 'var(--color-text-muted, #475569)',
};

const searchStyles: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  borderRadius: 999,
  border: '1px solid rgba(148, 163, 184, 0.6)',
  fontSize: 15,
  background: 'var(--color-surface, #fff)',
  color: 'var(--color-text, #0f172a)',
  outline: 'none',
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04) inset',
};

const chipsWrapperStyles: React.CSSProperties = {
  display: 'grid',
  gap: 8,
};

const chipsLabelStyles: React.CSSProperties = {
  margin: 0,
  fontWeight: 600,
  fontSize: 14,
  color: 'var(--color-text, #0f172a)',
};

const chipsRowStyles: React.CSSProperties = {
  display: 'flex',
  gap: 8,
  overflowX: 'auto',
  paddingBottom: 4,
};

const chipBaseStyles: MotionStyle = {
  border: '1px solid rgba(100, 116, 139, 0.35)',
  padding: '8px 14px',
  borderRadius: 999,
  background: 'rgba(248, 250, 252, 0.8)',
  color: 'var(--color-text, #0f172a)',
  fontSize: 13,
  fontWeight: 500,
  whiteSpace: 'nowrap',
  cursor: 'pointer',
};

const chipActiveStyles: MotionStyle = {
  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
  color: '#fff',
  borderColor: 'transparent',
  boxShadow: '0 8px 16px rgba(34, 197, 94, 0.3)',
};

const clearButtonStyles: React.CSSProperties = {
  justifySelf: 'start',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  border: 'none',
  background: 'transparent',
  color: 'var(--color-accent, #0f172a)',
  fontWeight: 600,
  fontSize: 14,
  cursor: 'pointer',
  padding: 0,
};

