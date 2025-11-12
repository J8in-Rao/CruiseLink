'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFirestore } from '@/firebase';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { CateringItem, StationeryItem } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2 } from 'lucide-react';

const baseSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  price: z.coerce.number().min(0.01, 'Price must be greater than 0'),
  description: z.string().min(2, 'Description is required'),
  imageUrl: z.string().url('Please enter a valid URL.'),
});

const cateringSchema = baseSchema.extend({
  category: z.enum(['Snacks', 'Food', 'Beverages']),
});

const stationerySchema = baseSchema.extend({
  category: z.enum(['Gift Items', 'Chocolates', 'Tale Books']),
});

type AddItemDialogProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  context: {
    type: 'catering' | 'stationery';
    item?: CateringItem | StationeryItem;
  };
};

export function AddItemDialog({ isOpen, setIsOpen, context }: AddItemDialogProps) {
  const { type, item } = context;
  const isEditMode = !!item;
  const db = useFirestore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [imageSource, setImageSource] = useState<'url' | 'upload'>('url');
  
  const currentSchema = type === 'catering' ? cateringSchema : stationerySchema;

  const form = useForm({
    resolver: zodResolver(currentSchema),
    defaultValues: {
      name: '',
      category: undefined,
      price: 0,
      description: '',
      imageUrl: '',
    },
  });

  useEffect(() => {
    if (item) {
      form.reset({
        name: item.name,
        category: item.category as any,
        price: item.price,
        description: item.description,
        imageUrl: item.imageUrl,
      });
       if (item.imageUrl.startsWith('data:image')) {
        setImageSource('upload');
      } else {
        setImageSource('url');
      }
    } else {
      form.reset({ name: '', price: 0, description: '', category: undefined, imageUrl: '' });
      setImageSource('url');
    }
  }, [item, form, isOpen]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue('imageUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: z.infer<typeof currentSchema>) => {
    if (!db) return;
    setIsLoading(true);
    const collectionName = type === 'catering' ? 'cateringItems' : 'stationeryItems';
    
    let itemData: any = { ...data };

    // Always set inStock status for new or edited items
    if (!isEditMode) {
        itemData.inStock = true; // New items are in stock by default
    } else {
        // For existing items, preserve their current inStock status, or default to true if it's missing
        itemData.inStock = (item as CateringItem | StationeryItem)?.inStock ?? true;
    }


    try {
      if (isEditMode && item?.id) {
        await setDoc(doc(db, collectionName, item.id), itemData);
        toast({ title: 'Success', description: 'Item updated successfully.' });
      } else {
        await addDoc(collection(db, collectionName), itemData);
        toast({ title: 'Success', description: 'Item added successfully.' });
      }
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to save item:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save item.' });
    } finally {
      setIsLoading(false);
    }
  };
  
  const categoryOptions = type === 'catering'
    ? ['Snacks', 'Food', 'Beverages']
    : ['Gift Items', 'Chocolates', 'Tale Books'];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit' : 'Add'} {type === 'catering' ? 'Catering' : 'Stationery'} Item</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update the details for this item.' : `Add a new item to the ${type} menu.`}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...form.register('name')} />
            {form.formState.errors.name && <p className="text-destructive text-sm">{form.formState.errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Controller
              control={form.control}
              name="category"
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder={`Select a ${type} category`} />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
             {form.formState.errors.category && <p className="text-destructive text-sm">{form.formState.errors.category.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input id="price" type="number" step="0.01" {...form.register('price')} />
            {form.formState.errors.price && <p className="text-destructive text-sm">{form.formState.errors.price.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" {...form.register('description')} />
            {form.formState.errors.description && <p className="text-destructive text-sm">{form.formState.errors.description.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Image</Label>
            <RadioGroup defaultValue="url" value={imageSource} onValueChange={(value: 'url' | 'upload') => setImageSource(value)} className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="url" id="url" />
                <Label htmlFor="url">URL</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="upload" id="upload" />
                <Label htmlFor="upload">Upload</Label>
              </div>
            </RadioGroup>
          </div>

          {imageSource === 'url' ? (
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                placeholder="https://example.com/image.png"
                {...form.register('imageUrl')}
              />
            </div>
          ) : (
             <div className="space-y-2">
              <Label htmlFor="imageUpload">Upload Image</Label>
              <Input
                id="imageUpload"
                type="file"
                accept="image/png, image/jpeg, image/gif"
                onChange={handleFileChange}
              />
            </div>
          )}
           {form.formState.errors.imageUrl && <p className="text-destructive text-sm">{form.formState.errors.imageUrl.message}</p>}


          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
