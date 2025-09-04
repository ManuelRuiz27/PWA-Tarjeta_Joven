import type { Meta, StoryObj } from '@storybook/react';
import QRView from '@app/components/QRView';

const meta: Meta<typeof QRView> = {
  title: 'Wallet/QRView (canvas)',
  component: QRView,
  parameters: {
    docs: { description: { component: 'QR con temporizador y estados Online/Offline.' } },
  },
  argTypes: {
    onRenew: { action: 'onRenew' },
  },
};
export default meta;
type Story = StoryObj<typeof QRView>;

export const Activo: Story = {
  args: {
    qrToken: 'TOKEN-DEMO-123456',
    expiresAt: new Date(Date.now() + 60_000).toISOString(),
    walletItemId: 'w1',
  },
};

export const Expirado: Story = {
  args: {
    qrToken: 'TOKEN-EXPIRADO',
    expiresAt: new Date(Date.now() - 1_000).toISOString(),
    walletItemId: 'w1',
  },
};

