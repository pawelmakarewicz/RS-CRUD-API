import { z } from 'zod';

export const productSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().positive(),
  category: z.string().min(1),
  inStock: z.boolean(),
});

export type Product = z.infer<typeof productSchema>;
export const createProductSchema = productSchema.omit({ id: true });

export type CreateProductInput = z.infer<typeof createProductSchema>;

export const updateProductSchema = createProductSchema.partial();

export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export const uuidSchema = z.object({ id: z.string().check(z.uuid()) });

export const errorSchema = z.object({ message: z.string() });