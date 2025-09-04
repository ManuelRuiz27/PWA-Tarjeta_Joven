import type { Meta, StoryObj } from '@storybook/react';
import CardBenefit from '@features/catalog/components/CardBenefit';

const meta: Meta<typeof CardBenefit> = {
  title: 'Catálogo/CardBenefit',
  component: CardBenefit,
  parameters: {
    docs: { description: { component: 'Tarjeta de beneficio con CTA “Guardar en Wallet”.' } },
  },
  argTypes: {
    onSave: { action: 'onSave' },
    loading: { control: 'boolean' },
    soldOut: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof CardBenefit>;

const baseItem = {
  id: 'b1',
  title: '2x1 en café',
  imageUrl: 'https://picsum.photos/seed/cafe/400/200',
  terms: 'Válido de lunes a viernes. No acumulable con otras promociones.',
  validUntil: '2099-12-31',
  merchantId: 'm1',
  category: 'comida',
};

export const Default: Story = { args: { item: baseItem } };
export const Loading: Story = { args: { item: baseItem, loading: true } };
export const Expired: Story = { args: { item: { ...baseItem, validUntil: '2000-01-01' } as any } };
export const SoldOut: Story = { args: { item: baseItem, soldOut: true } };

