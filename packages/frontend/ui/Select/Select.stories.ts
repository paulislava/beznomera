import type { Meta, StoryObj } from '@storybook/react';

import { RawSelect } from './RawSelect';
import { trainingTypeOptions } from 'messages/options';

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
        name: 'educationType',
        label: 'Вид обучения',
        options: trainingTypeOptions,
        required: true
    }
};
