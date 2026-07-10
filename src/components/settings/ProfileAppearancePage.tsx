import { getTranslations } from 'next-intl/server';
import { AppearanceForm } from '@/components/AppearanceForm';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { Separator } from '@/components/ui/separator';
import { getThemeMode } from '@/libs/ThemeMode';

export const ProfileAppearancePage = async (props: { locale: string }) => {
  const t = await getTranslations({ locale: props.locale, namespace: 'SettingsAppearancePage' });
  const themeMode = await getThemeMode();

  return (
    <div className="space-y-6 px-4 py-6">
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
      <Separator />
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {t('language_title')}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('language_description')}
          </p>
        </div>
        <LocaleSwitcher />
      </div>
    </div>
  );
};
