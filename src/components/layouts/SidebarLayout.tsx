import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { SidebarNav } from './SidebarNav';

export const SidebarLayout = (props: {
  children: React.ReactNode;
  sidebarFooter?: React.ReactNode;
}) => (
  <SidebarProvider>
    <SidebarNav footerSlot={props.sidebarFooter} />
    <SidebarInset>
      <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
      </header>
      <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-4xl px-6 py-8 md:px-10">{props.children}</div>
      </main>
    </SidebarInset>
  </SidebarProvider>
);
