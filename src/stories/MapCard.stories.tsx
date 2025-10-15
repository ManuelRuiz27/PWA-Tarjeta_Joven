import type { Meta, StoryObj } from '@storybook/react';
import MapCard from '@components/MapCard';

const meta: Meta<typeof MapCard> = {
  title: 'Catálogo/MapCard',
  component: MapCard,
  parameters: {
    docs: {
      description: {
        component: 'Tarjeta usada en la vista de mapa para resaltar un comercio y abrir Google Maps.',
      },
    },
  },
  argTypes: {
    onSelect: { action: 'onSelect' },
  },
};

export default meta;

type Story = StoryObj<typeof MapCard>;

const baseItem = {
  id: 'm1',
  name: 'Café Central',
  category: 'Gastronomía',
  municipality: 'Querétaro',
  discount: '10% off',
  merchantId: 'm1',
  shortDescription: 'Café de especialidad con repostería artesanal.',
  address: 'Av. Central 123, Centro Histórico',
};

export const Default: Story = {
  args: {
    item: baseItem,
  },
};

export const Active: Story = {
  args: {
    item: baseItem,
    isActive: true,
  },
};
