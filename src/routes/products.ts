import { FastifyPluginAsync } from 'fastify';
import { InMemoryDB } from '../db.js';
import {
  createProductSchema,
  updateProductSchema,
  uuidSchema,
  type Product,
} from '../schemas.js';

const productRoutes: FastifyPluginAsync = async (fastify) => {
  // db будет доступен через fastify.db (создаём в buildApp)
  const db = fastify.db as InMemoryDB;

  // GET / - получить все продукты (полный путь: /api/products)
  fastify.get('/', async (request, reply) => {
    return reply.status(200).send(db.getAll());
  });

  // GET /:id - получить продукт по ID (полный путь: /api/products/:id)
  fastify.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const { id } = request.params;

    // Валидация UUID
    const uuidResult = uuidSchema.safeParse(id);
    if (!uuidResult.success) {
      return reply.status(400).send({ message: 'Invalid product ID format' });
    }

    const product = db.getById(id);
    if (!product) {
      return reply.status(404).send({ message: 'Product not found' });
    }

    return reply.status(200).send(product);
  });

  // POST / - создать продукт (полный путь: /api/products)
  fastify.post('/', async (request, reply) => {
    const bodyResult = createProductSchema.safeParse(request.body);

    if (!bodyResult.success) {
      return reply.status(400).send({ message: 'Invalid product data' });
    }

    const newProduct = db.create(bodyResult.data);
    return reply.status(201).send(newProduct);
  });

  // PUT /:id - обновить продукт (полный путь: /api/products/:id)
  fastify.put<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const { id } = request.params;

    // Валидация UUID
    const uuidResult = uuidSchema.safeParse(id);
    if (!uuidResult.success) {
      return reply.status(400).send({ message: 'Invalid product ID format' });
    }

    // Проверка существования
    if (!db.exists(id)) {
      return reply.status(404).send({ message: 'Product not found' });
    }

    const bodyResult = updateProductSchema.safeParse(request.body);
    if (!bodyResult.success) {
      return reply.status(400).send({ message: 'Invalid product data' });
    }

    const updated = db.update(id, bodyResult.data);
    return reply.status(200).send(updated);
  });

  // DELETE /:id - удалить продукт (полный путь: /api/products/:id)
  fastify.delete<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const { id } = request.params;

    // Валидация UUID
    const uuidResult = uuidSchema.safeParse(id);
    if (!uuidResult.success) {
      return reply.status(400).send({ message: 'Invalid product ID format' });
    }

    // Проверка существования
    if (!db.exists(id)) {
      return reply.status(404).send({ message: 'Product not found' });
    }

    db.delete(id);
    return reply.status(204).send();
  });
};

export { productRoutes };
