import { SidebarNav } from './SidebarNav';

export const SidebarLayout = (props: {
  children: React.ReactNode;
  sidebarFooter?: React.ReactNode;
}) => (
  <div className="flex min-h-screen font-sans text-gray-900 antialiased dark:bg-gray-950 dark:text-gray-100">
    <SidebarNav footerSlot={props.sidebarFooter} />
    <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl px-6 py-8 md:px-10">{props.children}</div>
    </main>
  </div>
);
