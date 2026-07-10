'use client';

import { Globe } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePathname, useRouter } from '@/libs/I18nNavigation';
import { routing } from '@/libs/I18nRouting';

const localeLabels: Record<string, string> = {
  en: 'English',
  th: 'ไทย',
};

export const LocaleSwitcher = () => {
  const t = useTranslations('LocaleSwitcher');
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const handleChange = (newLocale: string) => {
    if (newLocale === locale) {
      return;
    }

    const { search } = window.location;
    router.push(`${pathname}${search}`, { locale: newLocale, scroll: false });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="outline" size="sm" aria-label={t('change_language')} />}
      >
        <Globe />
        {localeLabels[locale] ?? locale.toUpperCase()}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        <DropdownMenuRadioGroup value={locale} onValueChange={handleChange}>
          {routing.locales.map((elt) => (
            <DropdownMenuRadioItem key={elt} value={elt}>
              {localeLabels[elt] ?? elt.toUpperCase()}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
