import { StoryObj } from '@storybook/react';

declare const meta: Meta<import('../../node_modules/react').FC<{}>>;
export default meta;
type Story = StoryObj<typeof meta>;
export declare const LoggedOut: Story;
export declare const LoggedIn: Story;
