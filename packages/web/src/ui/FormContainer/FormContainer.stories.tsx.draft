import type { Meta, StoryObj } from '@storybook/react';

import { Form } from './FormContainer';
import FormField from '@/ui/FormField/FormField';
import Button from '@/ui/Button/Button';

const meta = {
  title: 'UI/FormContainer',
  component: Form,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
} satisfies Meta<typeof Form>;

export default meta;
type Story = StoryObj<typeof Form>;

export const Default: Story = {
  render: () => (
    <Form onSubmit={() => console.log()}>
      {({ submitting }) => (
        <>
          <FormField name='email' type='email' required label='E-mail' />
          <FormField name='surname' required label='Фамилия' placeholder='Иванов' />
          <Button disabled={submitting}>Создать</Button>
        </>
      )}
    </Form>
  )
};
