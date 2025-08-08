import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../shared/middlewares/auth.middleware';

/**
 * Middleware to ensure the user is a customer
 */
export const ensureCustomer = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void => {
  if (req.user.role !== 'customer') {
    res.status(403).json({
      success: false,
      message: 'Access denied. Customer role required.',
    });
    return;
  }
  next();
};
