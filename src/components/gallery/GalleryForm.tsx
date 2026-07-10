'use client';

import { useTranslations } from 'next-intl';
import { useActionState } from 'react';
import type { GalleryActionState } from '@/app/[locale]/(auth)/gallery/actions';
import { createGallery } from '@/app/[locale]/(auth)/gallery/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const initialState: GalleryActionState = { status: 'idle' };

export const GalleryForm = () => {
  const t = useTranslations('GalleryPage');
  const [state, formAction, isPending] = useActionState(createGallery, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <div className="space-y-1">
        <label htmlFor="title" className="text-sm font-medium">
          {t('title_label')}
        </label>
        <Input id="title" name="title" required maxLength={120} />
      </div>
      <div className="space-y-1">
        <label htmlFor="image" className="text-sm font-medium">
          {t('image_label')}
        </label>
        <Input
          id="image"
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          required
        />
      </div>
      <Button type="submit" disabled={isPending}>
        {t('create_button')}
      </Button>
      {state.status === 'error' && <p className="text-sm text-destructive">{t('save_error')}</p>}
      {state.status === 'success' && (
        <p className="text-sm text-green-600 dark:text-green-400">{t('save_success')}</p>
      )}
    </form>
  );
};
