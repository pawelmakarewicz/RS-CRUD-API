import Fastify from 'fastify';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { serializerCompiler, validatorCompiler, jsonSchemaTransform } from 'fastify-type-provider-zod';
import { productRoutes } from './routes/products.js';
import { InMemoryDB, db as defaultDb } from './db.js';

export const buildApp = (db: InMemoryDB = defaultDb) => {
  const app = Fastify({
    logger: true,
  }).withTypeProvider<ZodTypeProvider>()
    .setValidatorCompiler(validatorCompiler)
    .setSerializerCompiler(serializerCompiler);

  // Добавляем db как decoration - доступен в роутах через fastify.db
  app.decorate('db', db);

  // Регистрируем Swagger
  app.register(fastifySwagger, {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'CRUD API - Product Catalog',
        description: 'Simple CRUD API for managing products',
        version: '1.0.0',
      },
    },
    transform: jsonSchemaTransform,
  });

  // Регистрируем Swagger UI
  app.register(fastifySwaggerUI, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
    },
  });

  // Регистрируем роуты с префиксом /api/products
  app.register(productRoutes, { prefix: '/api/products' });

  // 404 handler для несуществующих роутов
  app.setNotFoundHandler((request, reply) => {
    reply.status(404).send({ message: 'Route not found' });
  });

  // 500 handler для серверных ошибок
  app.setErrorHandler((error, request, reply) => {
    app.log.error(error);
    // Fastify сам ставит statusCode для валидации
    const statusCode = error.statusCode || 500;
    reply.status(statusCode).send({ message: error.message || 'Internal server error' });
  });

  return app;
};
