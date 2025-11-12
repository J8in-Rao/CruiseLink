'use client';

import {
  BedDouble,
  CalendarDays,
  ReceiptText,
  Ship,
  Utensils,
  BookMarked,
  ArrowRight,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';

import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { UserProfile, CateringOrder, StationeryOrder } from '@/types';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { MyBookings } from '@/components/dashboard/my-bookings';
import { Button } from '@/components/ui/button';

type VoyagerDashboardProps = {
  user: UserProfile | null;
  loading: boolean;
};

function RecentOrders({ userId }: { userId: string }) {
  const db = useFirestore();

  const cateringQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'voyagers', userId, 'cateringOrders'), orderBy('orderDate', 'desc'), limit(3));
  }, [db, userId]);

  const stationeryQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'voyagers', userId, 'stationeryOrders'), orderBy('orderDate', 'desc'), limit(3));
  }, [db, userId]);

  const { data: cateringOrders, isLoading: cateringLoading } = useCollection<CateringOrder>(cateringQuery);
  const { data: stationeryOrders, isLoading: stationeryLoading } = useCollection<StationeryOrder>(stationeryQuery);

  const combinedOrders = [
    ...(cateringOrders || []).map(o => ({ ...o, type: 'Catering' })),
    ...(stationeryOrders || []).map(o => ({ ...o, type: 'Stationery' })),
  ].sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()).slice(0, 3);
  
  const isLoading = cateringLoading || stationeryLoading;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ReceiptText className="h-5 w-5" />
          <span>Recent Activity</span>
        </CardTitle>
        <CardDescription>Your latest orders and bookings.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : combinedOrders.length > 0 ? (
          <div className="space-y-4">
            {combinedOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-4">
                  {order.type === 'Catering' ? <Utensils className="h-6 w-6 text-muted-foreground" /> : <BookMarked className="h-6 w-6 text-muted-foreground" />}
                  <div>
                    <p className="font-semibold">{order.items.length} item{order.items.length > 1 ? 's' : ''} - {order.type} Order</p>
                    <p className="text-sm text-muted-foreground">
                      {format(parseISO(order.orderDate), 'MMM d, yyyy, h:mm a')}
                    </p>
                  </div>
                </div>
                 <div className="text-right">
                    <p className="font-bold">${order.totalAmount.toFixed(2)}</p>
                    <Badge variant={order.status === 'Delivered' ? 'secondary' : 'default'}>{order.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-4">No recent activity.</p>
        )}
      </CardContent>
      <CardFooter>
          <Button asChild variant="outline" className="w-full">
            <Link href="/dashboard/my-orders">
              View All Orders <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
      </CardFooter>
    </Card>
  )
}

export default function VoyagerDashboard({ user, loading }: VoyagerDashboardProps) {
  if (loading || !user) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
           <Skeleton className="h-32" />
           <Skeleton className="h-32" />
        </div>
         <Skeleton className="h-64" />
         <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Welcome, {user.name}!
          </h2>
          <p className="text-muted-foreground">
            Here's your personal dashboard for the voyage.
          </p>
        </div>
        <Card className="flex items-center gap-3 p-3">
            <Ship className="h-8 w-8 text-primary" />
            <div>
                <p className="text-sm text-muted-foreground">Your Ship</p>
                <p className="font-bold">Starlight Voyager</p>
            </div>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Room Number</CardTitle>
            <BedDouble className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.roomNumber || 'TBD'}</div>
            <p className="text-xs text-muted-foreground">Your home on the seas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Stay Dates</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
                {user.stayStartDate ? format(parseISO(user.stayStartDate), 'MMM d, yyyy') : 'N/A'}
                 - {user.stayEndDate ? format(parseISO(user.stayEndDate), 'MMM d, yyyy') : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">Duration of your voyage</p>
          </CardContent>
        </Card>
      </div>

      <MyBookings userId={user.uid} isPreview={true} />

      <RecentOrders userId={user.uid} />

    </div>
  );
}
