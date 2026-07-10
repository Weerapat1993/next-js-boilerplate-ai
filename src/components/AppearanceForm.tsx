'use client';

import { Moon, Sun } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { startTransition, useActionState, useState } from 'react';
import { updateThemeMode } from '@/app/[locale]/(auth)/settings/actions';
import type { UpdateThemeModeState } from '@/app/[locale]/(auth)/settings/actions';
import { ButtonGroup } from '@/components/ui/button-group';
import { Button } from '@/components/ui/button';

const initialState: UpdateThemeModeState = { status: 'idle' };

const THEME_OPTIONS = [
  { value: 'light', icon: Sun },
  { value: 'dark', icon: Moon },
] as const;

const applyThemeClass = (mode: 'light' | 'dark') => {
  document.documentElement.classList.toggle('dark', mode === 'dark');
};

export const AppearanceForm = (props: { currentThemeMode: 'light' | 'dark' }) => {
  const t = useTranslations('SettingsAppearancePage');
  const [state, formAction, isPending] = useActionState(updateThemeMode, initialState);
  const [themeMode, setThemeMode] = useState(props.currentThemeMode);

  const selectTheme = (mode: 'light' | 'dark') => {
    setThemeMode(mode);
    applyThemeClass(mode);

    const formData = new FormData();
    formData.append('themeMode', mode);
    startTransition(() => formAction(formData));
  };

  return (
    <div className="max-w-md space-y-2">
      <ButtonGroup>
        {THEME_OPTIONS.map((option) => (
          <Button
            key={option.value}
            aria-pressed={themeMode === option.value}
            disabled={isPending}
            onClick={() => selectTheme(option.value)}
            size="sm"
            type="button"
            variant={themeMode === option.value ? 'default' : 'outline'}
          >
            <option.icon />
            {t(`theme_${option.value}`)}
          </Button>
        ))}
      </ButtonGroup>
      {state.status === 'success' && (
        <p className="text-sm text-green-600 dark:text-green-400">{t('save_success')}</p>
      )}
      {state.status === 'error' && (
        <p className="text-sm text-destructive">{t('save_error')}</p>
      )}
    </div>
  );
};
