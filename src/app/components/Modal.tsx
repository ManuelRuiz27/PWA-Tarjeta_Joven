import { useEffect, useRef } from 'react';

export interface ModalProps {
  /** Controla la visibilidad del modal */
  isOpen: boolean;
  /** Callback al cerrar (Esc o backdrop) */
  onClose: () => void;
  /** Contenido del diálogo */
  children: React.ReactNode;
  /** Etiqueta accesible si no se usa `ariaLabelledBy` */
  ariaLabel?: string;
  /** ID del título para `aria-labelledby` */
  ariaLabelledBy?: string;
  /** Cierre al hacer click fuera del cuadro */
  closeOnBackdrop?: boolean;
}

/**
 * Modal accesible: foco inicial dentro, cierre con Esc y click en backdrop, bloqueo de scroll.
 * Implementa un trap de Tab simple para no salir del modal con teclado.
 *
 * Notas:
 * - No renderiza nada cuando `isOpen` es false (unmount).
 * - Restaura el foco al elemento activo anterior al cerrarse.
 */
export default function Modal({ isOpen, onClose, children, ariaLabel, ariaLabelledBy, closeOnBackdrop = true }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const lastActiveRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    lastActiveRef.current = (document.activeElement as HTMLElement) || null;
    // Bloquea scroll del body
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Foco inicial
    const t = setTimeout(() => {
      const el = dialogRef.current;
      if (!el) return;
      const focusables = getFocusables(el);
      (focusables[0] as HTMLElement | undefined)?.focus?.();
      if (focusables.length === 0) el.focus();
    }, 0);

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      } else if (e.key === 'Tab') {
        const el = dialogRef.current;
        if (!el) return;
        const focusables = getFocusables(el);
        if (focusables.length === 0) return;
        const first = focusables[0] as HTMLElement;
        const last = focusables[focusables.length - 1] as HTMLElement;
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    }
    window.addEventListener('keydown', onKey, true);
    return () => {
      clearTimeout(t);
      window.removeEventListener('keydown', onKey, true);
      document.body.style.overflow = prevOverflow;
      // Regresa el foco
      lastActiveRef.current?.focus?.();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function onBackdropClick(e: React.MouseEvent) {
    if (!closeOnBackdrop) return;
    if (e.target === overlayRef.current) onClose();
  }

  return (
    <div ref={overlayRef} onMouseDown={onBackdropClick} className="modal-backdrop" style={overlayStyles}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabel ? undefined : ariaLabelledBy}
        tabIndex={-1}
        className="modal-dialog"
        style={dialogStyles}
      >
        {children}
      </div>
    </div>
  );
}

function getFocusables(root: HTMLElement): Element[] {
  return Array.from(
    root.querySelectorAll(
      'a[href],button:not([disabled]),textarea,input[type="text"],input[type="email"],input[type="search"],input[type="password"],input[type="radio"],input[type="checkbox"],select,[tabindex]:not([tabindex="-1"])'
    )
  ).filter((el) => (el as HTMLElement).offsetParent !== null);
}

const overlayStyles: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 2000,
};

const dialogStyles: React.CSSProperties = {
  background: 'var(--color-bg)',
  color: 'var(--color-text)',
  borderRadius: 12,
  minWidth: 280,
  maxWidth: 560,
  width: '90%',
  outline: 'none',
  boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
};
