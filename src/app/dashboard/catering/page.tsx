'use client';

import Image from 'next/image';
import { Plus, Minus, PackageX } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, addDoc, writeBatch, doc, query, where } from 'firebase/firestore';
import type { CateringItem } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

export default function CateringPage() {
  const db = useFirestore();
  const { user } = useUser();
  
  // The query for items doesn't need to change. We will handle showing 'out of stock' in the UI.
  const cateringItemsQuery = useMemoFirebase(
    () => db ? collection(db, 'cateringItems') : null, 
    [db]
  );
  const { data: cateringItems, isLoading } = useCollection<CateringItem>(cateringItemsQuery);

  const [cart, setCart] = useState<CartItem[]>([]);
  const { toast } = useToast();
  
  const addToCart = (item: CateringItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
        );
      }
      return [...prevCart, { id: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === itemId);
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map((cartItem) =>
          cartItem.id === itemId ? { ...cartItem, quantity: cartItem.quantity - 1 } : cartItem
        );
      }
      return prevCart.filter((cartItem) => cartItem.id !== itemId);
    });
  };

  const getCartItemQuantity = (itemId: string) => {
    return cart.find((item) => item.id === itemId)?.quantity || 0;
  };

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Your cart is empty',
        description: 'Please add items to your cart before placing an order.',
      });
      return;
    }
    if (!user || !db) return;

    try {
        const orderData = {
            voyagerId: user.uid,
            orderDate: new Date().toISOString(),
            items: cart.map(item => ({ itemId: item.id, quantity: item.quantity, name: item.name })),
            totalAmount: cartTotal,
            status: 'Pending'
        };

        const batch = writeBatch(db);
        
        // 1. Add to user's private collection
        const userOrderRef = doc(collection(db, 'voyagers', user.uid, 'cateringOrders'));
        batch.set(userOrderRef, orderData);

        // 2. Add to denormalized collection for admin/supervisor view
        const adminOrderRef = doc(collection(db, 'allCateringOrders'));
        batch.set(adminOrderRef, { ...orderData, id: adminOrderRef.id, originalOrderId: userOrderRef.id });

        await batch.commit();

        toast({
            title: 'Order Placed!',
            description: 'Your catering order has been successfully submitted.',
        });
        setCart([]);
    } catch (error) {
        console.error("Order placement failed:", error);
        toast({
            variant: 'destructive',
            title: 'Order Failed',
            description: 'Could not place your order. Please try again.',
        });
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-80 w-full" />)
          ) : cateringItems && cateringItems.length > 0 ? (
            cateringItems.map((item) => (
              <Card key={item.id} className="overflow-hidden relative">
                <CardHeader className="p-0">
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    width={400}
                    height={250}
                    className="object-cover w-full h-40"
                  />
                   {item.inStock === false && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                        <PackageX className="h-12 w-12 text-white" />
                        <p className="text-white font-bold mt-2">Out of Stock</p>
                    </div>
                    )}
                </CardHeader>
                <CardContent className="p-4">
                  <CardTitle>{item.name}</CardTitle>
                  <CardDescription className="mt-1 h-10">{item.description}</CardDescription>
                  <p className="font-bold text-lg mt-2">${item.price.toFixed(2)}</p>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  {getCartItemQuantity(item.id) === 0 ? (
                    <Button className="w-full" onClick={() => addToCart(item)} disabled={item.inStock === false}>Add to Cart</Button>
                  ) : (
                    <div className="flex items-center justify-between w-full">
                      <Button size="icon" variant="outline" onClick={() => removeFromCart(item.id)}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="font-bold text-lg">{getCartItemQuantity(item.id)}</span>
                      <Button size="icon" variant="outline" onClick={() => addToCart(item)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardFooter>
              </Card>
            ))
          ) : (
            <p className="text-muted-foreground col-span-full text-center">No catering items available at the moment.</p>
          )}
        </div>
      </div>
      <div>
        <Card className="sticky top-6">
          <CardHeader>
            <CardTitle>My Order</CardTitle>
            <CardDescription>Review your items before placing the order.</CardDescription>
          </CardHeader>
          <CardContent>
            {cart.length === 0 ? (
              <p className="text-muted-foreground text-center">Your cart is empty</p>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        ${item.price.toFixed(2)} x {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          {cart.length > 0 && (
            <CardFooter className="flex-col items-stretch space-y-4 pt-4 border-t">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <Button className="w-full" onClick={handlePlaceOrder}>Place Order</Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
