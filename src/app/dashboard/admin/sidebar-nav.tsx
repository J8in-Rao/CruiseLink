'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  UtensilsCrossed,
  BookMarked,
  Film,
  Scissors,
  Dumbbell,
  PartyPopper,
  Shield,
  ChefHat,
  ClipboardCheck,
  AreaChart,
  LifeBuoy,
  Mail,
  Boxes,
  Briefcase,
  CalendarCheck,
  ReceiptText,
  Users,
} from 'lucide-react';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { useEffect } from 'react';
import type { UserRole } from '@/types';

type SidebarNavProps = {
  role: UserRole;
};

const navItems = {
  voyager: [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/dashboard/catering', icon: UtensilsCrossed, label: 'Catering' },
    { href: '/dashboard/stationery', icon: BookMarked, label: 'Stationery' },
    { href: '/dashboard/movies', icon: Film, label: 'Movies' },
    { href: '/dashboard/salon', icon: Scissors, label: 'Beauty Salon' },
    { href: '/dashboard/fitness', icon: Dumbbell, label: 'Fitness Center' },
    { href: '/dashboard/party-hall', icon: PartyPopper, label: 'Party Hall' },
    { href: '/dashboard/my-bookings', icon: CalendarCheck, label: 'My Bookings' },
    { href: '/dashboard/my-orders', icon: ReceiptText, label: 'My Orders' },
    { href: '/dashboard/help', icon: LifeBuoy, label: 'Help Center' },
  ],
  admin: [
    { href: '/dashboard/admin', icon: Shield, label: 'Admin Dashboard' },
    { href: '/dashboard/admin/catering-items', icon: UtensilsCrossed, label: 'Catering Items' },
    { href: '/dashboard/admin/stationery-items', icon: BookMarked, label: 'Stationery Items' },
    { href: '/dashboard/admin/movies', icon: Film, label: 'Movie Management' },
    { href: '/dashboard/admin/voyager-management', icon: Users, label: 'Voyager Management' },
    { href: '/dashboard/admin/inbox', icon: Mail, label: 'Inbox' },
  ],
  'head-cook': [
    { href: '/dashboard/admin/catering-orders', icon: ClipboardCheck, label: 'Catering Orders' },
    { href: '/dashboard/admin/inventory-status', icon: Boxes, label: 'Inventory Management' },
    { href: '/dashboard/admin/catering-analytics', icon: AreaChart, label: 'Catering Analytics' },
  ],
  supervisor: [
    { href: '/dashboard/supervisor/stationery-orders', icon: ClipboardCheck, label: 'Stationery Orders' },
    { href: '/dashboard/supervisor/stationery-inventory', icon: Boxes, label: 'Inventory Management' },
    { href: '/dashboard/supervisor/stationery-analytics', icon: AreaChart, label: 'Stationery Analytics' },
  ],
  manager: [
    { href: '/dashboard/manager/analytics', icon: AreaChart, label: 'Booking Analytics' },
    { href: '/dashboard/manager/movies', icon: Film, label: 'Movie Bookings' },
    { href: '/dashboard/admin/movies', icon: Film, label: 'Movie Management' },
    { href: '/dashboard/manager/salon', icon: Scissors, label: 'Salon Bookings' },
    { href: '/dashboard/manager/fitness', icon: Dumbbell, label: 'Fitness Bookings' },
    { href: '/dashboard/manager/party-hall', icon: PartyPopper, label: 'Party Hall Bookings' },
  ],
};

export function SidebarNav({ role }: SidebarNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const items = navItems[role] || [];

  useEffect(() => {
    // Prefetch all navigation links on component mount
    items.forEach(item => {
      router.prefetch(item.href);
    });
  }, [items, router]);

  const isActive = (href: string) => {
    const currentPath = pathname;
    
    // Exact match for the main dashboard link to avoid matching sub-pages
    if (href === '/dashboard' || href === '/dashboard/admin') {
      return currentPath === href;
    }

    // For other links, check if the path starts with the href
    return currentPath.startsWith(href);
  };

  return (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.label}>
          <SidebarMenuButton href={item.href} tooltip={item.label} isActive={isActive(item.href)}>
            <item.icon />
            <span>{item.label}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
