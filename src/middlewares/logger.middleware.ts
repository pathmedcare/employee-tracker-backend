import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  const { method, originalUrl, body } = req;

  // Sanitize password from logs for security while printing request details
  const sanitizedBody = { ...body };
  if (sanitizedBody.password) sanitizedBody.password = '***[HIDDEN]***';
  if (sanitizedBody.new_password) sanitizedBody.new_password = '***[HIDDEN]***';

  logger.info(`📥 INCOMING [${method}] ${originalUrl} - Payload: ${JSON.stringify(sanitizedBody)}`);

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`📤 OUTGOING [${method}] ${originalUrl} - Status: ${res.statusCode} (${duration}ms)`);
  });

  next();
};
