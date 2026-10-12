import pg from 'pg';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

const { Pool } = pg;

export const pool = new Pool({
  host: env.dbHost,
  port: env.dbPort,
  database: env.dbName,
  user: env.dbUser,
  password: env.dbPassword
});

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  logger.info(`Executed query: ${text.substring(0, 60)}... (${duration}ms, ${res.rowCount} rows)`);
  return res;
};

export const connectDB = async (): Promise<boolean> => {
  try {
    const client = await pool.connect();
    logger.info(`✅ Connected to PostgreSQL database '${env.dbName}' at ${env.dbHost}:${env.dbPort}`);
    client.release();
    return true;
  } catch (error: any) {
    logger.warn(`PostgreSQL connection notice (${env.dbHost}:${env.dbPort}/${env.dbName}): ${error.message}`);
    return false;
  }
};
