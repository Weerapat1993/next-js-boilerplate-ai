import { SignOutButton } from '@clerk/nextjs';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';
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
  const t = await getTranslations({
    locale,
    namespace: 'DashboardLayout',
  });

  return (
    <SidebarLayout
      sidebarFooter={
        <div className="flex flex-col gap-1">
          <LocaleSwitcher />
          <SignOutButton>
            <button className="border-none text-gray-700 hover:text-gray-900" type="button">
              {t('sign_out')}
            </button>
          </SignOutButton>
        </div>
      }
    >
      {props.children}
    </SidebarLayout>
  );
}
