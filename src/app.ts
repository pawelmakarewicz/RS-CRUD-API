import Fastify from 'fastify';
import { productRoutes } from './routes/products.js';
import { InMemoryDB, db as defaultDb } from './db.js';

export const buildApp = (db: InMemoryDB = defaultDb) => {
  const app = Fastify();

  // Добавляем db как decoration - доступен в роутах через fastify.db
  app.decorate('db', db);

  // Регистрируем роуты с префиксом /api/products
  app.register(productRoutes, { prefix: '/api/products' });

  // 404 handler для несуществующих роутов
  app.setNotFoundHandler((request, reply) => {
    reply.status(404).send({ message: 'Route not found' });
  });

  // 500 handler для серверных ошибок
  app.setErrorHandler((error, request, reply) => {
    app.log.error(error);
    reply.status(500).send({ message: 'Internal server error' });
  });

  return app;
};
