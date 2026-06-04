import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { testConnection } from './config/db.js';
import logger from './utils/logger.js';

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  await testConnection();

  const server = app.listen(PORT, () => {
    logger.info(`🚀  Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });

  // Graceful Shutdown 
  const shutdown = (signal) => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    server.close(() => {
      logger.info('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));
  process.on('uncaughtException',  (err) => { logger.error('Uncaught Exception:',  err); process.exit(1); });
  process.on('unhandledRejection', (err) => { logger.error('Unhandled Rejection:', err); process.exit(1); });
}

bootstrap();
