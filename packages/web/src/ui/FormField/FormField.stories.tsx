import type { Meta, StoryObj } from '@storybook/react';

import FormField from './FormField';

import { FormFieldProps, TypeValue } from './FormField.types';
import { AuthFormData } from 'api/auth/auth.types';
const meta = {
  title: 'Example/FormField',

  component: FormField<AuthFormData>,
  parameters: {
    layout: 'centered'
  }
} satisfies Meta<
  Omit<FormFieldProps<AuthFormData>, 'type'> & {
    type?: TypeValue;
    name: Paths<AuthFormData>;
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
