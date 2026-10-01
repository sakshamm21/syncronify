import { CalendarDays, Compass, Home, Map, Megaphone, MessagesSquare, Settings, ShieldCheck, StickyNote, type LucideIcon } from 'lucide-react';
import type { Role } from '@/lib/api';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Only shown to these roles; omitted means everyone. */
  roles?: Role[];
}

export const NAV_SECTIONS: { title?: string; items: NavItem[] }[] = [
  {
    items: [
      { href: '/dashboard', label: 'Home', icon: Home },
      { href: '/explore', label: 'Explore', icon: Compass },
      { href: '/schedule', label: 'Schedule', icon: CalendarDays },
      { href: '/chat', label: 'Chats', icon: MessagesSquare },
      { href: '/notes', label: 'Notes', icon: StickyNote },
      { href: '/map', label: 'Venue map', icon: Map },
    ],
  },
  {
    title: 'Manage',
    items: [
      { href: '/organizer', label: 'Organizer', icon: Megaphone, roles: ['organizer', 'admin'] },
      { href: '/admin', label: 'Admin', icon: ShieldCheck, roles: ['admin'] },
    ],
  },
];

export const SETTINGS_ITEM: NavItem = { href: '/settings', label: 'Settings', icon: Settings };

export function visibleSections(role: Role | undefined) {
  return NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => !item.roles || (role && item.roles.includes(role))),
  })).filter((section) => section.items.length > 0);
}

export const isActive = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);
