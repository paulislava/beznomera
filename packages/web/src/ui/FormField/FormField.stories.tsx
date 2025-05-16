import type { Meta, StoryObj } from '@storybook/react';

import FormField from './FormField';

import { FormFieldProps, TypeValue } from './FormField.types';
const meta = {
  title: 'Example/FormField',

  component: FormField<any>,
  parameters: {
    layout: 'centered'
  }
} satisfies Meta<
  Omit<FormFieldProps<any>, 'type'> & {
    type?: TypeValue;
    name: Paths<any>;
  }
>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    name: 'login',
    type: 'email',
    label: 'E-mail'
  }
};
export const PrimaryButton: Story = {
  args: {
    name: 'login',
    type: 'email',
    label: 'E-mail'
  }
};
