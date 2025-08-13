import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { RestaurantPublicService } from '../services/restaurant-public.service';
import { AppError } from '../../shared/middlewares/error.middleware';
import { Helpers } from '../../shared/utils/helpers';
import { asyncHandler } from '../../shared/middlewares/error.middleware';

const restaurantPublicService = new RestaurantPublicService();

export class RestaurantPublicController {
  /**
   * Search meals publicly
   */
  searchMeals = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation failed', 400);
    }

    const meals = await restaurantPublicService.searchMeals(req.query);

    res.json(
      Helpers.formatResponse(true, 'Meals retrieved successfully', meals),
    );
  });

  /**
   * Get featured meals
   */
  getFeaturedMeals = asyncHandler(async (req: Request, res: Response) => {
    const meals = await restaurantPublicService.getFeaturedMeals();

    res.json(
      Helpers.formatResponse(
        true,
        'Featured meals retrieved successfully',
        meals,
      ),
    );
  });

  /**
   * Get popular meals with filtering
   */
  getPopularMeals = asyncHandler(async (req: Request, res: Response) => {
    const { category, limit, page } = req.query;

    const result = await restaurantPublicService.getPopularMeals({
      category,
      limit,
      page,
    });

    res.json(
      Helpers.formatResponse(
        true,
        'Popular meals retrieved successfully',
        result.meals,
        {
          pagination: result.pagination,
        },
      ),
    );
  });

  /**
   * Get meals by category
   */
  getMealsByCategory = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation failed', 400);
    }

    const { category } = req.params;
    const meals = await restaurantPublicService.getMealsByCategory(category);

    res.json(
      Helpers.formatResponse(true, 'Meals retrieved successfully', meals),
    );
  });

  /**
   * Get meal by ID
   */
  getMealById = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation failed', 400);
    }

    const { mealId } = req.params;
    const meal = await restaurantPublicService.getMealById(mealId);

    res.json(Helpers.formatResponse(true, 'Meal retrieved successfully', meal));
  });

  /**
   * Get restaurants list (public browsing)
   */
  getRestaurants = asyncHandler(async (req: Request, res: Response) => {
    const filters = req.query;
    const restaurants = await restaurantPublicService.getRestaurants(filters);

    res.json(
      Helpers.formatResponse(
        true,
        'Restaurants retrieved successfully',
        restaurants,
      ),
    );
  });

  /**
   * Get restaurant by ID with menu
   */
  getRestaurantById = asyncHandler(async (req: Request, res: Response) => {
    const { restaurantId } = req.params;
    const restaurant =
      await restaurantPublicService.getRestaurantById(restaurantId);

    res.json(
      Helpers.formatResponse(
        true,
        'Restaurant retrieved successfully',
        restaurant,
      ),
    );
  });

  /**
   * Get nearby restaurants
   */
  getNearbyRestaurants = asyncHandler(async (req: Request, res: Response) => {
    const { lat, lng, radius } = req.query;
    const restaurants = await restaurantPublicService.getNearbyRestaurants(
      Number(lat),
      Number(lng),
      Number(radius),
    );

    res.json(
      Helpers.formatResponse(
        true,
        'Nearby restaurants retrieved successfully',
        restaurants,
      ),
    );
  });

  /**
   * Get top-rated restaurants
   */
  getTopRatedRestaurants = asyncHandler(async (req: Request, res: Response) => {
    const { limit } = req.query;
    const restaurants = await restaurantPublicService.getTopRatedRestaurants(
      Number(limit) || 10,
    );

    res.json(
      Helpers.formatResponse(
        true,
        'Top-rated restaurants retrieved successfully',
        restaurants,
      ),
    );
  });
}
