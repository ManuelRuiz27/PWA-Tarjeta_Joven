import type { Meta, StoryObj } from '@storybook/react';
import EmptyState from '@app/components/EmptyState';

const meta: Meta<typeof EmptyState> = {
  title: 'UI/EmptyState',
  component: EmptyState,
  parameters: { docs: { description: { component: 'Estado vacío con CTA de recarga y enlace de ayuda.' } } },
  argTypes: {
    onReload: { action: 'onReload' },
  },
};
export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = { args: { title: 'Sin resultados', message: 'No encontramos coincidencias.' } };
export const ConCTA: Story = { args: { title: 'Nada aquí', message: 'Intenta cargar nuevamente.', reloadLabel: 'Recargar' } };

