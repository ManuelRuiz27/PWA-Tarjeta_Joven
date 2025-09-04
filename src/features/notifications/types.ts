export interface AppNotification {
  id: string;
  title: string;
  body?: string;
  date: string; // ISO
  read: boolean;
}

