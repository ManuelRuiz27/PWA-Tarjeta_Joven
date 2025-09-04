import type { Meta, StoryObj } from '@storybook/react';
import OTPInput from '@app/components/OTPInput';

const meta: Meta<typeof OTPInput> = {
  title: 'Auth/OTPInput',
  component: OTPInput,
  parameters: {
    docs: { description: { component: 'Entrada de OTP con 6 celdas, navegación por teclado y pegado.' } },
  },
  argTypes: {
    length: { control: 'number' },
    disabled: { control: 'boolean' },
    onComplete: { action: 'onComplete' },
  },
};
export default meta;
type Story = StoryObj<typeof OTPInput>;

export const Default: Story = { args: { length: 6 } };
export const Disabled: Story = { args: { length: 6, disabled: true } };

