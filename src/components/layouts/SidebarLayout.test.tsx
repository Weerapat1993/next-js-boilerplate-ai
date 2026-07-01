import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';

vi.mock('./SidebarNav', () => ({
  SidebarNav: (props: { footerSlot?: React.ReactNode }) => (
    <div data-testid="sidebar-nav">{props.footerSlot}</div>
  ),
}));

import { SidebarLayout } from './SidebarLayout';

describe('SidebarLayout', () => {
  it('renders children in main area', async () => {
    await render(<SidebarLayout><p>page content</p></SidebarLayout>);
    expect(page.getByText('page content')).toBeTruthy();
  });

  it('passes sidebarFooter to SidebarNav', async () => {
    await render(
      <SidebarLayout sidebarFooter={<button>Sign out</button>}>
        <p>content</p>
      </SidebarLayout>,
    );
    expect(page.getByText('Sign out')).toBeTruthy();
  });
});
