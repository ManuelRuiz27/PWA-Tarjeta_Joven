import type { Meta, StoryObj } from '@storybook/react';
import BenefitCard from '@components/BenefitCard';

const meta: Meta<typeof BenefitCard> = {
  title: 'Catálogo/BenefitCard',
  component: BenefitCard,
  parameters: {
    docs: {
      description: {
        component:
          'Tarjeta de beneficio destacada utilizada en el catálogo para mostrar descuentos y ubicación.',
      },
    },
  },
  argTypes: {
    onSelect: { action: 'onSelect' },
  },
};

export default meta;

type Story = StoryObj<typeof BenefitCard>;

const baseBenefit = {
  id: 'b1',
  name: '2x1 en café de especialidad',
  category: 'Gastronomía',
  municipality: 'Querétaro',
  discount: '2x1',
  merchantId: 'm1',
  shortDescription: 'Válido de lunes a viernes en bebidas calientes.',
  imageUrl: 'https://picsum.photos/seed/benefit/400/240',
};

export const Default: Story = {
  args: {
    benefit: baseBenefit,
  },
};

export const WithLongDescription: Story = {
  args: {
    benefit: {
      ...baseBenefit,
      shortDescription:
        'Disfruta bebidas ilimitadas durante la happy hour y recibe un descuento adicional del 15% en repostería artesanal.',
    },
  },
};

export const WithoutImage: Story = {
  args: {
    benefit: {
      ...baseBenefit,
      imageUrl: undefined,
    },
  },
};
