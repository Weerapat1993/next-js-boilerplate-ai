'use client';

import { useTranslations } from 'next-intl';
import { useActionState, useState } from 'react';
import { updateThemeMode } from '@/app/[locale]/(auth)/settings/actions';
import type { UpdateThemeModeState } from '@/app/[locale]/(auth)/settings/actions';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const initialState: UpdateThemeModeState = { status: 'idle' };

const THEME_OPTIONS = ['light', 'dark', 'system'] as const;

export const AppearanceForm = (props: { currentThemeMode: 'light' | 'dark' | 'system' }) => {
  const t = useTranslations('SettingsAppearancePage');
  const [state, formAction, isPending] = useActionState(updateThemeMode, initialState);
  const [themeMode, setThemeMode] = useState(props.currentThemeMode);

  return (
    <form action={formAction} className="max-w-md space-y-4">
      <RadioGroup value={themeMode} onValueChange={setThemeMode} name="themeMode" className="gap-3">
        {THEME_OPTIONS.map((option) => (
          <div key={option} className="flex items-center gap-2">
            <RadioGroupItem value={option} id={`theme-${option}`} />
            <Label htmlFor={`theme-${option}`}>{t(`theme_${option}`)}</Label>
          </div>
        ))}
      </RadioGroup>
      <Button disabled={isPending} type="submit">
        {t('save_button')}
      </Button>
      {state.status === 'success' && (
        <p className="text-sm text-green-600 dark:text-green-400">{t('save_success')}</p>
      )}
    </form>
  );
};
