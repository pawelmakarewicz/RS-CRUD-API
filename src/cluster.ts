import 'dotenv/config';
import cluster from 'node:cluster';
import http from 'node:http';
import { availableParallelism } from 'node:os';
import { buildApp } from './app.js';

const PORT = Number(process.env.PORT);
const numWorkers = availableParallelism() - 1;

if (cluster.isPrimary) {

  // TODO: create a single InMemoryDB instance here (single source of truth)
  // TODO: add cluster.on('fork') — listen for IPC messages from workers
  // TODO: execute DB operations and send results back via worker.send()

  for (let i = 0; i < numWorkers; i++) {
    cluster.fork({ WORKER_PORT: PORT + 1 + i });
  }

  let current = 0;

  http.createServer((req, res) => {
    const workerPort = PORT + 1 + (current % numWorkers);
    current++;

    const proxy = http.request(
      { host: 'localhost', port: workerPort, path: req.url, method: req.method, headers: req.headers },
      (workerRes) => {
        res.writeHead(workerRes.statusCode!, workerRes.headers);
        workerRes.pipe(res);
      }
    );

    req.pipe(proxy);
  }).listen(PORT, () => console.log(`Balancer on :${PORT}`));

} else {

  const workerPort = Number(process.env.WORKER_PORT);
  console.log(`Worker ${process.pid} starting on port ${workerPort}`);

  // TODO: create SharedDBClient that sends IPC requests to primary process
  // TODO: pass SharedDBClient into buildApp(sharedDb) instead of default InMemoryDB
  const app = buildApp();

  app.listen({ port: workerPort }, () => {
    console.log(`Worker ${process.pid} on :${workerPort}`);
  });

}