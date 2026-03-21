import { Product, CreateProductInput, UpdateProductInput } from './schemas.js';
import { randomUUID } from 'node:crypto';

class InMemoryDB {
  private products: Map<string, Product> = new Map();

  getAll(): Product[] {
    return Array.from(this.products.values());
  }

  getById(id: string): Product | undefined {
    return this.products.get(id);
  }

  exists(id: string): boolean {
    return this.products.has(id);
  }

  create(input: CreateProductInput): Product {
    const product: Product = {
      id: randomUUID(),
      ...input,
    };
    this.products.set(product.id, product);
    return product;
  }

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

  delete(id: string): boolean {
    return this.products.delete(id);
  }

  clear(): void {
    this.products.clear();
  }
}

export { InMemoryDB };

export const db = new InMemoryDB();
