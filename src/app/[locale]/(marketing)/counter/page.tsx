import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CounterForm } from '@/components/CounterForm';
import { CurrentCount } from '@/components/CurrentCount';

type CounterPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: CounterPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'Counter' });
  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function CounterPage(props: CounterPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Counter' });

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
        {t('meta_title')}
      </h1>
      <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-700">
        <CurrentCount />
        <div className="mt-6">
          <CounterForm />
        </div>
      </div>
    </div>
  );
}
