import type { Benefit, Merchant } from '@features/catalog/types';
import { Link } from 'react-router-dom';
import { useOnline } from '@lib/useOnline';

export interface CardMerchantProps {
  merchant: Merchant & { distanceKm?: number; categories?: string[] };
  benefits?: Array<Pick<Benefit, 'id' | 'title' | 'validUntil'>>;
  to?: string; // ruta de detalle, por defecto /merchants/:id
  onSelectBenefit?: (id: string) => void;
}

/**
 * Tarjeta de comercio con nombre, categorías, distancia y mini‑lista de beneficios.
 *
 * Accesibilidad y comportamiento:
 * - El contenedor es un `Link` clicable a detalle con `aria-label` descriptivo.
 * - La lista de beneficios tiene `aria-label` y cada botón “Ver” detiene la navegación para lanzar callbacks.
 * - Muestra un badge “Offline” cuando `navigator.onLine === false`.
 *
 * Casos límite conocidos:
 * - Si `categories` no existe, se oculta la fila de categorías.
 * - Si `distanceKm` no viene, no se muestra el badge de distancia.
 * - `benefits` vacío muestra “Sin beneficios disponibles”.
 */
export default function CardMerchant({ merchant, benefits = [], to, onSelectBenefit }: CardMerchantProps) {
  const isOnline = useOnline();
  const categories = merchant.categories?.join(', ');
  const href = to ?? `/merchants/${merchant.id}`;

  return (
    <Link to={href} className="card h-100 text-reset text-decoration-none" aria-label={`Comercio ${merchant.name}`}> 
      <div className="card-body position-relative">
        {!isOnline && (
          <span
            className="badge text-bg-light position-absolute"
            style={{ right: 8, top: 8 }}
            aria-label="Modo offline"
          >
            Offline
          </span>
        )}
        <div className="d-flex justify-content-between align-items-start">
          <div className="me-2">
            <h3 className="h6 m-0">{merchant.name}</h3>
            {categories && <small className="text-muted d-block">{categories}</small>}
            {merchant.address && <p className="text-muted mb-1">{merchant.address}</p>}
          </div>
          {merchant.distanceKm != null && (
            <span className="badge rounded-pill text-bg-light" aria-label={`Distancia ${merchant.distanceKm} km`}>
              {merchant.distanceKm.toFixed(1)} km
            </span>
          )}
        </div>

        {benefits.length > 0 ? (
          <ul className="list-unstyled mt-2 mb-0" aria-label="Beneficios disponibles">
            {benefits.slice(0, 3).map((b) => (
              <li key={b.id} className="d-flex justify-content-between align-items-center py-1 border-top">
                <span className="me-2" title={b.title}>{b.title}</span>
                <div className="d-flex align-items-center gap-2">
                  <small className="text-muted">Hasta {fmtDate(b.validUntil)}</small>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={(e) => { e.preventDefault(); onSelectBenefit?.(b.id); }}
                    aria-label={`Ver beneficio ${b.title}`}
                  >
                    Ver
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted mb-0">Sin beneficios disponibles.</p>
        )}
      </div>
    </Link>
  );
}

function fmtDate(iso?: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString();
}
