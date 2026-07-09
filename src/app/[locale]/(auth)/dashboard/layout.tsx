import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { NavUser } from '@/components/layouts/NavUser';
import { SidebarLayout } from '@/components/layouts/SidebarLayout';

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

export default async function DashboardLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <SidebarLayout sidebarFooter={<NavUser />}>
      {props.children}
    </SidebarLayout>
  );
}
