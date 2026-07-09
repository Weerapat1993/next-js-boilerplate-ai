import { setRequestLocale } from 'next-intl/server';
import { SidebarLayout } from '@/components/layouts/SidebarLayout';

export default async function MarketingLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <SidebarLayout>
      {props.children}
    </SidebarLayout>
  );
}
