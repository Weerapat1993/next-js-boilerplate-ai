'use client';

import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { GalleryForm } from './GalleryForm';

export const GalleryCreateDialog = () => {
  const t = useTranslations('GalleryPage');
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="size-4" />
        {t('add_button')}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('meta_title')}</DialogTitle>
        </DialogHeader>
        <GalleryForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};
