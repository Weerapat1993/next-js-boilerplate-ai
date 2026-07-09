import type { Metadata, Viewport } from 'next';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/libs/I18nRouting';
import { getThemeMode } from '@/libs/ThemeMode';
import '@/styles/global.css';

export const metadata: Metadata = {
  icons: [
    {
      rel: 'apple-touch-icon',
      url: '/apple-touch-icon.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '32x32',
      url: '/favicon-32x32.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '16x16',
      url: '/favicon-16x16.png',
    },
    {
      rel: 'icon',
      url: '/favicon.ico',
    },
  ],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const SYSTEM_THEME_SCRIPT = `
if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.documentElement.classList.add('dark');
}
`;

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const themeMode = await getThemeMode();
  const htmlClassName = themeMode === 'dark' ? 'dark' : '';

  return (
    <html lang={locale} className={htmlClassName} suppressHydrationWarning>
      <head>
        {themeMode === 'system' && (
          <script dangerouslySetInnerHTML={{ __html: SYSTEM_THEME_SCRIPT }} />
        )}
      </head>
      <body>
        <NextIntlClientProvider>{props.children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
