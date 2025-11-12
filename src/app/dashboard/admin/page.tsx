'use client';

import { Suspense, lazy } from 'react';
import { useAppAuth } from '@/components/auth-provider';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const AdminAnalyticsPage = lazy(() => import('@/app/dashboard/admin/analytics/page'));
const SupervisorDashboard = lazy(() => import('@/components/dashboard/supervisor-dashboard'));

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-1/4" />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-40 rounded-lg" />
        <Skeleton className="h-40 rounded-lg" />
        <Skeleton className="h-40 rounded-lg" />
      </div>
      <Skeleton className="h-96" />
    </div>
  );
}

function AdminDashboardPage() {
  const { user, loading } = useAppAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'supervisor') {
         // Supervisors have a different view, handled below.
      } else if (user.role === 'admin') {
         // Admins will see the analytics page.
      } else {
        // Redirect other roles if they land here by mistake.
        router.replace('/dashboard');
      }
    }
  }, [user, loading, router]);
  
  if (loading || !user) {
    return <DashboardSkeleton />;
  }

  if (user.role === 'supervisor') {
    return (
      <Suspense fallback={<DashboardSkeleton />}>
        <SupervisorDashboard />
      </Suspense>
    );
  }

  // Default to Admin Analytics View
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <AdminAnalyticsPage />
    </Suspense>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <AdminDashboardPage />
    </Suspense>
  )
}