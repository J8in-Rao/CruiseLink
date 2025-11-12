'use client';

import { useAppAuth } from '@/components/auth-provider';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { CateringOrder, StationeryOrder } from '@/types';
import { collection, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { format, parseISO } from 'date-fns';
import { UtensilsCrossed, BookMarked, ReceiptText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const CateringOrdersTab = ({ userId }: { userId: string }) => {
    const db = useFirestore();
    const queryRef = useMemoFirebase(() => {
        if (!db || !userId) return null;
        return query(collection(db, 'voyagers', userId, 'cateringOrders'), orderBy('orderDate', 'desc'));
    }, [db, userId]);
    const { data: orders, isLoading } = useCollection<CateringOrder>(queryRef);

    if (isLoading) return <Skeleton className="h-48 w-full" />;

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {orders && orders.length > 0 ? orders.map(order => (
                    <TableRow key={order.id}>
                        <TableCell>{format(parseISO(order.orderDate), 'MMM d, h:mm a')}</TableCell>
                        <TableCell>{order.items.map(item => `${item.name} (x${item.quantity})`).join(', ')}</TableCell>
                        <TableCell className="text-right">${order.totalAmount.toFixed(2)}</TableCell>
                        <TableCell><Badge variant={order.status === 'Delivered' ? 'secondary' : 'default'}>{order.status}</Badge></TableCell>
                    </TableRow>
                )) : <TableRow><TableCell colSpan={4} className="text-center">No catering orders found.</TableCell></TableRow>}
            </TableBody>
        </Table>
    );
};

const StationeryOrdersTab = ({ userId }: { userId: string }) => {
    const db = useFirestore();
    const queryRef = useMemoFirebase(() => {
        if (!db || !userId) return null;
        return query(collection(db, 'voyagers', userId, 'stationeryOrders'), orderBy('orderDate', 'desc'));
    }, [db, userId]);
    const { data: orders, isLoading } = useCollection<StationeryOrder>(queryRef);

    if (isLoading) return <Skeleton className="h-48 w-full" />;

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {orders && orders.length > 0 ? orders.map(order => (
                    <TableRow key={order.id}>
                        <TableCell>{format(parseISO(order.orderDate), 'MMM d, h:mm a')}</TableCell>
                        <TableCell>{order.items.map(item => `${item.name} (x${item.quantity})`).join(', ')}</TableCell>
                        <TableCell className="text-right">${order.totalAmount.toFixed(2)}</TableCell>
                        <TableCell><Badge variant={order.status === 'Delivered' ? 'secondary' : 'default'}>{order.status}</Badge></TableCell>
                    </TableRow>
                )) : <TableRow><TableCell colSpan={4} className="text-center">No stationery orders found.</TableCell></TableRow>}
            </TableBody>
        </Table>
    );
};

export default function MyOrdersPage() {
    const { user, loading } = useAppAuth();

    if (loading || !user) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-1/4" />
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ReceiptText className="h-5 w-5" />
                    <span>My Orders</span>
                </CardTitle>
                <CardDescription>A complete history of your catering and stationery orders.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="catering">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="catering"><UtensilsCrossed className="h-4 w-4 mr-2" />Catering</TabsTrigger>
                        <TabsTrigger value="stationery"><BookMarked className="h-4 w-4 mr-2" />Stationery</TabsTrigger>
                    </TabsList>
                    <TabsContent value="catering" className="mt-4">
                        <CateringOrdersTab userId={user.uid} />
                    </TabsContent>
                    <TabsContent value="stationery" className="mt-4">
                        <StationeryOrdersTab userId={user.uid} />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
