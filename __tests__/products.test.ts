import Fastify, { FastifyInstance } from "fastify";
import { InMemoryDB } from "../src/db.js";
import { initApp } from "./helpers/app.js";

describe("Scenario CRUD  one product", () => {
  let app: FastifyInstance;
  let db: InMemoryDB;

  beforeAll(async () => {
    const result = await initApp();
    app = result.app;
    db = result.db;
  });

  afterAll(() => app.close())

  it("returns empty array", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/products",
    });
    console.log("TEST!!!!", response.json());

    expect(response.json()).toEqual([]);

    await app.close();
  });
});
