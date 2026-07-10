import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata, Viewport } from 'next';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Instrument_Sans } from 'next/font/google';
import { notFound } from 'next/navigation';
import { routing } from '@/libs/I18nRouting';
import { getThemeMode } from '@/libs/ThemeMode';
import { ClerkLocalizations } from '@/utils/AppConfig';
import '@/styles/global.css';

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
});

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
  const clerkLocale =
    ClerkLocalizations.supportedLocales[locale] ?? ClerkLocalizations.defaultLocale;

  return (
    <html
      lang={locale}
      className={`${htmlClassName} ${instrumentSans.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ClerkProvider
          appearance={{
            cssLayerName: 'clerk', // Ensure Clerk is compatible with Tailwind CSS v4
          }}
          localization={clerkLocale}
          signInUrl="/sign-in"
          signUpUrl="/sign-up"
          signInFallbackRedirectUrl="/dashboard"
          signUpFallbackRedirectUrl="/dashboard"
          afterSignOutUrl="/"
        >
          <NextIntlClientProvider>{props.children}</NextIntlClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
