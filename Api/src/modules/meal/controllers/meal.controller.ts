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
      const { page = 1, limit = 10, restaurant, category, search } = req.query;

      const filter: any = {};
      if (restaurant) filter.restaurant = restaurant;
      if (category) filter.category = category;
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }

      const skip = (Number(page) - 1) * Number(limit);
      const meals = await Meal.find(filter)
        .populate('restaurant', 'name location')
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
        'restaurant',
        'name location rating',
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
      const { page = 1, limit = 10, category } = req.query;

      const filter: any = { restaurant: restaurantId };
      if (category) filter.category = category;

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
        .populate('restaurant', 'name location rating')
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
        .populate('restaurant', 'name location rating')
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
