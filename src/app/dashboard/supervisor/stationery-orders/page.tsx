'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { StationeryOrder } from '@/types';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, writeBatch, query, orderBy } from 'firebase/firestore';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppAuth } from '@/components/auth-provider';
import { format, parseISO } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export default function StationeryOrdersPage() {
    const db = useFirestore();
    const { toast } = useToast();
    const { user, loading: authLoading } = useAppAuth();

    const ordersQuery = useMemoFirebase(
        () => (db && !authLoading) ? query(collection(db, 'allStationeryOrders'), orderBy('orderDate', 'desc')) : null,
        [db, authLoading]
    );
    const { data: orders, isLoading: ordersLoading } = useCollection<StationeryOrder>(ordersQuery);

    const handleStatusChange = async (order: StationeryOrder, status: StationeryOrder['status']) => {
        if (!db) return;
        const orderRef = doc(db, 'allStationeryOrders', order.id);
        const userOrderRef = doc(db, 'voyagers', order.voyagerId, 'stationeryOrders', order.originalOrderId!);
        
        try {
            const batch = writeBatch(db);
            batch.update(orderRef, { status: status });
            batch.update(userOrderRef, { status: status });
            await batch.commit();

            toast({
                title: 'Status Updated',
                description: `Order status updated to ${status}.`,
            });
        } catch (error) {
            console.error('Failed to update status:', error);
            toast({ variant: 'destructive', title: 'Update Failed', description: 'Could not update the order status.' });
        }
    };
    
    const getStatusVariant = (status: StationeryOrder['status']) => {
        switch (status) {
            case 'Delivered': return 'secondary';
            case 'Cancelled': return 'destructive';
            default: return 'default';
        }
    };

    const isLoading = authLoading || ordersLoading;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Stationery Orders</CardTitle>
                <CardDescription>View and manage all incoming stationery orders from voyagers.</CardDescription>
            </CardHeader>
            <CardContent>
                 {isLoading ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Items</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}><TableCell colSpan={6}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Items</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders && orders.length > 0 ? (
                                orders.map((order, index) => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-medium">#{orders.length - index}</TableCell>
                                        <TableCell>{format(parseISO(order.orderDate), 'MMM d, h:mm a')}</TableCell>
                                        <TableCell className="font-medium">{order.items.map((item) => `${item.name} (x${item.quantity})`).join(', ')}</TableCell>
                                        <TableCell className="text-right">${order.totalAmount.toFixed(2)}</TableCell>
                                        <TableCell><Badge variant={getStatusVariant(order.status)}>{order.status}</Badge></TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    {(['Pending', 'In Progress', 'Delivered', 'Cancelled'] as StationeryOrder['status'][]).map((status) => (
                                                        <DropdownMenuItem key={status} onClick={() => handleStatusChange(order, status)} disabled={order.status === status}>
                                                            Set as {status}
                                                        </DropdownMenuItem>
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow><TableCell colSpan={6} className="text-center">No orders found.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
};
