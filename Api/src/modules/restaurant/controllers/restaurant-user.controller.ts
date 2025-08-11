import { Response } from 'express';
import { validationResult } from 'express-validator';
import { RestaurantUserService } from '../services/restaurant-user.service';
import { AppError } from '../../shared/middlewares/error.middleware';
import { Helpers } from '../../shared/utils/helpers';
import { asyncHandler } from '../../shared/middlewares/error.middleware';
import { AuthenticatedRequest } from '../../shared/middlewares/auth.middleware';

const restaurantUserService = new RestaurantUserService();

export class RestaurantUserController {
  /**
   * Helper method to format validation errors with detailed information
   */
  private formatValidationErrors(errors: any): string {
    const errorMessages = errors.array().map((error: any) => {
      const field = error.type === 'field' ? error.path : error.param || 'unknown';
      const value = error.type === 'field' ? error.value : error.value;

      // Provide context for different error types
      if (value === undefined || value === null || value === '') {
        return `${field}: ${error.msg} (field is missing or empty)`;
      } else {
        return `${field}: ${error.msg} (received: ${typeof value === 'object' ? JSON.stringify(value) : value})`;
      }
    });

    return `Validation failed: ${errorMessages.join(', ')}`;
  }

  /**
   * Create a new meal
   */
  createMeal = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError(this.formatValidationErrors(errors), 400);
      }

      const restaurantId = req.user!.id;
      const meal = await restaurantUserService.createMeal(
        restaurantId,
        req.body,
      );

      res
        .status(201)
        .json(Helpers.formatResponse(true, 'Meal created successfully', meal));
    },
  );

  /**
   * Update meal
   */
  updateMeal = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError(this.formatValidationErrors(errors), 400);
      }

      const restaurantId = req.user!.id;
      const { mealId } = req.params;
      const meal = await restaurantUserService.updateMeal(
        restaurantId,
        mealId,
        req.body,
      );

      res.json(Helpers.formatResponse(true, 'Meal updated successfully', meal));
    },
  );

  /**
   * Delete meal
   */
  deleteMeal = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Validation failed', 400);
      }

      const restaurantId = req.user!.id;
      const { mealId } = req.params;
      await restaurantUserService.deleteMeal(restaurantId, mealId);

      res.json(Helpers.formatResponse(true, 'Meal deleted successfully'));
    },
  );

  /**
   * Get my meals (restaurant owner only)
   */
  getMyMeals = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const restaurantId = req.user!.id;
      const filters = req.query;
      const meals = await restaurantUserService.getRestaurantMeals(
        restaurantId,
        filters,
      );

      res.json(
        Helpers.formatResponse(true, 'Meals retrieved successfully', meals),
      );
    },
  );

  /**
   * Toggle meal availability
   */
  toggleMealAvailability = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Validation failed', 400);
      }

      const restaurantId = req.user!.id;
      const { mealId } = req.params;
      const meal = await restaurantUserService.toggleMealAvailability(
        restaurantId,
        mealId,
      );

      res.json(
        Helpers.formatResponse(
          true,
          'Meal availability toggled successfully',
          meal,
        ),
      );
    },
  );

  /**
   * Set meal discount
   */
  setMealDiscount = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Validation failed', 400);
      }

      const restaurantId = req.user!.id;
      const { mealId } = req.params;
      const { percentage, validUntil, isActive = true } = req.body;

      const meal = await restaurantUserService.setMealDiscount(
        restaurantId,
        mealId,
        { percentage, validUntil, isActive },
      );

      res.json(
        Helpers.formatResponse(true, 'Meal discount set successfully', meal),
      );
    },
  );

  /**
   * Remove meal discount
   */
  removeMealDiscount = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Validation failed', 400);
      }

      const restaurantId = req.user!.id;
      const { mealId } = req.params;

      const meal = await restaurantUserService.removeMealDiscount(
        restaurantId,
        mealId,
      );

      res.json(
        Helpers.formatResponse(
          true,
          'Meal discount removed successfully',
          meal,
        ),
      );
    },
  );

  /**
   * Get restaurant analytics
   */
  getAnalytics = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Validation failed', 400);
      }

      const restaurantId = req.user!.id;
      const { startDate, endDate } = req.query;
      const analytics = await restaurantUserService.getAnalytics(
        restaurantId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined,
      );

      res.json(
        Helpers.formatResponse(
          true,
          'Analytics retrieved successfully',
          analytics,
        ),
      );
    },
  );

  /**
   * Update restaurant profile
   */
  updateProfile = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Validation failed', 400);
      }

      const restaurantId = req.user!.id;
      const restaurant = await restaurantUserService.updateProfile(
        restaurantId,
        req.body,
      );

      res.json(
        Helpers.formatResponse(
          true,
          'Profile updated successfully',
          restaurant,
        ),
      );
    },
  );

  /**
   * Toggle restaurant operational status
   */
  toggleOperationalStatus = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const restaurantId = req.user!.id;
      const restaurant =
        await restaurantUserService.toggleOperationalStatus(restaurantId);

      res.json(
        Helpers.formatResponse(
          true,
          'Operational status updated successfully',
          restaurant,
        ),
      );
    },
  );

  /**
   * Get restaurant dashboard data
   */
  getDashboard = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const restaurantId = req.user!.id;
      const dashboard = await restaurantUserService.getDashboard(restaurantId);

      res.json(
        Helpers.formatResponse(
          true,
          'Dashboard data retrieved successfully',
          dashboard,
        ),
      );
    },
  );
}
