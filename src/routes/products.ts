import {
  FastifyPluginAsync,
  FastifyRequest,
  FastifyReply,
} from 'fastify';
import { z } from 'zod';
import { InMemoryDB } from '../db.js';
import {
  productSchema,
  createProductSchema,
  updateProductSchema,
  type CreateProductInput,
  type UpdateProductInput,
} from '../schemas.js';

const isValidUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

const productRoutes: FastifyPluginAsync = async (fastify) => {
  const db = fastify.db;

  fastify.get('/', {
    schema: {
      response: {
        200: z.array(productSchema),
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    return reply.send(db.getAll());
  });

  fastify.get<{ Params: { id: string } }>('/:id', {
    schema: {
      response: {
        200: productSchema,
      },
    },
  }, async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    if (!isValidUUID(request.params.id)) {
      return reply.status(400).send({ message: 'Invalid product ID format' });
    }

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
  }, async (request: FastifyRequest<{ Body: CreateProductInput }>, reply: FastifyReply) => {
    const newProduct = db.create(request.body);
    return reply.status(201).send(newProduct);
  });

  fastify.put<{ Params: { id: string } }>('/:id', {
    schema: {
      body: updateProductSchema,
      response: {
        200: productSchema,
      },
    },
  }, async (request: FastifyRequest<{ Params: { id: string }; Body: UpdateProductInput }>, reply: FastifyReply) => {
    if (!isValidUUID(request.params.id)) {
      return reply.status(400).send({ message: 'Invalid product ID format' });
    }

    if (!db.exists(request.params.id)) {
      return reply.status(404).send({ message: 'Product not found' });
    }

    const updated = db.update(request.params.id, request.body);
    return reply.send(updated);
  });

  fastify.delete<{ Params: { id: string } }>('/:id', {
    schema: {},
  }, async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    if (!isValidUUID(request.params.id)) {
      return reply.status(400).send({ message: 'Invalid product ID format' });
    }

    if (!db.exists(request.params.id)) {
      return reply.status(404).send({ message: 'Product not found' });
    }

    db.delete(request.params.id);
    return reply.status(204).send();
  });
};

export { productRoutes };
