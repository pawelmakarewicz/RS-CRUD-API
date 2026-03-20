import { Product, CreateProductInput, UpdateProductInput } from './schemas.js';
import { randomUUID } from 'node:crypto';

class InMemoryDB {
  private products: Map<string, Product> = new Map();

  // Получить все продукты
  getAll(): Product[] {
    return Array.from(this.products.values());
  }

  // Найти по ID
  getById(id: string): Product | undefined {
    return this.products.get(id);
  }

  // Проверить существование
  exists(id: string): boolean {
    return this.products.has(id);
  }

  // Создать продукт
  create(input: CreateProductInput): Product {
    const product: Product = {
      id: randomUUID(),
      ...input,
    };
    this.products.set(product.id, product);
    return product;
  }

  // Обновить продукт
  update(id: string, input: UpdateProductInput): Product | undefined {
    const existing = this.products.get(id);
    if (!existing) return undefined;

    const updated: Product = {
      ...existing,
      ...input,
    };
    this.products.set(id, updated);
    return updated;
  }

  // Удалить продукт
  delete(id: string): boolean {
    return this.products.delete(id);
  }

  // Очистить (для тестов)
  clear(): void {
    this.products.clear();
  }
}

// Экспортируем класс для создания отдельных инстансов в тестах
export { InMemoryDB };

// Экспортируем синглтон для production использования
export const db = new InMemoryDB();
