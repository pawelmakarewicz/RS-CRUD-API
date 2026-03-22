import Fastify from "fastify";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUI from "@fastify/swagger-ui";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  serializerCompiler,
  validatorCompiler,
  jsonSchemaTransform,
} from "fastify-type-provider-zod";
import { productRoutes } from "./routes/products.js";
import { InMemoryDB, db as defaultDb } from "./db.js";
import { NotFoundError } from "./errors.js";

export interface BuildAppOptions {
  disableSwagger?: boolean;
  disableLogger?: boolean;
}

export const buildApp = (db: InMemoryDB = defaultDb, options: BuildAppOptions = {}) => {
  const { disableSwagger = false, disableLogger = false } = options;
  const app = Fastify({
    logger: !disableLogger,
  })
    .withTypeProvider<ZodTypeProvider>()
    .setValidatorCompiler(validatorCompiler)
    .setSerializerCompiler(serializerCompiler);

  app.decorate("db", db);

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof NotFoundError) {
      return reply.status(error.statusCode).send({ message: error.message });
    }
    throw error;
  });

  if (!options.disableSwagger) {
    app.register(fastifySwagger, {
      openapi: {
        openapi: "3.0.0",
        info: {
          title: "CRUD API - Product Catalog",
          description: "Simple CRUD API for managing products",
          version: "1.0.0",
        },
      },
      transform: jsonSchemaTransform,
    });

    app.register(fastifySwaggerUI, {
      routePrefix: "/docs",
      uiConfig: {
        docExpansion: "list",
      },
    });
  }

  app.register(productRoutes, { prefix: "/api/products" });

  return app;
};
