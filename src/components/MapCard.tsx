import { useMemo } from 'react';
import type { CatalogItem } from '@features/catalog/types';
import { track } from '@lib/analytics';

export interface MapCardProps {
  item: CatalogItem;
  isActive?: boolean;
  onSelect: (item: CatalogItem) => void;
}

export default function MapCard({ item, isActive, onSelect }: MapCardProps) {
  const { name, category, municipality, shortDescription, address } = item;

  const googleMapsUrl = useMemo(() => {
    const queryParts = [name, address].filter(Boolean).join(' ');
    const encodedQuery = encodeURIComponent(queryParts || name);
    return `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`;
  }, [address, name]);

  return (
    <article style={containerStyles} role="listitem" aria-label={name}>
      <button
        type="button"
        onClick={() => onSelect(item)}
        aria-pressed={isActive}
        style={{
          ...cardButtonStyles,
          ...(isActive ? activeCardStyles : {}),
        }}
      >
        <div style={{ display: 'grid', gap: 4, textAlign: 'left' }}>
          <p style={eyebrowStyles}>{category}</p>
          <h3 style={titleStyles}>{name}</h3>
          {shortDescription ? <p style={descriptionStyles}>{shortDescription}</p> : null}
          <p style={metaStyles}>
            <span aria-hidden="true">📍</span> {municipality}
          </p>
          {address ? (
            <p style={addressStyles}>
              <span style={visuallyHiddenStyles}>Dirección: </span>
              {address}
            </p>
          ) : null}
        </div>
      </button>
      <a
        href={googleMapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-secondary"
        style={mapsButtonStyles}
        onClick={() => {
          void track('open_merchant', {
            source: 'map',
            action: 'maps_link',
            merchantId: item.merchantId ?? item.id,
          });
        }}
      >
        Ver en Google Maps
      </a>
    </article>
  );
}

const containerStyles: React.CSSProperties = {
  display: 'grid',
  gap: 12,
};

const cardButtonStyles: React.CSSProperties = {
  display: 'block',
  width: '100%',
  background: 'var(--surface-color, #fff)',
  border: '1px solid rgba(15, 23, 42, 0.1)',
  borderRadius: 16,
  padding: 16,
  boxShadow: '0 6px 16px rgba(15, 23, 42, 0.08)',
  cursor: 'pointer',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
  textAlign: 'left',
  color: 'inherit',
};

const activeCardStyles: React.CSSProperties = {
  borderColor: 'rgba(34, 197, 94, 0.6)',
  boxShadow: '0 12px 24px rgba(34, 197, 94, 0.25)',
  transform: 'translateY(-2px)',
};

const eyebrowStyles: React.CSSProperties = {
  margin: 0,
  fontSize: 12,
  textTransform: 'uppercase',
  letterSpacing: 0.6,
  color: 'rgba(15, 23, 42, 0.6)',
  fontWeight: 600,
};

const titleStyles: React.CSSProperties = {
  margin: 0,
  fontSize: 18,
  fontWeight: 700,
  color: 'var(--color-text, #0f172a)',
  lineHeight: 1.25,
};

const descriptionStyles: React.CSSProperties = {
  margin: 0,
  fontSize: 14,
  color: 'rgba(15, 23, 42, 0.75)',
};

const metaStyles: React.CSSProperties = {
  margin: 0,
  fontSize: 13,
  fontWeight: 500,
  color: 'rgba(34, 197, 94, 0.95)',
};

const addressStyles: React.CSSProperties = {
  margin: 0,
  fontSize: 13,
  color: 'rgba(15, 23, 42, 0.65)',
};

const mapsButtonStyles: React.CSSProperties = {
  justifySelf: 'start',
  textDecoration: 'none',
  fontSize: 14,
  padding: '0.55rem 1.1rem',
};

const visuallyHiddenStyles: React.CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

