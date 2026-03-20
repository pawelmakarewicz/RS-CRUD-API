import 'fastify';
import { InMemoryDB } from '../db.js';

declare module 'fastify' {
  interface FastifyInstance {
    db: InMemoryDB;
  }
}
