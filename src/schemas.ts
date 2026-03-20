import { z } from 'zod';

// Схема продукта (источник правды)
export const productSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().positive(),
  category: z.string().min(1),
  inStock: z.boolean(),
});

// Тип продукта - inferred из схемы
export type Product = z.infer<typeof productSchema>;

// Схема для создания продукта (без id)
export const createProductSchema = productSchema.omit({ id: true });

// Тип для создания продукта - inferred из схемы
export type CreateProductInput = z.infer<typeof createProductSchema>;

// Схема для обновления (все поля опциональные, кроме id)
export const updateProductSchema = productSchema.pick({ id: true }).merge(
  productSchema.omit({ id }).partial()
);

// Тип для обновления продукта - inferred из схемы
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

// UUID валидация
export const uuidSchema = z.string().uuid();
