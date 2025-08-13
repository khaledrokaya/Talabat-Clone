import { Request, Response, NextFunction } from 'express';
import { Helpers } from '../utils/helpers';
import { Logger } from '../utils/logger';

export interface ApiError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export class AppError extends Error implements ApiError {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  let { statusCode = 500, message } = err;

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  } else if (err.name === 'MongoError' && (err as any).code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value';
  }

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    Logger.error(`Error occurred: ${err.name} - ${err.message} at ${req.originalUrl}`);
  }

  // Send error response
  res.status(statusCode).json(
    Helpers.formatResponse(
      false,
      message,
      process.env.NODE_ENV === 'development'
        ? {
          stack: err.stack,
          name: err.name,
          errorCode: (err as any).errorCode,
          email: (err as any).email,
        }
        : {
          errorCode: (err as any).errorCode,
          email: (err as any).email,
        },
    ),
  );
};

export const notFound = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
