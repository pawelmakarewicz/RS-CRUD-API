import { buildApp } from "../../src/app.js";
import { InMemoryDB } from "../../src/db.js";

export function initApp() {
  const db = new InMemoryDB();
  const app = buildApp(db, { disableSwagger: true, disableLogger: true });
  return app.ready().then(() => ({ app, db }));
}
