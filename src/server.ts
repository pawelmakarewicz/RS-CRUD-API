import 'dotenv/config';
import { buildApp } from './app.js';

const PORT = Number(process.env.PORT) || 4000;
const app = buildApp();

const start = async () => {
  try {
    await app.listen({ port: PORT });
    console.log(`Server running on port ${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
