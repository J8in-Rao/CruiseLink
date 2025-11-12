'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Boxes, PackageCheck, PackageX } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, updateDoc } from 'firebase/firestore';
import type { StationeryItem } from '@/types';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

export default function StationeryInventoryPage() {
  const db = useFirestore();
  const { toast } = useToast();
  
  const itemsQuery = useMemoFirebase(() => db ? collection(db, 'stationeryItems') : null, [db]);
  const { data: items, isLoading } = useCollection<StationeryItem>(itemsQuery);

  const handleStockToggle = async (itemId: string, currentStatus: boolean) => {
    if (!db) return;
    const itemRef = doc(db, 'stationeryItems', itemId);
    const newStatus = !currentStatus;
    try {
      await updateDoc(itemRef, {
        inStock: newStatus
      });
      toast({
        title: 'Inventory Updated',
        description: `Item status set to ${newStatus ? 'In Stock' : 'Out of Stock'}.`,
      });
    } catch (error) {
      console.error("Failed to update inventory status:", error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not update the item status. Check permissions.',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Boxes />
            <span>Stationery Inventory</span>
        </CardTitle>
        <CardDescription>
          Manage the real-time availability of stationery and gift items.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        ) : items && items.length > 0 ? (
             <div className="space-y-4">
                {items.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-md border">
                        <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">{item.category} - ${item.price.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch
                                id={`stock-${item.id}`}
                                checked={item.inStock ?? true}
                                onCheckedChange={() => handleStockToggle(item.id, item.inStock ?? true)}
                            />
                            <Label htmlFor={`stock-${item.id}`} className="flex items-center gap-2">
                                {(item.inStock ?? true) ? 
                                    <><PackageCheck className="h-4 w-4 text-green-600" /><span>In Stock</span></> : 
                                    <><PackageX className="h-4 w-4 text-red-600" /><span>Out of Stock</span></>
                                }
                            </Label>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <p className="text-muted-foreground text-center py-8">No stationery items found to manage.</p>
        )}
      </CardContent>
    </Card>
  );
}
