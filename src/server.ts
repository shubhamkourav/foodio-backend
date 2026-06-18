import http from 'node:http';

import { Server } from 'socket.io';

import app from './app.js';
import { configureCloudinary } from './config/cloudinary.js';
import { connectDb } from './config/db.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { registerSocketHandlers } from './sockets/index.js';
import { setSocketServer } from './sockets/emitter.js';
import { startWorkers } from './queues/index.js';

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: '*' },
});

setSocketServer(io);
registerSocketHandlers(io);

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', { reason });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', error);
  process.exit(1);
});

async function start() {
  try {
    await connectDb();
    configureCloudinary();
    await startWorkers();

    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(
          `Port ${env.PORT} is already in use. On macOS, port 5000 is often taken by AirPlay Receiver. Set PORT=3001 in .env or stop the other process.`,
        );
        process.exit(1);
      }
      logger.error('Server error', error);
      process.exit(1);
    });

    server.listen(env.PORT, '0.0.0.0', () => {
      logger.info(`Foodio API listening on port ${env.PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

start();

export { io };
