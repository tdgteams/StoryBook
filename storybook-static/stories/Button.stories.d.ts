import { StoryObj } from '@storybook/react';

declare const meta: Meta<({ primary, size, backgroundColor, label, ...props }: import('./Button').ButtonProps) => import("react/jsx-runtime").JSX.Element>;
export default meta;
type Story = StoryObj<typeof meta>;
export declare const Primary: Story;
export declare const Secondary: Story;
export declare const Large: Story;
export declare const Small: Story;
