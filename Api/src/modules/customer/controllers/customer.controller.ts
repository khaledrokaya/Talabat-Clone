import { Response, NextFunction } from 'express';
import { CustomerService } from '../services/customer.service';
import { asyncHandler } from '../../shared/middlewares/error.middleware';
import { Helpers } from '../../shared/utils/helpers';
import { AuthenticatedRequest } from '../../shared/middlewares/auth.middleware';

export class CustomerController {
  private customerService: CustomerService;

  constructor() {
    this.customerService = new CustomerService();
  }

  /**
   * Get customer profile
   */
  getProfile = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
      const profile = await this.customerService.getProfile(req.user._id);

      res
        .status(200)
        .json(
          Helpers.formatResponse(
            true,
            'Profile retrieved successfully',
            profile,
          ),
        );
    },
  );

  /**
   * Update customer profile
   */
  updateProfile = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
      const updatedProfile = await this.customerService.updateProfile(
        req.user._id,
        req.body,
      );

      res
        .status(200)
        .json(
          Helpers.formatResponse(
            true,
            'Profile updated successfully',
            updatedProfile,
          ),
        );
    },
  );

  /**
   * Add restaurant to favorites
   */
  addToFavorites = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
      await this.customerService.addToFavorites(req.user._id, req.body);

      res
        .status(200)
        .json(
          Helpers.formatResponse(
            true,
            'Restaurant added to favorites successfully',
          ),
        );
    },
  );

  /**
   * Remove restaurant from favorites
   */
  removeFromFavorites = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
      const { restaurantId } = req.params;
      await this.customerService.removeFromFavorites(
        req.user._id,
        restaurantId,
      );

      res
        .status(200)
        .json(
          Helpers.formatResponse(
            true,
            'Restaurant removed from favorites successfully',
          ),
        );
    },
  );

  /**
   * Get favorite restaurants
   */
  getFavoriteRestaurants = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
      const favorites = await this.customerService.getFavoriteRestaurants(
        req.user._id,
      );

      res
        .status(200)
        .json(
          Helpers.formatResponse(
            true,
            'Favorite restaurants retrieved successfully',
            favorites,
          ),
        );
    },
  );

  /**
   * Get order history
   */
  getOrderHistory = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const orderHistory = await this.customerService.getOrderHistory(
        req.user._id,
        page,
        limit,
      );

      res
        .status(200)
        .json(
          Helpers.formatResponse(
            true,
            'Order history retrieved successfully',
            orderHistory,
          ),
        );
    },
  );

  /**
   * Update delivery preferences
   */
  updateDeliveryPreferences = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
      const updatedCustomer =
        await this.customerService.updateDeliveryPreferences(
          req.user._id,
          req.body,
        );

      res
        .status(200)
        .json(
          Helpers.formatResponse(
            true,
            'Delivery preferences updated successfully',
            { deliveryPreferences: updatedCustomer.deliveryPreferences },
          ),
        );
    },
  );
}
