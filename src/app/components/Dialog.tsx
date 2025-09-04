import Modal, { type ModalProps } from './Modal';

export interface DialogProps extends Omit<ModalProps, 'children' | 'ariaLabel' | 'ariaLabelledBy'> {
  /** Título del diálogo (se enlaza con aria-labelledby) */
  title: string;
  /** Contenido principal */
  children: React.ReactNode;
  /** Zona de acciones (botones) */
  footer?: React.ReactNode;
}

/**
 * Diálogo simple construido sobre Modal con encabezado, contenido y pie.
 * Incluye botón “Cerrar” con etiqueta accesible.
 */
export default function Dialog({ title, children, footer, ...modalProps }: DialogProps) {
  const headingId = 'dialog-title';
  return (
    <Modal {...modalProps} ariaLabelledBy={headingId}>
      <div className="p-3">
        <div className="d-flex align-items-start justify-content-between">
          <h2 id={headingId} className="h5 m-0">{title}</h2>
          <button className="btn btn-sm btn-outline-secondary" onClick={modalProps.onClose} aria-label="Cerrar">×</button>
        </div>
        <div className="mt-2">{children}</div>
        {footer && <div className="mt-3 d-flex justify-content-end gap-2">{footer}</div>}
      </div>
    </Modal>
  );
}
