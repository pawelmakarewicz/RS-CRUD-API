import { FastifyInstance } from "fastify";
import { InMemoryDB } from "../src/db.js";
import { initApp } from "./helpers/app.js";
import { API_ROUTES } from "./constants/routes.js";

describe("Scenario Validation", () => {

  const validProductData = {
    name: "Test Product",
    description: "This is a test product",
    price: 100,
    category: "Test Category",
    inStock: true,
  };

  const fakeId = "00000000-0000-0000-0000-000000000000";
  const invalidId = "not-a-uuid";

  let app: FastifyInstance;

  beforeAll(async () => {
    const result = await initApp();
    app = result.app;
  });

  afterAll(() => app.close());

  it(`POST ${API_ROUTES.PRODUCTS} returns 400 when body is empty`, async () => {
    const response = await app.inject({
      method: "POST",
      url: API_ROUTES.PRODUCTS,
      body: {},
    });

    expect(response.statusCode).toBe(400);
  });

  it(`POST ${API_ROUTES.PRODUCTS} returns 400 when price is negative`, async () => {
    const response = await app.inject({
      method: "POST",
      url: API_ROUTES.PRODUCTS,
      body: { ...validProductData, price: -1 },
    });

    expect(response.statusCode).toBe(400);
  });

  it(`POST ${API_ROUTES.PRODUCTS} returns 400 when required field is missing`, async () => {
    const { name, ...withoutName } = validProductData;

    const response = await app.inject({
      method: "POST",
      url: API_ROUTES.PRODUCTS,
      body: withoutName,
    });

    expect(response.statusCode).toBe(400);
  });

  it(`GET ${API_ROUTES.productsId(":id")} returns 404 for non-existent id`, async () => {
    const response = await app.inject({
      method: "GET",
      url: API_ROUTES.productsId(fakeId),
    });

    expect(response.statusCode).toBe(404);
  });

  it(`GET ${API_ROUTES.productsId(":id")} returns 400 for invalid id`, async () => {
    const response = await app.inject({
      method: "GET",
      url: API_ROUTES.productsId(invalidId),
    });

    expect(response.statusCode).toBe(400);
  });

  it(`PUT ${API_ROUTES.productsId(":id")} returns 404 for non-existent id`, async () => {
    const response = await app.inject({
      method: "PUT",
      url: API_ROUTES.productsId(fakeId),
      body: validProductData,
    });

    expect(response.statusCode).toBe(404);
  });

  it(`PUT ${API_ROUTES.productsId(":id")} returns 400 for invalid id`, async () => {
    const response = await app.inject({
      method: "PUT",
      url: API_ROUTES.productsId(invalidId),
      body: validProductData,
    });

    expect(response.statusCode).toBe(400);
  });

  it(`DELETE ${API_ROUTES.productsId(":id")} returns 404 for non-existent id`, async () => {
    const response = await app.inject({
      method: "DELETE",
      url: API_ROUTES.productsId(fakeId),
    });

    expect(response.statusCode).toBe(404);
  });

  it(`DELETE ${API_ROUTES.productsId(":id")} returns 400 for invalid id`, async () => {
    const response = await app.inject({
      method: "DELETE",
      url: API_ROUTES.productsId(invalidId),
    });

    expect(response.statusCode).toBe(400);
  });

});