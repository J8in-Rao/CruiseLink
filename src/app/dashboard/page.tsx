'use client';

import { useAppAuth } from '@/components/auth-provider';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { useEffect, Suspense, lazy } from 'react';

const AdminDashboard = lazy(() => import('@/app/dashboard/admin/page'));
const VoyagerDashboard = lazy(() => import('@/app/dashboard/voyager-dashboard'));


export default function DashboardPage() {
  const { user, loading } = useAppAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace('/');
      return;
    }

    if (user.role === 'head-cook') {
      router.replace('/dashboard/admin/catering-orders');
      return;
    }
    
    if (user.role === 'supervisor') {
      router.replace('/dashboard/supervisor/stationery-orders');
      return;
    }

    if (user.role === 'manager') {
      router.replace('/dashboard/manager/analytics');
      return;
    }

    if (user.role === 'admin') {
       router.replace('/dashboard/admin');
       return;
    }

  }, [user, loading, router]);


  if (loading || !user || user.role !== 'voyager') {
    return <DashboardSkeleton />;
  }
  
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <VoyagerDashboard user={user} loading={loading} />
    </Suspense>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-1/4" />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-40 rounded-lg" />
        <Skeleton className="h-40 rounded-lg" />
        <Skeleton className="h-40 rounded-lg" />
        <Skeleton className="h-40 rounded-lg" />
        <Skeleton className="h-40 rounded-lg" />
        <Skeleton className="h-40 rounded-lg" />
      </div>
    </div>
  );
}
