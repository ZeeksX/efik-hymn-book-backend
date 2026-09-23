import type { NextFunction, Request, Response } from 'express';
import { AuthorizationError, AuthenticationError } from '../shared/errors';

export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AuthenticationError());
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new AuthorizationError());
      return;
    }

    next();
  };
};
