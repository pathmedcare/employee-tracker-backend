import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { sendError } from '../utils/response.js';
import { AuthenticatedRequest, TokenPayload } from '../types/index.js';

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Access denied. No bearer token provided.', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.jwtSecret) as TokenPayload;

    const user = await User.findById(decoded.sub);
    if (!user) {
      return sendError(res, 'User no longer exists.', 401);
    }

    if (user.status !== 'Active') {
      return sendError(res, 'Account is inactive or suspended.', 403);
    }

    req.user = User.toJSON(user);
    next();
  } catch {
    return sendError(res, 'Invalid or expired access token.', 401);
  }
};
