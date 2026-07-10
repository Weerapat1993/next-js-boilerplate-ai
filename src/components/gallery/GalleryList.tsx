'use client';

import { useTranslations } from 'next-intl';
import { useActionState, useEffect, useState } from 'react';
import type { GalleryActionState } from '@/app/[locale]/(auth)/gallery/actions';
import { deleteGallery, updateGallery } from '@/app/[locale]/(auth)/gallery/actions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const initialState: GalleryActionState = { status: 'idle' };

type GalleryItem = {
  id: string;
  title: string;
  imageUrl: string;
};

const DeleteButton = (props: { id: string }) => {
  const t = useTranslations('GalleryPage');
  const [state, formAction, isPending] = useActionState(
    (_prevState: GalleryActionState) => deleteGallery(props.id),
    initialState,
  );

  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button type="button" variant="destructive" size="sm" disabled={isPending} />}>
        {t('delete_button')}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('delete_confirm_title')}</AlertDialogTitle>
          <AlertDialogDescription>{t('delete_confirm_description')}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('cancel_button')}</AlertDialogCancel>
          <form action={formAction}>
            <AlertDialogAction type="submit" variant="destructive" disabled={isPending}>
              {t('delete_button')}
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
      {state.status === 'error' && <p className="text-sm text-destructive">{t('delete_error')}</p>}
    </AlertDialog>
  );
};

const EditForm = (props: { item: GalleryItem; onCancel: () => void; onSaved: () => void }) => {
  const t = useTranslations('GalleryPage');
  const [state, formAction, isPending] = useActionState(updateGallery, initialState);

  // Synchronizes with the server action's result to collapse the parent's edit
  // mode. Calling a parent's state setter during render is not sanctioned by
  // React (only a component's own derived state may be adjusted mid-render),
  // so this reacts to the action outcome in an effect instead.
  useEffect(() => {
    if (state.status === 'success') {
      props.onSaved();
    }
  }, [state.status]);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="id" value={props.item.id} />
      <div className="space-y-1">
        <label htmlFor={`title-${props.item.id}`} className="text-sm font-medium">
          {t('title_label')}
        </label>
        <Input
          id={`title-${props.item.id}`}
          name="title"
          required
          maxLength={120}
          defaultValue={props.item.title}
        />
      </div>
      <div className="space-y-1">
        <label htmlFor={`image-${props.item.id}`} className="text-sm font-medium">
          {t('image_label')}
        </label>
        <Input
          id={`image-${props.item.id}`}
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isPending}>
          {t('save_button')}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={props.onCancel}
          disabled={isPending}
        >
          {t('cancel_button')}
        </Button>
      </div>
      {state.status === 'error' && <p className="text-sm text-destructive">{t('save_error')}</p>}
    </form>
  );
};

const GalleryCard = (props: { item: GalleryItem }) => {
  const t = useTranslations('GalleryPage');
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <Card className="space-y-2 p-4">
        <EditForm
          item={props.item}
          onCancel={() => setIsEditing(false)}
          onSaved={() => setIsEditing(false)}
        />
      </Card>
    );
  }

  return (
    <Card className="space-y-2 p-4">
      {/* eslint-disable-next-line @next/next/no-img-element -- external Supabase-hosted URL */}
      <img
        src={props.item.imageUrl}
        alt={props.item.title}
        className="aspect-square w-full rounded-md object-cover"
      />
      <p className="text-sm font-medium">{props.item.title}</p>
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(true)}>
          {t('edit_button')}
        </Button>
        <DeleteButton id={props.item.id} />
      </div>
    </Card>
  );
};

export const GalleryList = (props: { items: GalleryItem[] }) => {
  const t = useTranslations('GalleryPage');

  if (props.items.length === 0) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">{t('empty_state')}</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {props.items.map((item) => (
        <GalleryCard key={item.id} item={item} />
      ))}
    </div>
  );
};
