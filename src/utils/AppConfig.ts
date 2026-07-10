import { enUS, thTH } from '@clerk/localizations';
import type { LocalizationResource } from '@clerk/shared/types';
import type { LocalePrefixMode } from 'next-intl/routing';

/** Locale prefix strategy for next-intl routing. */
const localePrefix: LocalePrefixMode = 'as-needed';

// FIXME: Customize this configuration for your product
/** Centralized application configuration */
export const AppConfig = {
  name: 'Nextjs Starter',
  i18n: {
    locales: ['en', 'th'],
    defaultLocale: 'en',
    localePrefix,
  },
};

const supportedLocales: Record<string, LocalizationResource> = {
  en: enUS,
  th: thTH,
};

export const ClerkLocalizations = {
  defaultLocale: enUS,
  supportedLocales,
};
