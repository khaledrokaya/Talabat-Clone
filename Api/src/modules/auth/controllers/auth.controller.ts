import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { asyncHandler } from '../../shared/middlewares/error.middleware';
import { Helpers } from '../../shared/utils/helpers';
import { AuthenticatedRequest } from '../../shared/middlewares/auth.middleware';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Register a new user
   */
  register = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await this.authService.register(req.body);

      res.status(201).json(result);
    },
  );

  /**
   * Register a new customer
   */
  registerCustomer = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const customerData = {
        ...req.body,
        role: 'customer',
      };
      const result = await this.authService.register(customerData);

      res.status(201).json(result);
    },
  );

  /**
   * Register a new restaurant
   */
  registerRestaurant = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const restaurantData = {
        ...req.body,
        role: 'restaurant_owner',
        verificationStatus: 'pending',
      };
      const result = await this.authService.register(restaurantData);

      res.status(201).json(result);
    },
  );

  /**
   * Register a new delivery driver
   */
  registerDelivery = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const deliveryData = {
        ...req.body,
        role: 'delivery',
        verificationStatus: 'pending',
      };
      const result = await this.authService.register(deliveryData);

      res.status(201).json(result);
    },
  );

  /**
   * Login user
   */
  login = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await this.authService.login(req.body);

      // Set HTTP-only cookies
      const cookieOptions = {
        httpOnly: process.env.NODE_ENV === 'production',
        secure: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' as const : 'lax' as const,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      };

      res.cookie('accessToken', result.data.tokens.accessToken, {
        ...cookieOptions,
        maxAge: 60 * 60 * 1000, // 1 hour
      });

      res.cookie('refreshToken', result.data.tokens.refreshToken, cookieOptions);

      res.status(200).json(result);
    },
  );

  /**
   * Verify OTP
   */
  verifyOTP = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await this.authService.verifyOTP(req.body);

      // Set HTTP-only cookies for successful verification
      const cookieOptions = {
        httpOnly: process.env.NODE_ENV === 'production',
        secure: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' as const : 'lax' as const,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      };

      res.cookie('accessToken', result.data.accessToken, {
        ...cookieOptions,
        maxAge: 60 * 60 * 1000, // 1 hour
      });

      res.cookie('refreshToken', result.data.refreshToken, cookieOptions);

      // Remove tokens from response data
      const responseData = {
        ...result,
        data: {
          user: result.data.user,
          // Remove accessToken and refreshToken from response
        },
      };

      res.status(200).json(responseData);
    },
  );

  /**
   * Resend OTP
   */
  resendOTP = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await this.authService.resendOTP(req.body);

      res.status(200).json(result);
    },
  );

  /**
   * Forgot password
   */
  forgotPassword = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await this.authService.forgotPassword(req.body);

      res.status(200).json(result);
    },
  );

  /**
   * Reset password
   */
  resetPassword = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await this.authService.resetPassword(req.body);

      res.status(200).json(result);
    },
  );

  /**
   * Change password (for authenticated users)
   */
  changePassword = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const result = await this.authService.changePassword(
        req.user._id,
        req.body,
      );

      res.status(200).json(result);
    },
  );

  /**
   * Logout user
   */
  logout = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      // Clear cookies
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');

      const result = await this.authService.logout();

      res.status(200).json(result);
    },
  );

  /**
   * Get current user profile
   */
  getProfile = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      res.status(200).json(
        Helpers.formatResponse(true, 'Profile retrieved successfully', {
          user: {
            id: req.user._id,
            email: req.user.email,
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            fullName: req.user.fullName,
            role: req.user.role,
            phone: req.user.phone,
            address: req.user.address,
            isEmailVerified: req.user.isEmailVerified,
            isActive: req.user.isActive,
            lastLogin: req.user.lastLogin,
            createdAt: req.user.createdAt,
          },
        }),
      );
    },
  );

  /**
   * Check authentication status
   */
  checkAuth = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      res.status(200).json(
        Helpers.formatResponse(true, 'User is authenticated', {
          isAuthenticated: true,
          user: {
            id: req.user._id,
            email: req.user.email,
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            role: req.user.role,
            isEmailVerified: req.user.isEmailVerified,
            isActive: req.user.isActive,
          },
        }),
      );
    },
  );

  /**
   * Refresh access token
   */
  refreshToken = asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const refreshToken = req.cookies?.refreshToken;

      if (!refreshToken) {
        res
          .status(401)
          .json(Helpers.formatResponse(false, 'Refresh token is required'));
        return;
      }

      try {
        // Verify refresh token
        const decoded = Helpers.verifyRefreshToken(refreshToken);

        // Generate new access token
        const tokenPayload = {
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role,
        };

        const newAccessToken = Helpers.generateToken(tokenPayload);

        // Set new access token cookie
        res.cookie('accessToken', newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' as const : 'lax' as const,
          maxAge: 60 * 60 * 1000, // 1 hour
        });

        res
          .status(200)
          .json(Helpers.formatResponse(true, 'Token refreshed successfully'));
      } catch {
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');

        res
          .status(401)
          .json(Helpers.formatResponse(false, 'Invalid refresh token'));
      }
    },
  );

  /**
   * Debug cookies endpoint
   */
  debugCookies = asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const cookies = req.cookies;
      const headers = req.headers;

      res.status(200).json({
        success: true,
        message: 'Cookie debug info',
        data: {
          cookies: cookies,
          cookieHeader: headers.cookie,
          hasAccessToken: !!cookies?.accessToken,
          hasRefreshToken: !!cookies?.refreshToken,
          origin: headers.origin,
          userAgent: headers['user-agent']
        }
      });
    },
  );
}
