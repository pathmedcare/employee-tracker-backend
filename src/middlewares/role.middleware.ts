import { Response, NextFunction } from 'express';
import { sendError } from '../utils/response.js';
import { AuthenticatedRequest, UserRole } from '../types/index.js';

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void | Response => {
    if (!req.user) {
      return sendError(res, 'Unauthorized access', 401);
    }

    const userRole = req.user.role || '';
    if (!allowedRoles.includes(userRole as any)) {
      return sendError(
        res,
        `Forbidden. Access restricted to roles: [${allowedRoles.join(', ')}]`,
        403
      );
    }

    next();
  };
};
