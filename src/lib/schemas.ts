import { z } from 'zod';

export const cateringItemSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  price: z.coerce.number().min(0.01, 'Price must be greater than 0'),
  description: z.string().min(2, 'Description is required'),
  imageUrl: z.string().min(1, 'Please provide an image URL or upload a file.'),
  category: z.enum(['Snacks', 'Food', 'Beverages'], { required_error: 'Please select a category.'}),
});

export const stationeryItemSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    price: z.coerce.number().min(0.01, 'Price must be greater than 0'),
    description: z.string().min(2, 'Description is required'),
    imageUrl: z.string().min(1, 'Please provide an image URL or upload a file.'),
    category: z.enum(['Gift Items', 'Chocolates', 'Tale Books'], { required_error: 'Please select a category.'}),
});

// This schema is no longer used for validation inside the dialog.
export const itemSchema = z.discriminatedUnion('type', [
  cateringItemSchema.extend({ type: z.literal('catering') }),
  stationeryItemSchema.extend({ type: z.literal('stationery') }),
]);
