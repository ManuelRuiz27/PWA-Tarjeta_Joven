import type { Meta, StoryObj } from '@storybook/react';
import CardMerchant from '@features/catalog/components/CardMerchant';
import { MemoryRouter } from 'react-router-dom';

const meta: Meta<typeof CardMerchant> = {
  title: 'Catálogo/CardMerchant',
  component: CardMerchant,
  decorators: [(Story) => (<MemoryRouter><Story /></MemoryRouter>)],
  parameters: {
    docs: { description: { component: 'Tarjeta de comercio clicable con mini-lista de beneficios.' } },
  },
};
export default meta;
type Story = StoryObj<typeof CardMerchant>;

const merchant = { id: 'm1', name: 'Café Central', address: 'Av. Siempre Viva 123', distanceKm: 1.2, categories: ['Café', 'Desayunos'] };
const benefits = [
  { id: 'b1', title: '2x1 Latte', validUntil: '2099-01-01' },
  { id: 'b2', title: '10% descuento', validUntil: '2099-02-01' },
] as any;

export const Default: Story = { args: { merchant, benefits } };

