import type { AppNotification } from '../types';

export interface NotificationItemProps {
  item: AppNotification;
  onToggleRead?: (id: string, next: boolean) => void;
}

/**
 * Fila de notificación con indicador leído/no leído y switch accesible.
 */
export default function NotificationItem({ item, onToggleRead }: NotificationItemProps) {
  const date = new Date(item.date);
  const isUnread = !item.read;
  const switchId = `notif-switch-${item.id}`;
  return (
    <li className="list-group-item d-flex justify-content-between align-items-start" aria-live="polite">
      <div className="ms-2 me-auto">
        <div className="fw-semibold d-flex align-items-center gap-2">
          {isUnread && <span aria-label="No leído" title="No leído" style={{ width: 8, height: 8, borderRadius: 8, background: '#588f41', display: 'inline-block' }} />}
          {item.title}
        </div>
        {item.body && <div className="text-muted">{item.body}</div>}
        <small className="text-muted">{isNaN(date.getTime()) ? item.date : date.toLocaleString()}</small>
      </div>
      {/* Switch accesible para marcar leído/no leído */}
      <button
        id={switchId}
        type="button"
        role="switch"
        aria-checked={item.read}
        aria-label={item.read ? 'Marcar como no leído' : 'Marcar como leído'}
        className="btn btn-sm btn-outline-secondary"
        onClick={() => onToggleRead?.(item.id, !item.read)}
      >
        {item.read ? 'Leído' : 'No leído'}
      </button>
    </li>
  );
}

