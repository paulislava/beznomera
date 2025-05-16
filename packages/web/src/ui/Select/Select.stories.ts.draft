import type { Meta, StoryObj } from '@storybook/react';

import { RawSelect } from './RawSelect';

const meta = {
  title: 'Example/Select',
  component: RawSelect,
  parameters: {
    layout: 'centered'
  }
} satisfies Meta<typeof RawSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    name: 'brand',
    label: 'Марка машины',
    options: [
      {
        label: 'BMW',
        value: 'bmw'
      },
      {
        label: 'Mercedes',
        value: 'mercedes'
      },
      {
        label: 'Audi',
        value: 'audi'
      }
    ],
    required: true
  }
};
