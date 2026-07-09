import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { NavUser } from '@/components/layouts/NavUser';
import { SidebarLayout } from '@/components/layouts/SidebarLayout';
import { SettingsNav } from '@/components/settings/SettingsNav';
import { Separator } from '@/components/ui/separator';

export async function generateMetadata(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'DashboardLayout',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function SettingsLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const tSettings = await getTranslations({
    locale,
    namespace: 'SettingsLayout',
  });

  const navEntries = [
    { href: '/settings/appearance/', label: tSettings('nav_appearance') },
  ];

  return (
    <SidebarLayout sidebarFooter={<NavUser />}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
            {tSettings('title')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {tSettings('description')}
          </p>
        </div>
        <Separator />
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
          <aside className="lg:w-48 lg:shrink-0">
            <SettingsNav entries={navEntries} />
          </aside>
          <div className="flex-1">{props.children}</div>
        </div>
      </div>
    </SidebarLayout>
  );
}
