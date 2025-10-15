import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { AnimatePresence, motion, type MotionStyle } from 'framer-motion';
import { MapPin, Clock3, FileText, X } from 'lucide-react';
import Modal from '@app/components/Modal';
import type { CatalogItem, Merchant } from '@features/catalog/types';
import { track } from '@lib/analytics';

export interface MerchantModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseInfo?: CatalogItem | null;
  merchant?: Merchant | null;
  isLoading?: boolean;
}

export default function MerchantModal({ isOpen, onClose, baseInfo, merchant, isLoading }: MerchantModalProps) {
  const details = useMemo(() => mergeDetails(baseInfo, merchant), [baseInfo, merchant]);

  const mapUrl = useMemo(() => {
    if (details?.latitude !== undefined && details?.longitude !== undefined) {
      return `https://www.google.com/maps/search/?api=1&query=${details.latitude},${details.longitude}`;
    }
    if (details?.address) {
      const query = encodeURIComponent(`${details.name} ${details.address}`);
      return `https://www.google.com/maps/search/?api=1&query=${query}`;
    }
    return undefined;
  }, [details]);

  return (
    <AnimatePresence>
      {isOpen && (
        <Modal isOpen={isOpen} onClose={onClose} ariaLabel={`Detalle del beneficio ${details?.name ?? ''}`}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={modalContentStyles}
          >
            <header style={headerStyles}>
              <div>
                <p style={categoryLabelStyles}>{details?.category}</p>
                <h2 id="merchant-modal-title" style={titleStyles}>
                  {details?.name ?? 'Beneficio'}
                </h2>
              </div>
              <button type="button" onClick={onClose} style={closeButtonStyles} aria-label="Cerrar">
                <X size={20} aria-hidden />
              </button>
            </header>

            <section style={infoSectionStyles} aria-labelledby="merchant-modal-title">
              <InfoRow icon={<MapPin size={18} aria-hidden />} label="Dirección" value={details?.address ?? 'Por definir'} />
              <InfoRow icon={<Clock3 size={18} aria-hidden />} label="Horario" value={details?.schedule ?? 'Consulta horarios disponibles'} />
              <InfoRow
                icon={<FileText size={18} aria-hidden />}
                label="Descripción"
                value={details?.description ?? baseInfo?.shortDescription ?? 'Conoce todos los detalles en el sitio del comercio.'}
              />
            </section>

            <div style={discountBannerStyles}>
              <span>Descuento</span>
              <strong>{details?.discount ?? merchant?.discount ?? baseInfo?.discount}</strong>
            </div>

            <footer style={footerStyles}>
              <a
                href={mapUrl ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-success"
                style={{ pointerEvents: mapUrl ? 'auto' : 'none', opacity: mapUrl ? 1 : 0.6 }}
                aria-disabled={!mapUrl}
                onClick={() => {
                  if (!mapUrl) return;
                  const merchantId = details?.id ?? baseInfo?.merchantId ?? baseInfo?.id;
                  void track('open_merchant', {
                    source: 'catalog',
                    action: 'maps_link',
                    merchantId,
                  });
                }}
              >
                Cómo llegar
              </a>
              <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
                Cerrar
              </button>
            </footer>

            {isLoading && <motion.div style={loadingOverlayStyles} animate={{ opacity: [0.4, 0.7, 0.4] }} transition={{ duration: 1.2, repeat: Infinity }} />}
          </motion.div>
        </Modal>
      )}
    </AnimatePresence>
  );
}

interface InfoRowProps {
  icon: ReactNode;
  label: string;
  value?: string;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div style={infoRowStyles}>
      <div style={infoIconStyles}>{icon}</div>
      <div>
        <p style={infoLabelStyles}>{label}</p>
        <p style={infoValueStyles}>{value}</p>
      </div>
    </div>
  );
}

function mergeDetails(baseInfo?: CatalogItem | null, merchant?: Merchant | null) {
  if (!baseInfo && !merchant) return undefined;
  return {
    id: merchant?.id ?? baseInfo?.merchantId ?? baseInfo?.id ?? '',
    name: merchant?.name ?? baseInfo?.name ?? '',
    category: merchant?.category ?? baseInfo?.category ?? '',
    municipality: merchant?.municipality ?? baseInfo?.municipality ?? '',
    discount: merchant?.discount ?? baseInfo?.discount ?? '',
    address: merchant?.address ?? baseInfo?.address,
    schedule: merchant?.schedule ?? baseInfo?.schedule,
    description: merchant?.description,
    latitude: merchant?.latitude,
    longitude: merchant?.longitude,
  };
}

const modalContentStyles: MotionStyle = {
  padding: 24,
  display: 'flex',
  flexDirection: 'column',
  gap: 20,
  position: 'relative',
};

const headerStyles: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 12,
};

const categoryLabelStyles: React.CSSProperties = {
  margin: 0,
  fontSize: 13,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: 1,
  color: 'var(--color-text-muted, #475569)',
};

const titleStyles: React.CSSProperties = {
  margin: '4px 0 0',
  fontSize: 22,
  lineHeight: 1.2,
};

const closeButtonStyles: React.CSSProperties = {
  border: 'none',
  background: 'rgba(15, 23, 42, 0.05)',
  borderRadius: 999,
  padding: 6,
  cursor: 'pointer',
  display: 'inline-flex',
};

const infoSectionStyles: React.CSSProperties = {
  display: 'grid',
  gap: 12,
};

const infoRowStyles: React.CSSProperties = {
  display: 'flex',
  gap: 12,
};

const infoIconStyles: React.CSSProperties = {
  background: 'rgba(34, 197, 94, 0.12)',
  color: 'rgb(21, 128, 61)',
  borderRadius: 12,
  width: 36,
  height: 36,
  display: 'grid',
  placeItems: 'center',
  flexShrink: 0,
};

const infoLabelStyles: React.CSSProperties = {
  margin: 0,
  fontSize: 13,
  fontWeight: 600,
  color: 'var(--color-text-muted, #475569)',
};

const infoValueStyles: React.CSSProperties = {
  margin: '2px 0 0',
  fontSize: 15,
  color: 'var(--color-text, #0f172a)',
  whiteSpace: 'pre-line',
};

const discountBannerStyles: React.CSSProperties = {
  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
  color: '#fff',
  borderRadius: 16,
  padding: '16px 20px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: 18,
  fontWeight: 700,
};

const footerStyles: React.CSSProperties = {
  display: 'flex',
  gap: 12,
  flexWrap: 'wrap',
  justifyContent: 'flex-end',
};

const loadingOverlayStyles: MotionStyle = {
  position: 'absolute',
  inset: 0,
  borderRadius: 12,
  background: 'rgba(248, 250, 252, 0.75)',
};

