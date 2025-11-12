'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { StationeryItem, StationeryOrder } from '@/types';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, deleteDoc, writeBatch, query, orderBy } from 'firebase/firestore';
import { PlusCircle, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AddItemDialog } from '@/components/dashboard/add-item-dialog';
import { useState, Suspense } from 'react';
import { useAppAuth } from '@/components/auth-provider';
import { format, parseISO } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useSearchParams } from 'next/navigation';

const StationeryOrdersTab = () => {
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

    if (isLoading) {
      return (
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
      );
    }

    return (
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
    );
};


function SupervisorDashboardPage() {
  const { user, loading } = useAppAuth();
  const db = useFirestore();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') || 'stationery_orders';

  const stationeryItemsQuery = useMemoFirebase(() => db ? collection(db, 'stationeryItems') : null, [db]);

  const { data: stationeryItems, isLoading: stationeryLoading } = useCollection<StationeryItem>(stationeryItemsQuery);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContext, setDialogContext] = useState<{ type: 'stationery'; item?: StationeryItem } | null>(null);

  const openAddItemDialog = () => {
    setDialogContext({ type: 'stationery' });
    setDialogOpen(true);
  };
  
  const openEditItemDialog = (item: StationeryItem) => {
    setDialogContext({ type: 'stationery', item });
    setDialogOpen(true);
  };

  const handleDelete = async (itemId: string) => {
    if (!db) return;
    if (confirm('Are you sure you want to delete this item?')) {
      await deleteDoc(doc(db, 'stationeryItems', itemId));
    }
  };

  if (loading || !user) {
    return (
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Control Panel</h2>
        <p className="text-muted-foreground">Loading data...</p>
      </div>
    );
  }

  const tabs = [
      { value: 'stationery_orders', label: 'Stationery Orders' },
      { value: 'stationery', label: 'Stationery Items' },
  ];
  
  const defaultTab = tabs[0].value;


  const StationeryItemsView = () => (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={openAddItemDialog}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Stationery Item
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stationeryLoading ? (
            <TableRow><TableCell colSpan={4} className="text-center">Loading...</TableCell></TableRow>
          ) : (
            stationeryItems?.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => openEditItemDialog(item)}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(item.id)} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </>
  );


  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Supervisor Control Panel</h2>
        <p className="text-muted-foreground">Manage stationery inventory and oversee voyager orders.</p>
      </div>

      <Card>
        <CardHeader>
           <CardTitle>System Management</CardTitle>
          <CardDescription>
            Oversee stationery orders and items.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue={tabParam || defaultTab} value={tabParam || defaultTab}>
              <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
                {tabs.map(tab => <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>)}
              </TabsList>
              
              <TabsContent value="stationery" className="mt-4">
                <StationeryItemsView />
              </TabsContent>

              <TabsContent value="stationery_orders" className="mt-4">
                <StationeryOrdersTab />
              </TabsContent>
            </Tabs>
        </CardContent>
      </Card>
      {dialogContext && (
        <AddItemDialog 
          isOpen={dialogOpen}
          setIsOpen={setDialogOpen}
          context={dialogContext}
        />
      )}
    </div>
  );
}


export default function SupervisorDashboard() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SupervisorDashboardPage />
    </Suspense>
  )
}