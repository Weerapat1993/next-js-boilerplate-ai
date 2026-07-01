import { setRequestLocale } from 'next-intl/server';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { SidebarLayout } from '@/components/layouts/SidebarLayout';

export default async function MarketingLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <SidebarLayout sidebarFooter={<LocaleSwitcher />}>
      {props.children}
    </SidebarLayout>
  );
}
