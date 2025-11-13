import { z } from 'zod';

export const cateringItemSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  price: z.coerce.number().min(0.01, 'Price must be greater than 0'),
  description: z.string().min(2, 'Description is required'),
  imageUrl: z.string().url('Please enter a valid URL.'),
  category: z.enum(['Snacks', 'Food', 'Beverages']),
});

export const stationeryItemSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    price: z.coerce.number().min(0.01, 'Price must be greater than 0'),
    description: z.string().min(2, 'Description is required'),
    imageUrl: z.string().url('Please enter a valid URL.'),
    category: z.enum(['Gift Items', 'Chocolates', 'Tale Books']),
});

export const itemSchema = z.discriminatedUnion('type', [
  cateringItemSchema.extend({ type: z.literal('catering') }),
  stationeryItemSchema.extend({ type: z.literal('stationery') }),
]);
