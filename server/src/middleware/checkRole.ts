import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';

export const checkRole = (rolesArg: string | string[]) => {
  const roles = Array.isArray(rolesArg) ? rolesArg : [rolesArg];

  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: 'Not authorized to access this resource',
      });
      return;
    }

    next();
  };
};

export default checkRole;
