'use client';

import { usePathname } from 'next/navigation';
import { buttonVariants } from '@/components/ui/button';
import { Link } from '@/libs/I18nNavigation';
import { cn } from '@/lib/utils';

type SettingsNavEntry = {
  href: string;
  label: string;
};

export const SettingsNav = (props: { entries: SettingsNavEntry[] }) => {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {props.entries.map((entry) => (
        <Link
          key={entry.href}
          href={entry.href}
          className={cn(
            buttonVariants({ variant: 'ghost' }),
            'w-full justify-start',
            pathname.includes(entry.href.replace(/\/$/, ''))
              ? 'bg-muted'
              : 'hover:bg-transparent hover:underline',
          )}
        >
          {entry.label}
        </Link>
      ))}
    </nav>
  );
};
