import { Router } from 'express';
import { MealController } from './controllers/meal.controller';
import { validateRequest } from '../shared/middlewares/validation.middleware';
import { query, param } from 'express-validator';

const router = Router();
const mealController = new MealController();

/**
 * @swagger
 * components:
 *   schemas:
 *     Meal:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique meal identifier
 *           example: "507f1f77bcf86cd799439011"
 *         name:
 *           type: string
 *           description: Name of the meal
 *           example: "Margherita Pizza"
 *         description:
 *           type: string
 *           description: Detailed description of the meal
 *           example: "Classic pizza with fresh tomatoes, mozzarella, and basil"
 *         price:
 *           type: number
 *           description: Price of the meal
 *           example: 12.99
 *         originalPrice:
 *           type: number
 *           description: Original price before discount
 *           example: 15.99
 *         category:
 *           type: string
 *           description: Meal category
 *           example: "pizza"
 *         imageUrl:
 *           type: string
 *           description: URL of meal image
 *           example: "https://example.com/pizza.jpg"
 *         ingredients:
 *           type: array
 *           items:
 *             type: string
 *           description: List of ingredients
 *           example: ["tomato sauce", "mozzarella", "basil", "olive oil"]
 *         allergens:
 *           type: array
 *           items:
 *             type: string
 *           description: List of allergens
 *           example: ["dairy", "gluten"]
 *         nutritionalInfo:
 *           type: object
 *           properties:
 *             calories:
 *               type: number
 *             protein:
 *               type: number
 *             carbs:
 *               type: number
 *             fat:
 *               type: number
 *           example:
 *             calories: 250
 *             protein: 12
 *             carbs: 30
 *             fat: 8
 *         prepTime:
 *           type: number
 *           description: Preparation time in minutes
 *           example: 15
 *         isAvailable:
 *           type: boolean
 *           description: Availability status
 *           example: true
 *         isVegetarian:
 *           type: boolean
 *           description: Vegetarian meal indicator
 *           example: true
 *         isVegan:
 *           type: boolean
 *           description: Vegan meal indicator
 *           example: false
 *         spiceLevel:
 *           type: string
 *           enum: [mild, medium, hot, very_hot]
 *           description: Spice level of the meal
 *           example: "mild"
 *         rating:
 *           type: number
 *           description: Average meal rating
 *           example: 4.5
 *         reviewCount:
 *           type: number
 *           description: Number of reviews
 *           example: 125
 *         orderCount:
 *           type: number
 *           description: Number of times ordered
 *           example: 350
 *         discount:
 *           type: object
 *           properties:
 *             percentage:
 *               type: number
 *               description: Discount percentage
 *               example: 20
 *             validUntil:
 *               type: string
 *               format: date-time
 *               description: Discount expiry date
 *               example: "2025-08-01T23:59:59.000Z"
 *         restaurant:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *             location:
 *               type: object
 *             rating:
 *               type: number
 *           example:
 *             _id: "507f1f77bcf86cd799439012"
 *             name: "Pizza Palace"
 *             rating: 4.2
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-07-25T10:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2025-07-25T12:00:00.000Z"
 *     MealCategory:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Category identifier
 *           example: "pizza"
 *         count:
 *           type: number
 *           description: Number of meals in category
 *           example: 25
 *     PaginationMeta:
 *       type: object
 *       properties:
 *         totalMeals:
 *           type: number
 *           description: Total number of meals
 *           example: 150
 *         totalPages:
 *           type: number
 *           description: Total number of pages
 *           example: 15
 *         currentPage:
 *           type: number
 *           description: Current page number
 *           example: 1
 *     SearchMeta:
 *       allOf:
 *         - $ref: '#/components/schemas/PaginationMeta'
 *         - type: object
 *           properties:
 *             searchQuery:
 *               type: string
 *               description: Search query used
 *               example: "pizza"
 *     ApiResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Operation completed successfully"
 *         data:
 *           type: object
 *         meta:
 *           type: object
 *     ApiError:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "An error occurred"
 *         error:
 *           type: string
 */

/**
 * @swagger
 * tags:
 *   name: Meals
 *   description: Meal browsing and search endpoints (Public access)
 */

/**
 * @swagger
 * /api/meals:
 *   get:
 *     summary: Get all meals with filtering and pagination
 *     description: Retrieve a paginated list of meals with optional filtering by restaurant, category, and search
 *     tags: [Meals]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of meals per page
 *         example: 10
 *       - in: query
 *         name: restaurant
 *         schema:
 *           type: string
 *         description: Filter by restaurant ID
 *         example: "507f1f77bcf86cd799439012"
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by meal category
 *         example: "pizza"
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in meal name and description
 *         example: "margherita"
 *     responses:
 *       200:
 *         description: Meals retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Meal'
 *                     meta:
 *                       $ref: '#/components/schemas/PaginationMeta'
 *             example:
 *               success: true
 *               message: "Meals retrieved successfully"
 *               data:
 *                 - _id: "507f1f77bcf86cd799439011"
 *                   name: "Margherita Pizza"
 *                   description: "Classic pizza with fresh ingredients"
 *                   price: 12.99
 *                   category: "pizza"
 *                   imageUrl: "https://example.com/pizza.jpg"
 *                   isAvailable: true
 *                   rating: 4.5
 *                   restaurant:
 *                     name: "Pizza Palace"
 *                     rating: 4.2
 *               meta:
 *                 totalMeals: 150
 *                 totalPages: 15
 *                 currentPage: 1
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.get(
  '/',
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('restaurant')
    .optional()
    .isMongoId()
    .withMessage('Invalid restaurant ID'),
  query('category')
    .optional()
    .isString()
    .withMessage('Category must be a string'),
  query('search').optional().isString().withMessage('Search must be a string'),
  validateRequest,
  mealController.getAllMeals,
);

/**
 * @swagger
 * /api/meals/{mealId}:
 *   get:
 *     summary: Get meal by ID
 *     description: Retrieve detailed information about a specific meal
 *     tags: [Meals]
 *     parameters:
 *       - in: path
 *         name: mealId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: MongoDB ObjectId of the meal
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Meal retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Meal'
 *             example:
 *               success: true
 *               message: "Meal retrieved successfully"
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 name: "Margherita Pizza"
 *                 description: "Classic pizza with fresh tomatoes, mozzarella, and basil"
 *                 price: 12.99
 *                 category: "pizza"
 *                 ingredients: ["tomato sauce", "mozzarella", "basil"]
 *                 nutritionalInfo:
 *                   calories: 250
 *                   protein: 12
 *                   carbs: 30
 *                   fat: 8
 *                 restaurant:
 *                   name: "Pizza Palace"
 *                   rating: 4.2
 *       404:
 *         description: Meal not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               success: false
 *               message: "Meal not found"
 *       400:
 *         description: Invalid meal ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.get(
  '/:mealId',
  param('mealId').isMongoId().withMessage('Invalid meal ID'),
  validateRequest,
  mealController.getMealById,
);

/**
 * @swagger
 * /api/meals/restaurant/{restaurantId}:
 *   get:
 *     summary: Get meals by restaurant
 *     description: Retrieve all meals from a specific restaurant with pagination
 *     tags: [Meals]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: MongoDB ObjectId of the restaurant
 *         example: "507f1f77bcf86cd799439012"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of meals per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by meal category
 *       - in: query
 *         name: available
 *         schema:
 *           type: boolean
 *         description: Filter by availability status
 *         example: true
 *     responses:
 *       200:
 *         description: Restaurant meals retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Meal'
 *                     meta:
 *                       $ref: '#/components/schemas/PaginationMeta'
 *       404:
 *         description: Restaurant not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       400:
 *         description: Invalid restaurant ID or query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.get(
  '/restaurant/:restaurantId',
  param('restaurantId').isMongoId().withMessage('Invalid restaurant ID'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('category')
    .optional()
    .isString()
    .withMessage('Category must be a string'),
  query('available')
    .optional()
    .isBoolean()
    .withMessage('Available must be a boolean'),
  validateRequest,
  mealController.getMealsByRestaurant,
);

/**
 * @swagger
 * /api/meals/categories:
 *   get:
 *     summary: Get meal categories
 *     description: Retrieve list of all available meal categories with meal counts
 *     tags: [Meals]
 *     responses:
 *       200:
 *         description: Meal categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/MealCategory'
 *             example:
 *               success: true
 *               message: "Meal categories retrieved successfully"
 *               data:
 *                 - _id: "pizza"
 *                   count: 25
 *                 - _id: "burger"
 *                   count: 18
 *                 - _id: "pasta"
 *                   count: 15
 *                 - _id: "salad"
 *                   count: 12
 */
router.get('/categories', mealController.getMealCategories);

/**
 * @swagger
 * /api/meals/search:
 *   get:
 *     summary: Search meals
 *     description: Advanced search for meals with multiple filters and sorting options
 *     tags: [Meals]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query for meal name and description
 *         example: "pizza margherita"
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by meal category
 *         example: "pizza"
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Minimum price filter
 *         example: 5.00
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Maximum price filter
 *         example: 20.00
 *       - in: query
 *         name: vegetarian
 *         schema:
 *           type: boolean
 *         description: Filter for vegetarian meals only
 *         example: true
 *       - in: query
 *         name: vegan
 *         schema:
 *           type: boolean
 *         description: Filter for vegan meals only
 *         example: false
 *       - in: query
 *         name: spiceLevel
 *         schema:
 *           type: string
 *           enum: [mild, medium, hot, very_hot]
 *         description: Filter by spice level
 *         example: "mild"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of meals per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [price, rating, popularity, newest]
 *           default: newest
 *         description: Sort meals by specified criteria
 *         example: "rating"
 *     responses:
 *       200:
 *         description: Meal search completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Meal'
 *                     meta:
 *                       $ref: '#/components/schemas/SearchMeta'
 *             example:
 *               success: true
 *               message: "Meal search completed successfully"
 *               data:
 *                 - _id: "507f1f77bcf86cd799439011"
 *                   name: "Margherita Pizza"
 *                   price: 12.99
 *                   rating: 4.5
 *                   category: "pizza"
 *                   isVegetarian: true
 *               meta:
 *                 totalMeals: 45
 *                 totalPages: 5
 *                 currentPage: 1
 *                 searchQuery: "pizza margherita"
 *       400:
 *         description: Invalid search parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.get(
  '/search',
  query('q').optional().isString().withMessage('Search query must be a string'),
  query('category')
    .optional()
    .isString()
    .withMessage('Category must be a string'),
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a positive number'),
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a positive number'),
  query('vegetarian')
    .optional()
    .isBoolean()
    .withMessage('Vegetarian filter must be a boolean'),
  query('vegan')
    .optional()
    .isBoolean()
    .withMessage('Vegan filter must be a boolean'),
  query('spiceLevel')
    .optional()
    .isIn(['mild', 'medium', 'hot', 'very_hot'])
    .withMessage('Invalid spice level'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sortBy')
    .optional()
    .isIn(['price', 'rating', 'popularity', 'newest'])
    .withMessage('Invalid sort option'),
  validateRequest,
  mealController.searchMeals,
);

/**
 * @swagger
 * /api/meals/popular:
 *   get:
 *     summary: Get popular meals
 *     description: Retrieve list of most popular meals based on order count and ratings
 *     tags: [Meals]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Number of popular meals to retrieve
 *         example: 10
 *     responses:
 *       200:
 *         description: Popular meals retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Meal'
 *             example:
 *               success: true
 *               message: "Popular meals retrieved successfully"
 *               data:
 *                 - _id: "507f1f77bcf86cd799439011"
 *                   name: "Margherita Pizza"
 *                   price: 12.99
 *                   rating: 4.8
 *                   orderCount: 1250
 *                   restaurant:
 *                     name: "Pizza Palace"
 *                     rating: 4.2
 *                 - _id: "507f1f77bcf86cd799439013"
 *                   name: "Classic Cheeseburger"
 *                   price: 9.99
 *                   rating: 4.6
 *                   orderCount: 980
 *       400:
 *         description: Invalid limit parameter
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.get(
  '/popular',
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  validateRequest,
  mealController.getPopularMeals,
);

export default router;
