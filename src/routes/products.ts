import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { InMemoryDB } from '../db.js';
import {
  productSchema,
  createProductSchema,
  updateProductSchema,
  uuidSchema,
} from '../schemas.js';

const productRoutes: FastifyPluginAsync = async (fastify) => {
  const db = fastify.db;

  // GET / - получить все продукты
  fastify.get('/', {
    schema: {
      response: {
        200: z.array(productSchema),
      },
    },
  }, async (request, reply) => {
    return reply.send(db.getAll());
  });

  // GET /:id - получить продукт по ID
  fastify.get<{ Params: { id: string } }>('/:id', {
    schema: {
      params: {
        id: uuidSchema,
      },
      response: {
        200: productSchema,
      },
    },
  }, async (request, reply) => {
    const product = db.getById(request.params.id);
    if (!product) {
      return reply.status(404).send({ message: 'Product not found' });
    }
    return reply.send(product);
  });

  // POST / - создать продукт
  fastify.post('/', {
    schema: {
      body: createProductSchema,
      response: {
        201: productSchema,
      },
    },
  }, async (request, reply) => {
    const newProduct = db.create(request.body);
    return reply.status(201).send(newProduct);
  });

  // PUT /:id - обновить продукт
  fastify.put<{ Params: { id: string } }>('/:id', {
    schema: {
      params: {
        id: uuidSchema,
      },
      body: updateProductSchema,
      response: {
        200: productSchema,
      },
    },
  }, async (request, reply) => {
    if (!db.exists(request.params.id)) {
      return reply.status(404).send({ message: 'Product not found' });
    }

    const updated = db.update(request.params.id, request.body);
    return reply.send(updated);
  });

  // DELETE /:id - удалить продукт
  fastify.delete<{ Params: { id: string } }>('/:id', {
    schema: {
      params: {
        id: uuidSchema,
      },
    },
  }, async (request, reply) => {
    if (!db.exists(request.params.id)) {
      return reply.status(404).send({ message: 'Product not found' });
    }

    db.delete(request.params.id);
    return reply.status(204).send();
  });
};

export { productRoutes };
