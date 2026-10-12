import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { runMigrations } from './config/migrate.js';
import { seedDefaultUser } from './config/seed.js';
import { logger } from './utils/logger.js';

const PORT = env.port;

const startServer = async () => {
  const isConnected = await connectDB();
  
  if (isConnected) {
    logger.info('Running database migrations to ensure all PostgreSQL tables exist...');
    await runMigrations();
  }

  // Seed default test user
  await seedDefaultUser();

  app.listen(PORT, () => {
    logger.info(`=================================================`);
    logger.info(`🚀 PMC Tracker Backend running on port ${PORT}`);
    logger.info(`📖 API Docs available at http://localhost:${PORT}/docs`);
    logger.info(`⚡ Environment: ${env.nodeEnv}`);
    logger.info(`=================================================`);
  });
};

startServer();
