import { auth } from '@clerk/nextjs/server';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { GalleryForm } from '@/components/gallery/GalleryForm';
import { GalleryList } from '@/components/gallery/GalleryList';
import { listGalleries } from './actions';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'GalleryPage' });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function GalleryPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  const t = await getTranslations({ locale, namespace: 'GalleryPage' });
  const galleries = await listGalleries(userId);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
        {t('meta_title')}
      </h1>
      <GalleryForm />
      <GalleryList items={galleries} />
    </div>
  );
}
