import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));
vi.mock('next/navigation', () => ({
  usePathname: () => '/en',
}));
vi.mock('@/libs/I18nNavigation', () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));
vi.mock('@/utils/AppConfig', () => ({
  AppConfig: { name: 'TestApp' },
}));

import { SidebarNav } from './SidebarNav';

describe('SidebarNav', () => {
  it('renders all nav links', async () => {
    await render(<SidebarNav />);
    expect(page.getByRole('link').elements().length).toBeGreaterThanOrEqual(5);
  });

  it('toggles mobile drawer on hamburger click', async () => {
    await render(<SidebarNav />);
    const hamburger = page.getByLabelText('Open navigation');
    expect(page.getByLabelText('Close navigation').elements()).toHaveLength(0);
    await userEvent.click(hamburger.element());
    expect(page.getByLabelText('Close navigation').elements()).toHaveLength(1);
  });
});
