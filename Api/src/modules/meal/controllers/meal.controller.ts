import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../../shared/middlewares/error.middleware';
import { Helpers } from '../../shared/utils/helpers';
import Meal from '../schemas/meal.schema';

export class MealController {
  /**
   * Get all meals
   */
  getAllMeals = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { page = 1, limit = 10, restaurant, category, search, isAvailable, includeUnavailable } = req.query;

      const filter: any = {};
      if (restaurant) filter.restaurantId = restaurant;
      if (category) filter.category = category;

      // Handle availability filtering
      if (isAvailable !== undefined) {
        filter.isAvailable = isAvailable === 'true';
      } else if (!includeUnavailable) {
        // Default behavior for public API - only show available meals
        filter.isAvailable = true;
      }

      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }

      const skip = (Number(page) - 1) * Number(limit);
      const meals = await Meal.find(filter)
        .populate('restaurantId', 'firstName lastName restaurantDetails')
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 });

      const totalMeals = await Meal.countDocuments(filter);
      const totalPages = Math.ceil(totalMeals / Number(limit));

      res.status(200).json(
        Helpers.formatResponse(true, 'Meals retrieved successfully', meals, {
          totalMeals,
          totalPages,
          currentPage: Number(page),
        }),
      );
    },
  );

  /**
   * Get meal by ID
   */
  getMealById = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { mealId } = req.params;
      const meal = await Meal.findById(mealId).populate(
        'restaurantId',
        'firstName lastName restaurantDetails',
      );

      if (!meal) {
        return res
          .status(404)
          .json(Helpers.formatResponse(false, 'Meal not found'));
      }

      res
        .status(200)
        .json(
          Helpers.formatResponse(true, 'Meal retrieved successfully', meal),
        );
    },
  );

  /**
   * Get meals by restaurant
   */
  getMealsByRestaurant = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { restaurantId } = req.params;
      const { page = 1, limit = 10, category, isAvailable } = req.query;

      const filter: any = { restaurantId };
      if (category) filter.category = category;
      console.log(filter);
      // Only filter by availability if explicitly requested
      // This allows restaurant owners to see all their meals
      if (isAvailable !== undefined) {
        filter.isAvailable = isAvailable === 'true';
      }

      const skip = (Number(page) - 1) * Number(limit);
      const meals = await Meal.find(filter)
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 });

      const totalMeals = await Meal.countDocuments(filter);
      const totalPages = Math.ceil(totalMeals / Number(limit));

      res.status(200).json(
        Helpers.formatResponse(
          true,
          'Restaurant meals retrieved successfully',
          meals,
          {
            totalMeals,
            totalPages,
            currentPage: Number(page),
          },
        ),
      );
    },
  );

  /**
   * Get meal categories
   */
  getMealCategories = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const categories = await Meal.distinct('category');

      res
        .status(200)
        .json(
          Helpers.formatResponse(
            true,
            'Categories retrieved successfully',
            categories,
          ),
        );
    },
  );

  /**
   * Search meals
   */
  searchMeals = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const {
        q,
        page = 1,
        limit = 10,
        category,
        minPrice,
        maxPrice,
      } = req.query;

      const filter: any = {};

      if (q) {
        filter.$or = [
          { name: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } },
        ];
      }

      if (category) filter.category = category;

      if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = Number(minPrice);
        if (maxPrice) filter.price.$lte = Number(maxPrice);
      }

      const skip = (Number(page) - 1) * Number(limit);
      const meals = await Meal.find(filter)
        .populate('restaurantId', 'firstName lastName restaurantDetails')
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 });

      const totalMeals = await Meal.countDocuments(filter);
      const totalPages = Math.ceil(totalMeals / Number(limit));

      res.status(200).json(
        Helpers.formatResponse(
          true,
          'Meals search completed successfully',
          meals,
          {
            totalMeals,
            totalPages,
            currentPage: Number(page),
            searchQuery: q,
          },
        ),
      );
    },
  );

  /**
   * Get popular meals
   */
  getPopularMeals = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { limit = 10 } = req.query;

      const meals = await Meal.find({ isAvailable: true })
        .populate('restaurantId', 'firstName lastName restaurantDetails')
        .sort({ orderCount: -1, rating: -1 })
        .limit(Number(limit));

      res
        .status(200)
        .json(
          Helpers.formatResponse(
            true,
            'Popular meals retrieved successfully',
            meals,
          ),
        );
    },
  );
}
