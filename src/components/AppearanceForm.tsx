'use client';

import { useTranslations } from 'next-intl';
import { useActionState } from 'react';
import { updateThemeMode } from '@/app/[locale]/(auth)/settings/appearance/actions';
import type { UpdateThemeModeState } from '@/app/[locale]/(auth)/settings/appearance/actions';

const initialState: UpdateThemeModeState = { status: 'idle' };

const THEME_OPTIONS = ['light', 'dark', 'system'] as const;

export const AppearanceForm = (props: { currentThemeMode: 'light' | 'dark' | 'system' }) => {
  const t = useTranslations('SettingsAppearancePage');
  const [state, formAction, isPending] = useActionState(updateThemeMode, initialState);

  return (
    <form action={formAction} className="max-w-md space-y-4">
      <fieldset className="space-y-2">
        {THEME_OPTIONS.map((option) => (
          <label
            key={option}
            className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
          >
            <input
              className="size-4"
              defaultChecked={props.currentThemeMode === option}
              name="themeMode"
              type="radio"
              value={option}
            />
            {t(`theme_${option}`)}
          </label>
        ))}
      </fieldset>
      <button
        className="rounded-md bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600 disabled:opacity-50"
        disabled={isPending}
        type="submit"
      >
        {t('save_button')}
      </button>
      {state.status === 'success' && (
        <p className="text-sm text-green-600 dark:text-green-400">{t('save_success')}</p>
      )}
    </form>
  );
};
