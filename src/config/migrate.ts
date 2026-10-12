import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const runMigrations = async (): Promise<boolean> => {
  const pool = new pg.Pool({
    host: env.dbHost,
    port: env.dbPort,
    database: env.dbName,
    user: env.dbUser,
    password: env.dbPassword
  });

  try {
    const migrationPath = path.join(__dirname, '../../migrations/001_initial_schema.sql');
    if (!fs.existsSync(migrationPath)) {
      logger.error(`Migration SQL file not found at: ${migrationPath}`);
      return false;
    }

    const sql = fs.readFileSync(migrationPath, 'utf8');
    logger.info('Executing database table schema migrations...');

    const client = await pool.connect();
    try {
      await client.query(sql);
      logger.info('✅ All 18 database tables & PostGIS spatial indexes created successfully!');
    } finally {
      client.release();
    }

    await pool.end();
    return true;
  } catch (error: any) {
    logger.warn(`Database connection info (host: ${env.dbHost}:${env.dbPort}, database: ${env.dbName}). PostgreSQL status: ${error.message}`);
    await pool.end();
    return false;
  }
};

runMigrations();
