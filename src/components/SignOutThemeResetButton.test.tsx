import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';

vi.mock('@clerk/nextjs', () => ({
  SignOutButton: ({ children }: { children: React.ReactNode }) => children,
}));

import { SignOutThemeResetButton } from './SignOutThemeResetButton';

describe('sign-out theme reset button', () => {
  it('clears the theme_mode cookie via the Cookie Store API on click', async () => {
    const deleteMock = vi.fn<(name: string) => void>();
    vi.stubGlobal('cookieStore', { delete: deleteMock });

    await render(<SignOutThemeResetButton label="Sign out" />);
    await userEvent.click(page.getByText('Sign out').element());

    expect(deleteMock).toHaveBeenCalledWith('theme_mode');
  });
});
