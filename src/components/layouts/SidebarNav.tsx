'use client';

import { Boxes, Briefcase, Hash, Home, Info, LayoutDashboard } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { Link } from '@/libs/I18nNavigation';
import { AppConfig } from '@/utils/AppConfig';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '../ui/sidebar';

type NavEntry = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const isActive = (pathname: string, href: string): boolean => {
  if (href === '/') {
    return pathname.split('/').filter(Boolean).length === 1;
  }
  return pathname.includes(href.replace(/\/$/, ''));
};

export const SidebarNav = (props: { footerSlot?: React.ReactNode }) => {
  const t = useTranslations('Navigation');
  const pathname = usePathname();
  const navEntries: NavEntry[] = [
    { href: '/', label: t('home'), icon: Home },
    { href: '/about/', label: t('about'), icon: Info },
    { href: '/counter/', label: t('counter'), icon: Hash },
    { href: '/portfolio/', label: t('portfolio'), icon: Briefcase },
    { href: '/dashboard/', label: t('dashboard'), icon: LayoutDashboard },
  ];

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Boxes className="size-4" />
              </div>
              <span className="truncate font-semibold">{AppConfig.name}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t('group_platform')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navEntries.map((entry) => (
                <SidebarMenuItem key={entry.href}>
                  <SidebarMenuButton
                    render={<Link href={entry.href} />}
                    isActive={isActive(pathname, entry.href)}
                    tooltip={entry.label}
                  >
                    <entry.icon className="size-4" />
                    <span>{entry.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {props.footerSlot && <SidebarFooter>{props.footerSlot}</SidebarFooter>}
      <SidebarRail />
    </Sidebar>
  );
};
