import type { Benefit } from '@features/catalog/types';

interface Props {
  item: Benefit;
}

export default function BenefitCard({ item }: Props) {
  const until = new Date(item.validUntil);
  const untilFmt = isNaN(until.getTime()) ? item.validUntil : until.toLocaleDateString();
  return (
    <article
      role="article"
      aria-label={item.title}
      style={{
        border: '1px solid #e2e2e2',
        borderRadius: 8,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <img src={item.imageUrl} alt={`Imagen de ${item.title}`} style={{ width: '100%', height: 160, objectFit: 'cover' }} />
      <div style={{ padding: 12, display: 'grid', gap: 6 }}>
        <h3 style={{ margin: 0, fontSize: 16 }}>{item.title}</h3>
        <p style={{ margin: 0, color: '#555' }}>{item.terms}</p>
        <small style={{ color: '#666' }}>Vigente hasta: {untilFmt}</small>
      </div>
    </article>
  );
}
