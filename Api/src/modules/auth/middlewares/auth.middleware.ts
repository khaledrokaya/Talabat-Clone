import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../shared/middlewares/error.middleware';

// Auth-specific middleware
export const checkPasswordStrength = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const { password } = req.body;

  if (!password) {
    return next();
  }

  // Password strength requirements
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasNonalphas = /\W/.test(password);

  if (password.length < minLength) {
    throw new AppError(
      `Password must be at least ${minLength} characters long`,
      400,
    );
  }

  if (!hasUpperCase) {
    throw new AppError(
      'Password must contain at least one uppercase letter',
      400,
    );
  }

  if (!hasLowerCase) {
    throw new AppError(
      'Password must contain at least one lowercase letter',
      400,
    );
  }

  if (!hasNumbers) {
    throw new AppError('Password must contain at least one number', 400);
  }

  if (!hasNonalphas) {
    throw new AppError(
      'Password must contain at least one special character',
      400,
    );
  }

  next();
};

export const preventDuplicateEmail = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      return next();
    }

    // Import User model dynamically to avoid circular dependencies
    const { User } = await import('../../shared/schemas/base-user.schema');

    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      throw new AppError('Email already exists', 409);
    }

    next();
  } catch (error) {
    next(error);
  }
};
