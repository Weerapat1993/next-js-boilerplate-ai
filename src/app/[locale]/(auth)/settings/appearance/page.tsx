import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AppearanceForm } from '@/components/AppearanceForm';
import { getThemeMode } from '@/libs/ThemeMode';

export default async function SettingsAppearancePage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'SettingsAppearancePage' });
  const themeMode = await getThemeMode();

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
        {t('page_title')}
      </h1>
      <AppearanceForm currentThemeMode={themeMode} />
    </div>
  );
}
