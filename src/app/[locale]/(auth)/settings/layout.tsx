import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { SidebarLayout } from '@/components/layouts/SidebarLayout';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { SignOutThemeResetButton } from '@/components/SignOutThemeResetButton';

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
  const t = await getTranslations({
    locale,
    namespace: 'DashboardLayout',
  });

  return (
    <SidebarLayout
      sidebarFooter={
        <div className="flex flex-col gap-1">
          <LocaleSwitcher />
          <SignOutThemeResetButton label={t('sign_out')} />
        </div>
      }
    >
      {props.children}
    </SidebarLayout>
  );
}
