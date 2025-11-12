'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { useAppAuth } from '@/components/auth-provider';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarClose,
} from '@/components/ui/sidebar';
import AppLogo from '@/components/app-logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useAuth as useFirebaseAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { SidebarNav } from '@/app/dashboard/admin/sidebar-nav';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAppAuth();
  const auth = useFirebaseAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/');
    }
  }, [user, loading, router]);


  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/');
    }
  };

  const getPageTitle = () => {
    if (pathname === '/dashboard/admin') return 'Admin Dashboard';
    if (pathname.includes('/admin/catering-items')) return 'Catering Item Management';
    if (pathname.includes('/admin/stationery-items')) return 'Stationery Item Management';
    if (pathname.includes('/admin/voyager-management')) return 'Voyager Management';
    if (pathname.includes('/admin/inbox')) return 'Voyager Inbox';
    if (pathname.includes('/admin/movies')) return 'Movie Management';
    if (pathname.includes('/admin/catering-analytics')) return 'Catering Analytics';
    if (pathname.includes('/admin/catering-orders')) return 'Catering Orders';
    if (pathname.includes('/admin/inventory-status')) return 'Inventory Management';
    if (pathname.includes('/supervisor/stationery-orders')) return 'Stationery Orders';
    if (pathname.includes('/supervisor/stationery-inventory')) return 'Stationery Inventory';
    if (pathname.includes('/supervisor/stationery-items')) return 'Stationery Items';
    if (pathname.includes('/supervisor/stationery-analytics')) return 'Stationery Analytics';
    if (pathname.includes('/manager/movies')) return 'Movie Bookings';
    if (pathname.includes('/manager/salon')) return 'Salon Bookings';
    if (pathname.includes('/manager/fitness')) return 'Fitness Bookings';
    if (pathname.includes('/manager/party-hall')) return 'Party Hall Bookings';
    if (pathname.includes('/manager/analytics')) return 'Booking Analytics';
    if (pathname.includes('/manager')) {
        if (user?.role === 'manager') return 'Manager Dashboard';
    }
    if (pathname.includes('catering')) return 'Catering';
    if (pathname.includes('stationery')) return 'Stationery & Gifts';
    if (pathname.includes('movies')) return 'Movie Tickets';
    if (pathname.includes('salon')) return 'Beauty Salon';
    if (pathname.includes('fitness')) return 'Fitness Center';
    if (pathname.includes('party-hall')) return 'Party Hall';
    if (pathname.includes('my-bookings')) return 'My Bookings';
    if (pathname.includes('my-orders')) return 'My Orders';
    if (pathname.includes('profile')) return 'Profile Settings';
    if (pathname.includes('help')) return 'Help Center';
    return 'Dashboard';
  };

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <AppLogo size="lg" />
          <p className="text-muted-foreground">Loading your voyage details...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <AppLogo size="sm" className="text-white" />
           <SidebarClose />
        </SidebarHeader>
        <SidebarContent asChild>
          <ScrollArea className="flex-1 p-2">
            <SidebarNav role={user.role} />
          </ScrollArea>
        </SidebarContent>
        <SidebarFooter className="border-t border-sidebar-border">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Sign Out" onClick={handleSignOut}>
                <LogOut />
                <span>Sign Out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <Link href="/dashboard/profile" className="flex items-center gap-3 p-2 rounded-md hover:bg-sidebar-accent transition-colors">
            <Avatar className="h-9 w-9">
              <AvatarImage src={`https://picsum.photos/seed/${user.uid}/40/40`} alt={user.name || ''} />
              <AvatarFallback>{user.name?.charAt(0).toUpperCase() || 'V'}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-sm font-medium">{user.name}</span>
              <span className="truncate text-xs text-sidebar-foreground/70">{user.email}</span>
            </div>
          </Link>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center justify-between border-b bg-card px-4 lg:px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden" />
            <h1 className="text-lg font-semibold">{getPageTitle()}</h1>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
