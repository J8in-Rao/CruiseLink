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
import type { CateringItem } from '@/types';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, deleteDoc } from 'firebase/firestore';
import { PlusCircle, MoreHorizontal, Pencil, Trash2, UtensilsCrossed } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AddItemDialog } from '@/components/dashboard/add-item-dialog';
import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function CateringItemsPage() {
    const db = useFirestore();
    const cateringItemsQuery = useMemoFirebase(() => db ? collection(db, 'cateringItems') : null, [db]);
    const { data: cateringItems, isLoading: cateringLoading } = useCollection<CateringItem>(cateringItemsQuery);
    
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogContext, setDialogContext] = useState<{ type: 'catering'; item?: CateringItem } | null>(null);

    const openAddItemDialog = () => {
        setDialogContext({ type: 'catering' });
        setDialogOpen(true);
    };
    
    const openEditItemDialog = (item: CateringItem) => {
        setDialogContext({ type: 'catering', item });
        setDialogOpen(true);
    };

    const handleDelete = async (itemId: string) => {
        if (!db) return;
        if (confirm('Are you sure you want to delete this item?')) {
            await deleteDoc(doc(db, 'cateringItems', itemId));
        }
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UtensilsCrossed />
                        <span>Catering Items</span>
                    </CardTitle>
                    <CardDescription>Manage food and beverage items available for order.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-end mb-4">
                        <Button onClick={() => openAddItemDialog()}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Catering Item
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
                            {cateringLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}><TableCell colSpan={4}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                                ))
                            ) : (
                            cateringItems?.map((item) => (
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
                </CardContent>
            </Card>
            {dialogContext && (
                <AddItemDialog 
                    isOpen={dialogOpen}
                    setIsOpen={setDialogOpen}
                    context={dialogContext}
                />
            )}
        </>
    );
}
