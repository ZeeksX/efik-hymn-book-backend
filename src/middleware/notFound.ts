import type { NextFunction, Request, Response } from 'express';
import { NotFoundError } from '../shared/errors';

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  next(new NotFoundError(`Route not found: ${req.method} ${req.originalUrl}`, 'NOT_FOUND'));
};

export default notFoundHandler;
