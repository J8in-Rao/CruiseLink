'use client';

import { useAppAuth } from '@/components/auth-provider';
import { MyBookings } from '@/components/dashboard/my-bookings';
import { Skeleton } from '@/components/ui/skeleton';

export default function MyBookingsPage() {
  const { user, loading } = useAppAuth();

  if (loading || !user) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return <MyBookings userId={user.uid} />;
}
