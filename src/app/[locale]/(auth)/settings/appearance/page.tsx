import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AppearanceForm } from '@/components/AppearanceForm';
import { Separator } from '@/components/ui/separator';
import { getThemeMode } from '@/libs/ThemeMode';

export default async function SettingsAppearancePage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'SettingsAppearancePage' });
  const themeMode = await getThemeMode();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          {t('page_title')}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t('page_description')}
        </p>
      </div>
      <Separator />
      <AppearanceForm currentThemeMode={themeMode} />
    </div>
  );
}
