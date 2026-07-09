import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ProfileAppearancePage } from '@/components/settings/ProfileAppearancePage';
import { UserProfileWithAppearance } from '@/components/settings/UserProfileWithAppearance';
import { getI18nPath } from '@/utils/Helpers';

export default async function SettingsPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'SettingsLayout' });

  return (
    <div className="lg:-ml-12">
      <UserProfileWithAppearance
        path={getI18nPath('/settings', locale)}
        appearanceLabel={t('nav_appearance')}
        appearanceContent={<ProfileAppearancePage locale={locale} />}
      />
    </div>
  );
}
