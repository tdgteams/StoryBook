import { StoryObj } from '@storybook/react';

declare const meta: Meta<({ user, onLogin, onLogout, onCreateAccount }: import('./Header').HeaderProps) => import("react/jsx-runtime").JSX.Element>;
export default meta;
type Story = StoryObj<typeof meta>;
export declare const LoggedIn: Story;
export declare const LoggedOut: Story;
