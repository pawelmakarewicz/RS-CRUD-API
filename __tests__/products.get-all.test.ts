import { FastifyInstance } from "fastify";
import { InMemoryDB } from "../src/db.js";
import { initApp } from "./helpers/app.js";
import { API_ROUTES } from "./constants/routes.js";

describe("Scenario GET all reflects actual state", () => {

  let app: FastifyInstance;
  let idA: string;
  let idB: string;

  const productA = { name: "Product A", description: "Desc A", price: 100, category: "Cat 1", inStock: true };
  const productB = { name: "Product B", description: "Desc B", price: 200, category: "Cat 2", inStock: false };

  beforeAll(async () => {
    const result = await initApp();
    app = result.app;
  });

  afterAll(() => app.close());

  it("initially empty", async () => {
    const response = await app.inject({ method: "GET", url: API_ROUTES.PRODUCTS });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual([]);
  });

  it("after creating two products — returns both", async () => {
    const a = await app.inject({ method: "POST", url: API_ROUTES.PRODUCTS, body: productA });
    const b = await app.inject({ method: "POST", url: API_ROUTES.PRODUCTS, body: productB });
    idA = a.json().id;
    idB = b.json().id;

    const response = await app.inject({ method: "GET", url: API_ROUTES.PRODUCTS });
    expect(response.json()).toHaveLength(2);
  });

  it("after deleting one — returns only one", async () => {
    await app.inject({ method: "DELETE", url: API_ROUTES.productsId(idA) });

    const response = await app.inject({ method: "GET", url: API_ROUTES.PRODUCTS });
    const list = response.json();

    expect(list).toHaveLength(1);
    expect(list[0].id).toBe(idB);
  });

  it("after updating remaining — reflects changes", async () => {
    await app.inject({
      method: "PUT",
      url: API_ROUTES.productsId(idB),
      body: { ...productB, price: 999 },
    });

    const response = await app.inject({ method: "GET", url: API_ROUTES.PRODUCTS });
    expect(response.json()[0].price).toBe(999);
  });

});