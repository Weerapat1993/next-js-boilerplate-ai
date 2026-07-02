import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

type PortfolioPageProps = {
  params: Promise<{ locale: string }>;
};

const PORTFOLIO_ITEMS = [
  {
    title: 'Authentication System',
    description: 'Passwordless and social login with Clerk, including multi-factor auth.',
    tag: 'Auth',
  },
  {
    title: 'Database Layer',
    description: 'Type-safe ORM with DrizzleORM. Local PGlite in dev, Neon in production.',
    tag: 'Database',
  },
  {
    title: 'Internationalization',
    description: 'Multi-language routing with next-intl supporting English and French.',
    tag: 'i18n',
  },
  {
    title: 'Form Validation',
    description: 'React Hook Form with Zod schema validation and accessible error messages.',
    tag: 'Forms',
  },
  {
    title: 'Testing Suite',
    description: 'Unit tests with Vitest, component tests with RTL, E2E with Playwright.',
    tag: 'Testing',
  },
  {
    title: 'Security & Rate Limiting',
    description: 'Bot detection and rate limiting powered by Arcjet middleware.',
    tag: 'Security',
  },
] as const;

export async function generateMetadata(props: PortfolioPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'Portfolio' });
  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function PortfolioPage(props: PortfolioPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Portfolio' });

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
        {t('meta_title')}
      </h1>
      <p className="mb-8 text-base text-gray-500 dark:text-gray-400">
        {t('meta_description')}
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PORTFOLIO_ITEMS.map((item) => (
          <div
            key={item.title}
            className="flex flex-col rounded-lg border border-gray-200 p-5 dark:border-gray-700"
          >
            <span className="mb-3 inline-block self-start rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-[#0066CC] dark:bg-blue-950/40 dark:text-[#4DA3FF]">
              {item.tag}
            </span>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {item.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
