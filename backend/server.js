
import dns from 'node:dns';
import http from 'http';

import './config/env.js';
import { validateEnv, clientOrigins } from './config/env.js';
import { connectDB } from './config/db.js';
import createApp from './app.js';
import { initSockets } from './sockets/index.js';

// Configure DNS for MongoDB Atlas SRV lookup.
dns.setServers(['8.8.8.8', '1.1.1.1']);

async function start() {
  validateEnv();

  await connectDB();

  const app = createApp();
  const server = http.createServer(app);

  app.set('io', initSockets(server, clientOrigins()));

  const port = Number(process.env.PORT || 5000);

  server.listen(port, () => {
    console.log(`StudySphere API listening on port ${port}`);
  });
}

start().catch((error) => {
  console.error(`Startup failed: ${error.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});
