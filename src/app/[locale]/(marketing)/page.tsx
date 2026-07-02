import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

type IndexPageProps = {
  params: Promise<{ locale: string }>;
};

const FEATURES = [
  { emoji: '🚀', title: 'Next.js App Router', description: 'Latest App Router with server components and streaming.' },
  { emoji: '🔥', title: 'TypeScript', description: 'Full type safety across the entire codebase.' },
  { emoji: '💎', title: 'Tailwind CSS v4', description: 'Utility-first styling with the latest Tailwind.' },
  { emoji: '🔒', title: 'Clerk Auth', description: 'Passwordless, social, and multi-factor authentication.' },
  { emoji: '📦', title: 'DrizzleORM', description: 'Type-safe ORM with PostgreSQL, SQLite, and MySQL.' },
  { emoji: '🌐', title: 'next-intl', description: 'Multi-language support with locale-aware routing.' },
  { emoji: '🔴', title: 'Form validation', description: 'React Hook Form + Zod for robust forms.' },
  { emoji: '🦺', title: 'Testing suite', description: 'Vitest, React Testing Library, and Playwright.' },
  { emoji: '🤖', title: 'SEO ready', description: 'Metadata, JSON-LD, Open Graph, and sitemap.' },
] as const;

export async function generateMetadata(props: IndexPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'Index' });
  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function IndexPage(props: IndexPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'HomePage' });

  return (
    <div>
      <section className="border-b border-gray-200 pb-10 dark:border-gray-800">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          {t('hero_title')}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-gray-500 dark:text-gray-400">
          {t('hero_subtitle')}
        </p>
        <div className="mt-6">
          <a
            href="https://github.com/ixartz/Next-js-Boilerplate"
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center rounded-md bg-[#0066CC] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0055AA] focus:outline-none focus:ring-2 focus:ring-[#0066CC]/50"
          >
            {t('hero_cta')}
          </a>
        </div>
      </section>

      <section className="pt-10">
        <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-gray-100">
          {t('feature_grid_title')}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
            >
              <div className="mb-2 text-xl">{feature.emoji}</div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {feature.title}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
