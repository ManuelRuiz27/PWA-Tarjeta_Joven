import NotificationItem from './NotificationItem';
import type { AppNotification } from '../types';

export interface NotificationsListProps {
  items: AppNotification[];
  onToggleRead?: (id: string, next: boolean) => void;
}

/**
 * Lista de notificaciones accesible con estado leído/no leído.
 */
export default function NotificationsList({ items, onToggleRead }: NotificationsListProps) {
  if (!items.length) {
    return <p role="status" aria-live="polite" className="text-muted">No tienes notificaciones.</p>;
  }
  return (
    <ul className="list-group" role="list" aria-label="Notificaciones">
      {items.map((n) => (
        <NotificationItem key={n.id} item={n} onToggleRead={onToggleRead} />
      ))}
    </ul>
  );
}

