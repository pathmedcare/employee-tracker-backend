import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { logger } from './utils/logger.js';

const PORT = env.port;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    logger.info(`=================================================`);
    logger.info(`🚀 PMC Tracker Backend running on port ${PORT}`);
    logger.info(`📖 API Docs available at http://localhost:${PORT}/docs`);
    logger.info(`⚡ Environment: ${env.nodeEnv}`);
    logger.info(`=================================================`);
  });
};

startServer();
