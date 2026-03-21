import { z } from 'zod';
import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import {
  productSchema,
  createProductSchema,
  updateProductSchema,
} from '../schemas.js';

const errorSchema = z.object({ message: z.string() });

const uuidSchema = z.object({ id: z.string().uuid() });

const productRoutes: FastifyPluginAsyncZod = async (fastify) => {
  const db = fastify.db;

  fastify.get('/', {
    schema: {
      response: {
        200: z.array(productSchema),
      },
    },
  }, async (request, reply) => {
    return reply.send(db.getAll());
  });

  fastify.get('/:id', {
    schema: {
      params: uuidSchema,
      response: {
        200: productSchema,
        404: errorSchema,
      },
    },
  }, async (request, reply) => {
    const product = db.getById(request.params.id);
    if (!product) {
      return reply.status(404).send({ message: 'Product not found' });
    }
    return reply.send(product);
  });

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

  fastify.put('/:id', {
    schema: {
      params: uuidSchema,
      body: updateProductSchema,
      response: {
        200: productSchema,
        404: errorSchema,
      },
    },
  }, async (request, reply) => {
    if (!db.exists(request.params.id)) {
      return reply.status(404).send({ message: 'Product not found' });
    }

    const updated = db.update(request.params.id, request.body);
    return reply.send(updated);
  });

  fastify.delete('/:id', {
    schema: {
      params: uuidSchema,
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