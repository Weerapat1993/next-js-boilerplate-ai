import { SidebarNav } from './SidebarNav';

interface SidebarLayoutProps {
  children: React.ReactNode;
  sidebarFooter?: React.ReactNode;
}

/**
 * Layout component with a sidebar navigation and main content area.
 * Renders a two-column layout with SidebarNav on the left.
 */
export function SidebarLayout(props: SidebarLayoutProps) {
  return (
    <div className="flex h-screen">
      <SidebarNav footerSlot={props.sidebarFooter} />
      <main className="flex-1 overflow-auto">
        {props.children}
      </main>
    </div>
  );
}
