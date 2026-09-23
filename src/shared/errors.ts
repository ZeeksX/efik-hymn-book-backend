export type ErrorCode =
  | 'INTERNAL_SERVER_ERROR'
  | 'VALIDATION_ERROR'
  | 'AUTHENTICATION_REQUIRED'
  | 'INVALID_CREDENTIALS'
  | 'INSUFFICIENT_PERMISSION'
  | 'NOT_FOUND'
  | 'HYMN_NOT_FOUND'
  | 'CATEGORY_NOT_FOUND'
  | 'USER_NOT_FOUND'
  | 'HYMN_NUMBER_EXISTS'
  | 'CONFLICT'
  | 'RATE_LIMIT_EXCEEDED';

export class AppError extends Error {
  public statusCode: number;
  public code: ErrorCode;
  public details?: Record<string, unknown>;

  constructor(message: string, statusCode: number, code: ErrorCode, details?: Record<string, unknown>) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required.') {
    super(message, 401, 'AUTHENTICATION_REQUIRED');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'You do not have permission to perform this action.') {
    super(message, 403, 'INSUFFICIENT_PERMISSION');
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, code: ErrorCode = 'NOT_FOUND') {
    super(message, 404, code);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string, code: ErrorCode = 'CONFLICT') {
    super(message, 409, code);
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests. Please try again later.') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
    this.name = 'RateLimitError';
  }
}
