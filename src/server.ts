import app from './app';
import { env } from './config/env';
import { connectDatabase } from './config/database';
import { logger } from './config/logger';

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();
    const server = app.listen(env.PORT, () => {
      logger.info(`Server listening on port ${env.PORT}`);
    });

    const shutdown = async (): Promise<void> => {
      server.close(() => {
        logger.info('HTTP server closed');
      });
    };

    process.on('SIGINT', async () => {
      logger.warn('SIGINT received');
      await shutdown();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      logger.warn('SIGTERM received');
      await shutdown();
      process.exit(0);
    });
  } catch (error) {
    logger.error({ err: error }, 'Failed to start server');
    process.exit(1);
  }
};

startServer();
