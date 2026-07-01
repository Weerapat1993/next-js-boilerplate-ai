import { currentUser } from '@clerk/nextjs/server';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CurrentCount } from '@/components/CurrentCount';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'DashboardLayout' });
  return { title: t('meta_title') };
}

export default async function DashboardPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Dashboard' });
  const tLayout = await getTranslations({ locale, namespace: 'DashboardLayout' });
  const user = await currentUser();

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
        {tLayout('meta_title')}
      </h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 p-5 dark:border-gray-700">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {t('stat_counter')}
          </p>
          <div className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
            <CurrentCount />
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 p-5 dark:border-gray-700">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {t('stat_portfolio')}
          </p>
          <div className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
            6 items
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 p-5 dark:border-gray-700">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {t('stat_account')}
          </p>
          <div className="mt-2 text-sm text-gray-900 dark:text-gray-100">
            <p className="font-medium">
              {user?.fullName ?? user?.firstName ?? 'User'}
            </p>
            <p className="text-gray-500 dark:text-gray-400">
              {user?.primaryEmailAddress?.emailAddress ?? ''}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
