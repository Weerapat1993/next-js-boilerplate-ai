'use client';

import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Link } from '@/libs/I18nNavigation';
import { AppConfig } from '@/utils/AppConfig';

type NavEntry = {
  href: string;
  label: string;
};

const isActive = (pathname: string, href: string): boolean => {
  if (href === '/') {
    return pathname.split('/').filter(Boolean).length === 1;
  }
  return pathname.includes(href.replace(/\/$/, ''));
};

const NavLinks = (props: { pathname: string; entries: NavEntry[]; onLinkClick?: () => void }) => (
  <ul className="space-y-0.5 px-2">
    {props.entries.map((entry) => (
      <li key={entry.href}>
        <Link
          href={entry.href}
          onClick={props.onLinkClick}
          className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            isActive(props.pathname, entry.href)
              ? 'bg-blue-50 text-[#0066CC] dark:bg-blue-950/40 dark:text-[#4DA3FF]'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'
          }`}
        >
          {entry.label}
        </Link>
      </li>
    ))}
  </ul>
);

export const SidebarNav = (props: { footerSlot?: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const t = useTranslations('Navigation');
  const pathname = usePathname();
  const navEntries: NavEntry[] = [
    { href: '/', label: t('home') },
    { href: '/about/', label: t('about') },
    { href: '/counter/', label: t('counter') },
    { href: '/portfolio/', label: t('portfolio') },
    { href: '/dashboard/', label: t('dashboard') },
    { href: '/settings/appearance/', label: t('settings_appearance') },
  ];

  const appName = (
    <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
      {AppConfig.name}
    </span>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center border-b border-gray-200 bg-white px-4 py-3 md:hidden dark:border-gray-700 dark:bg-gray-950">
        <button
          type="button"
          aria-label="Open navigation"
          onClick={() => setOpen(true)}
          className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          <svg
            className="size-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <div className="ml-3">{appName}</div>
      </div>

      {/* Mobile drawer overlay */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
              {appName}
              <button
                type="button"
                aria-label="Close navigation"
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                <svg
                  className="size-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-4">
              <NavLinks
                entries={navEntries}
                pathname={pathname}
                onLinkClick={() => setOpen(false)}
              />
            </nav>
            {props.footerSlot && (
              <div className="border-t border-gray-200 px-4 py-3 dark:border-gray-700">
                {props.footerSlot}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-gray-200 bg-white md:flex dark:border-gray-700 dark:bg-gray-950">
        <div className="border-b border-gray-200 px-4 py-5 dark:border-gray-700">{appName}</div>
        <nav className="flex-1 overflow-y-auto py-4">
          <NavLinks entries={navEntries} pathname={pathname} />
        </nav>
        {props.footerSlot && (
          <div className="border-t border-gray-200 px-4 py-3 dark:border-gray-700">
            {props.footerSlot}
          </div>
        )}
      </aside>
    </>
  );
};
