import { Request, Response, NextFunction } from 'express';
import { Helpers } from '../utils/helpers';
import { AppError } from './error.middleware';
import { User } from '../../shared/schemas/base-user.schema';

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Get token from cookies or Authorization header
    let token = req.cookies?.accessToken;

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      throw new AppError('Access token is required', 401);
    }

    // Verify token
    const decoded = Helpers.verifyToken(token);

    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      throw new AppError('User not found', 401);
    }

    if (!user.isActive) {
      throw new AppError('Account is deactivated', 401);
    }

    if (!user.isEmailVerified) {
      throw new AppError('Email not verified', 401);
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...roles: string[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): void => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('Insufficient permissions', 403));
    }

    next();
  };
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Get token from cookies or Authorization header
    let token = req.cookies?.accessToken;

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (token) {
      try {
        // Verify token
        const decoded = Helpers.verifyToken(token);

        // Get user from database
        const user = await User.findById(decoded.userId).select('-password');

        if (user && user.isActive && user.isEmailVerified) {
          req.user = user;
        }
      } catch (error) {
        // Token invalid, but continue without authentication
        console.warn('Invalid token in optional auth:', error);
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const refreshTokenHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new AppError('Refresh token is required', 401);
    }

    // Verify refresh token
    const decoded = Helpers.verifyRefreshToken(refreshToken);

    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      throw new AppError('User not found', 401);
    }

    if (!user.isActive) {
      throw new AppError('Account is deactivated', 401);
    }

    // Generate new tokens
    const tokenPayload = {
      userId: user._id,
      email: user.email,
      role: user.role,
    };

    const newAccessToken = Helpers.generateToken(tokenPayload);
    const newRefreshToken = Helpers.generateRefreshToken(tokenPayload);

    // Set cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' as const : 'lax' as const,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    }; res.cookie('accessToken', newAccessToken, {
      ...cookieOptions,
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    res.cookie('refreshToken', newRefreshToken, cookieOptions);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.json(
      Helpers.formatResponse(true, 'Tokens refreshed successfully', {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        accessToken: newAccessToken,
      }),
    );
  } catch (error) {
    next(error);
  }
};
