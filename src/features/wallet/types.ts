export type WalletStatus = 'active' | 'redeemed' | 'expired';

export interface WalletItem {
  id: string;
  title: string;
  status: WalletStatus;
  qrToken: string | null;
  qrExpiresAt: string | null; // ISO string; si null no generó QR
  createdAt?: string;
  /** Si true, la acción asociada está en cola para sincronizar (offline) */
  syncing?: boolean;
}
