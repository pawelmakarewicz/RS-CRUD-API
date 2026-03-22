import { FastifyInstance } from "fastify";
import { InMemoryDB } from "../src/db.js";
import { initApp } from "./helpers/app.js";
import { API_ROUTES } from "./constants/routes.js";

describe("Scenario CRUD one product", () => {

  const productData = {
    name: "Test Product",
    description: "This is a test product",
    price: 100,
    category: "Test Category",
    inStock: true,
  };

  const updatedProductData = {
    name: "Updated Product",
    description: "This is an updated product",
    price: 200,
    category: "Updated Category",
    inStock: false,
  };

  let app: FastifyInstance;
  let db: InMemoryDB;
  let createdProductId: string;

  beforeAll(async () => {
    const result = await initApp();
    app = result.app;
    db = result.db;
  });

  afterAll(() => app.close());

  // 1
  it(`GET ${API_ROUTES.PRODUCTS} returns empty array`, async () => {
    const response = await app.inject({
      method: "GET",
      url: API_ROUTES.PRODUCTS,
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual([]);
  });

  // 2
  it(`POST ${API_ROUTES.PRODUCTS} creates a new product`, async () => {
    const response = await app.inject({
      method: "POST",
      url: API_ROUTES.PRODUCTS,
      body: productData,
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toEqual({
      id: expect.any(String),
      ...productData,
    });

    createdProductId = response.json().id;
  });

  // 3
  it(`GET ${API_ROUTES.productsId(":id")} returns created product`, async () => {
    const response = await app.inject({
      method: "GET",
      url: API_ROUTES.productsId(createdProductId),
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      id: createdProductId,
      ...productData,
    });
  });

  // 4
  it(`PUT ${API_ROUTES.productsId(":id")} updates the product`, async () => {
    const response = await app.inject({
      method: "PUT",
      url: API_ROUTES.productsId(createdProductId),
      body: updatedProductData,
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      id: createdProductId,
      ...updatedProductData,
    });
  });

  // 5
  it(`DELETE ${API_ROUTES.productsId(":id")} deletes the product`, async () => {
    const response = await app.inject({
      method: "DELETE",
      url: API_ROUTES.productsId(createdProductId),
    });

    expect(response.statusCode).toBe(204);
  });

  // 6
  it(`GET ${API_ROUTES.productsId(":id")} returns 404 after deletion`, async () => {
    const response = await app.inject({
      method: "GET",
      url: API_ROUTES.productsId(createdProductId),
    });

    expect(response.statusCode).toBe(404);
  });

});