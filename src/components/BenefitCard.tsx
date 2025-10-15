import { memo } from 'react';
import { motion, type MotionStyle } from 'framer-motion';
import { Tag, MapPin } from 'lucide-react';
import type { CatalogItem } from '@features/catalog/types';

export interface BenefitCardProps {
  benefit: CatalogItem;
  onSelect: (benefit: CatalogItem) => void;
  index?: number;
}

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: Math.min(i * 0.05, 0.3), duration: 0.3, ease: 'easeOut' },
  }),
};

function BenefitCardComponent({ benefit, onSelect, index = 0 }: BenefitCardProps) {
  const { name, category, municipality, discount, imageUrl, shortDescription } = benefit;

  return (
    <motion.article
      layout
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ translateY: -4, boxShadow: '0 12px 24px rgba(15, 23, 42, 0.12)' }}
      whileTap={{ scale: 0.98 }}
      whileFocus={{ boxShadow: '0 0 0 3px rgba(34, 197, 94, 0.35)' }}
      role="button"
      tabIndex={0}
      aria-label={`Ver detalle de ${name}`}
      onClick={() => onSelect(benefit)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect(benefit);
        }
      }}
      style={cardStyles}
    >
      {imageUrl && (
        <img
          src={imageUrl}
          alt=""
          loading="lazy"
          style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 12, marginBottom: 12 }}
        />
      )}
      <div style={chipRowStyles}>
        <span style={chipStyles}>{category}</span>
        <span style={chipOutlineStyles}>{municipality}</span>
      </div>
      <h3 style={nameStyles}>{name}</h3>
      {shortDescription && <p style={descriptionStyles}>{shortDescription}</p>}
      <div style={footerStyles}>
        <span style={discountStyles} aria-label={`Descuento ${discount}`}>
          <Tag size={16} aria-hidden />
          <strong>{discount}</strong>
        </span>
        <span style={locationStyles}>
          <MapPin size={16} aria-hidden />
          <span>{municipality}</span>
        </span>
      </div>
    </motion.article>
  );
}

const cardStyles: MotionStyle = {
  background: 'var(--color-surface, #ffffff)',
  borderRadius: 16,
  padding: 16,
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  minHeight: 180,
  cursor: 'pointer',
  border: '1px solid var(--color-border, rgba(15, 23, 42, 0.08))',
  boxShadow: '0 6px 18px rgba(15, 23, 42, 0.08)',
  transition: 'box-shadow 0.2s ease, transform 0.2s ease',
};

const chipRowStyles: React.CSSProperties = {
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap',
};

const chipStyles: React.CSSProperties = {
  background: 'rgba(34, 197, 94, 0.12)',
  color: 'rgb(22, 101, 52)',
  padding: '4px 10px',
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 600,
  textTransform: 'capitalize',
};

const chipOutlineStyles: React.CSSProperties = {
  border: '1px solid rgba(100, 116, 139, 0.3)',
  color: 'rgb(71, 85, 105)',
  padding: '4px 10px',
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 500,
  textTransform: 'capitalize',
};

const nameStyles: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  lineHeight: 1.2,
  color: 'var(--color-text, #0f172a)',
  margin: 0,
};

const descriptionStyles: React.CSSProperties = {
  fontSize: 14,
  color: 'var(--color-text-muted, #475569)',
  margin: 0,
  flexGrow: 1,
};

const footerStyles: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 12,
  marginTop: 'auto',
};

const discountStyles: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
  color: '#fff',
  padding: '6px 12px',
  borderRadius: 999,
  fontSize: 14,
  fontWeight: 600,
};

const locationStyles: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  color: 'var(--color-text-muted, #475569)',
  fontSize: 13,
};

const BenefitCard = memo(BenefitCardComponent);

export default BenefitCard;

