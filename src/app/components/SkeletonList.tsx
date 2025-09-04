import React from 'react';

export interface SkeletonListProps {
  count?: number;
  linesPerItem?: number;
}

/**
 * Lista esqueleto para estados de carga. Usa bloques grises y respeta accesibilidad.
 */
export default function SkeletonList({ count = 5, linesPerItem = 2 }: SkeletonListProps) {
  return (
    <div aria-busy="true" aria-live="polite">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="mb-3" style={{ border: '1px solid var(--color-border)', borderRadius: 8, padding: 12 }}>
          <div style={{ height: 16, background: '#eee', width: '60%', marginBottom: 8, borderRadius: 4 }} />
          {Array.from({ length: linesPerItem }).map((__, j) => (
            <div key={j} style={{ height: 12, background: '#eee', width: `${90 - j * 10}%`, marginBottom: 6, borderRadius: 4 }} />
          ))}
        </div>
      ))}
    </div>
  );
}

