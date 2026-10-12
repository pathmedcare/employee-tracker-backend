import dotenv from 'dotenv';
dotenv.config();

export const env = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'pmc_tracker_super_secret_jwt_access_key_2026',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'pmc_tracker_super_secret_jwt_refresh_key_2026',
  masterOtp: process.env.MASTER_OTP || '417620',
  dbHost: process.env.DB_HOST || 'localhost',
  dbPort: parseInt(process.env.DB_PORT || '5432', 10),
  dbName: process.env.DB_NAME || 'pmc_tracker',
  dbUser: process.env.DB_USER || 'postgres',
  dbPassword: process.env.DB_PASSWORD || 'postgres'
};
