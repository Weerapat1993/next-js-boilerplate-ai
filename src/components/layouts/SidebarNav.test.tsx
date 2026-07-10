import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';

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
vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => false,
}));

import { SidebarProvider } from '@/components/ui/sidebar';
import { SidebarNav } from './SidebarNav';

describe('SidebarNav', () => {
  it('renders all nav links', async () => {
    await render(
      <SidebarProvider>
        <SidebarNav />
      </SidebarProvider>,
    );
    expect(document.querySelectorAll('a[href]').length).toBeGreaterThanOrEqual(5);
  });
});
