import { Router } from 'express';
import { RestaurantPublicController } from '../controllers/restaurant-public.controller';
import {
  validateSearchMeals,
  validateMealId,
  validateCategory,
  validatePopularMeals,
} from '../middlewares/restaurant.middleware';

const router = Router();
const restaurantPublicController = new RestaurantPublicController();

/**
 * @swagger
 * components:
 *   schemas:
 *     Restaurant:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *         name:
 *           type: string
 *           example: "Pizza Palace"
 *         description:
 *           type: string
 *           example: "Authentic Italian pizzas made with fresh ingredients"
 *         cuisine:
 *           type: string
 *           example: "Italian"
 *         address:
 *           type: object
 *           properties:
 *             street:
 *               type: string
 *               example: "123 Main Street"
 *             city:
 *               type: string
 *               example: "New York"
 *             state:
 *               type: string
 *               example: "NY"
 *             zipCode:
 *               type: string
 *               example: "10001"
 *             coordinates:
 *               type: object
 *               properties:
 *                 lat:
 *                   type: number
 *                   example: 40.7128
 *                 lng:
 *                   type: number
 *                   example: -74.0060
 *         phone:
 *           type: string
 *           example: "+1-555-0123"
 *         email:
 *           type: string
 *           example: "contact@pizzapalace.com"
 *         rating:
 *           type: number
 *           example: 4.5
 *         totalReviews:
 *           type: integer
 *           example: 245
 *         isOpen:
 *           type: boolean
 *           example: true
 *         openingHours:
 *           type: object
 *           properties:
 *             monday:
 *               type: object
 *               properties:
 *                 open:
 *                   type: string
 *                   example: "09:00"
 *                 close:
 *                   type: string
 *                   example: "22:00"
 *         imageUrl:
 *           type: string
 *           example: "https://example.com/restaurant-image.jpg"
 *         deliveryFee:
 *           type: number
 *           example: 3.99
 *         minimumOrder:
 *           type: number
 *           example: 15.00
 *         estimatedDeliveryTime:
 *           type: integer
 *           example: 30
 *     Meal:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "507f1f77bcf86cd799439012"
 *         name:
 *           type: string
 *           example: "Margherita Pizza"
 *         description:
 *           type: string
 *           example: "Classic pizza with tomato sauce, mozzarella, and fresh basil"
 *         price:
 *           type: number
 *           example: 12.99
 *         category:
 *           type: string
 *           enum: [appetizer, main_course, dessert, beverage, salad, soup, sandwich, pizza, pasta, seafood, meat, vegetarian, vegan]
 *           example: "pizza"
 *         imageUrl:
 *           type: string
 *           example: "https://example.com/margherita-pizza.jpg"
 *         isAvailable:
 *           type: boolean
 *           example: true
 *         preparationTime:
 *           type: integer
 *           example: 15
 *         ingredients:
 *           type: array
 *           items:
 *             type: string
 *           example: ["tomato sauce", "mozzarella cheese", "fresh basil", "olive oil"]
 *         nutritionalInfo:
 *           type: object
 *           properties:
 *             calories:
 *               type: integer
 *               example: 285
 *             protein:
 *               type: number
 *               example: 12.2
 *             carbs:
 *               type: number
 *               example: 35.6
 *             fat:
 *               type: number
 *               example: 10.4
 *         allergens:
 *           type: array
 *           items:
 *             type: string
 *           example: ["gluten", "dairy"]
 *         spiceLevel:
 *           type: string
 *           enum: [mild, medium, hot, very_hot]
 *           example: "mild"
 *         rating:
 *           type: number
 *           example: 4.7
 *         totalReviews:
 *           type: integer
 *           example: 89
 *         discount:
 *           type: object
 *           properties:
 *             percentage:
 *               type: number
 *               example: 15
 *             validUntil:
 *               type: string
 *               format: date-time
 *               example: "2025-07-30T23:59:59.000Z"
 *         restaurant:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *             rating:
 *               type: number
 *     RestaurantWithMenu:
 *       allOf:
 *         - $ref: '#/components/schemas/Restaurant'
 *         - type: object
 *           properties:
 *             menu:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Meal'
 *     PaginationMeta:
 *       type: object
 *       properties:
 *         page:
 *           type: integer
 *           example: 1
 *         limit:
 *           type: integer
 *           example: 10
 *         total:
 *           type: integer
 *           example: 150
 *         pages:
 *           type: integer
 *           example: 15
 *         hasNext:
 *           type: boolean
 *           example: true
 *         hasPrev:
 *           type: boolean
 *           example: false
 *     ApiResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *         data:
 *           type: object
 *     ApiError:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *         error:
 *           type: string
 */

/**
 * @swagger
 * tags:
 *   name: Restaurant Public
 *   description: Public restaurant and meal browsing endpoints - no authentication required
 */

/**
 * @swagger
 * /api/restaurants:
 *   get:
 *     summary: Get restaurants list (public)
 *     description: Retrieve a paginated list of restaurants with optional filtering by cuisine, rating, and operational status
 *     tags: [Restaurant Public]
 *     parameters:
 *       - in: query
 *         name: cuisine
 *         schema:
 *           type: string
 *           enum: [Italian, Chinese, Mexican, Indian, American, Thai, Japanese, Mediterranean, French, Greek]
 *         description: Filter restaurants by cuisine type
 *         example: "Italian"
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *         description: Filter restaurants with minimum rating
 *         example: 4.0
 *       - in: query
 *         name: isOpen
 *         schema:
 *           type: boolean
 *         description: Filter to show only currently open restaurants
 *         example: true
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
 *           maximum: 50
 *           default: 10
 *         description: Number of restaurants per page
 *         example: 10
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, rating, deliveryTime, deliveryFee]
 *           default: rating
 *         description: Sort restaurants by field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Restaurants retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         restaurants:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Restaurant'
 *                         pagination:
 *                           $ref: '#/components/schemas/PaginationMeta'
 *             example:
 *               success: true
 *               message: "Restaurants retrieved successfully"
 *               data:
 *                 restaurants:
 *                   - _id: "507f1f77bcf86cd799439011"
 *                     name: "Pizza Palace"
 *                     cuisine: "Italian"
 *                     rating: 4.5
 *                     isOpen: true
 *                     deliveryFee: 3.99
 *                     estimatedDeliveryTime: 30
 *                 pagination:
 *                   page: 1
 *                   limit: 10
 *                   total: 150
 *                   pages: 15
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               success: false
 *               message: "Invalid rating value. Must be between 1 and 5"
 */
router.get('/', restaurantPublicController.getRestaurants);

/**
 * @swagger
 * /api/restaurants/location/nearby:
 *   get:
 *     summary: Get nearby restaurants (public)
 *     description: Find restaurants within a specified radius of given coordinates using geolocation
 *     tags: [Restaurant Public]
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *           minimum: -90
 *           maximum: 90
 *         description: Latitude coordinate
 *         example: 40.7128
 *       - in: query
 *         name: lng
 *         required: true
 *         schema:
 *           type: number
 *           minimum: -180
 *           maximum: 180
 *         description: Longitude coordinate
 *         example: -74.0060
 *       - in: query
 *         name: radius
 *         schema:
 *           type: integer
 *           minimum: 100
 *           maximum: 50000
 *           default: 5000
 *         description: Search radius in meters (default 5km)
 *         example: 3000
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 20
 *         description: Maximum number of restaurants to return
 *     responses:
 *       200:
 *         description: Nearby restaurants retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         restaurants:
 *                           type: array
 *                           items:
 *                             allOf:
 *                               - $ref: '#/components/schemas/Restaurant'
 *                               - type: object
 *                                 properties:
 *                                   distance:
 *                                     type: number
 *                                     description: Distance in meters
 *                                     example: 1250.5
 *                         searchCenter:
 *                           type: object
 *                           properties:
 *                             lat:
 *                               type: number
 *                             lng:
 *                               type: number
 *                         radius:
 *                           type: integer
 *             example:
 *               success: true
 *               message: "Nearby restaurants retrieved successfully"
 *               data:
 *                 restaurants:
 *                   - _id: "507f1f77bcf86cd799439011"
 *                     name: "Pizza Palace"
 *                     distance: 1250.5
 *                     rating: 4.5
 *                     isOpen: true
 *                 searchCenter:
 *                   lat: 40.7128
 *                   lng: -74.0060
 *                 radius: 3000
 *       400:
 *         description: Invalid coordinates or parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               success: false
 *               message: "Latitude and longitude are required"
 */
router.get('/location/nearby', restaurantPublicController.getNearbyRestaurants);

/**
 * @swagger
 * /api/restaurants/featured/top-rated:
 *   get:
 *     summary: Get top-rated restaurants (public)
 *     description: Retrieve the highest-rated restaurants based on customer reviews and ratings
 *     tags: [Restaurant Public]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Number of top-rated restaurants to return
 *         example: 10
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *           default: 4.0
 *         description: Minimum rating threshold
 *         example: 4.5
 *       - in: query
 *         name: cuisine
 *         schema:
 *           type: string
 *           enum: [Italian, Chinese, Mexican, Indian, American, Thai, Japanese, Mediterranean, French, Greek]
 *         description: Filter by specific cuisine type
 *     responses:
 *       200:
 *         description: Top-rated restaurants retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         restaurants:
 *                           type: array
 *                           items:
 *                             allOf:
 *                               - $ref: '#/components/schemas/Restaurant'
 *                               - type: object
 *                                 properties:
 *                                   rank:
 *                                     type: integer
 *                                     description: Ranking position
 *                                     example: 1
 *                         criteria:
 *                           type: object
 *                           properties:
 *                             minRating:
 *                               type: number
 *                             minReviews:
 *                               type: integer
 *                             sortBy:
 *                               type: string
 *                               example: "rating"
 *             example:
 *               success: true
 *               message: "Top-rated restaurants retrieved successfully"
 *               data:
 *                 restaurants:
 *                   - _id: "507f1f77bcf86cd799439011"
 *                     name: "Pizza Palace"
 *                     cuisine: "Italian"
 *                     rating: 4.8
 *                     totalReviews: 245
 *                     rank: 1
 *                     isOpen: true
 *                 criteria:
 *                   minRating: 4.5
 *                   minReviews: 50
 *                   sortBy: "rating"
 */
router.get(
  '/featured/top-rated',
  restaurantPublicController.getTopRatedRestaurants,
);

/**
 * @swagger
 * /api/restaurants/meals/search:
 *   get:
 *     summary: Search meals (public)
 *     description: Search for meals across all restaurants with filtering by name, category, and price range
 *     tags: [Restaurant Public]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *         description: Search query for meal name or description
 *         example: "pizza margherita"
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [appetizer, main_course, dessert, beverage, salad, soup, sandwich, pizza, pasta, seafood, meat, vegetarian, vegan]
 *         description: Filter meals by category
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
 *         example: 25.00
 *       - in: query
 *         name: isVegetarian
 *         schema:
 *           type: boolean
 *         description: Filter for vegetarian meals only
 *       - in: query
 *         name: spiceLevel
 *         schema:
 *           type: string
 *           enum: [mild, medium, hot, very_hot]
 *         description: Filter by spice level
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
 *           maximum: 50
 *           default: 20
 *         description: Number of meals per page
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
 *                       type: object
 *                       properties:
 *                         meals:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Meal'
 *                         pagination:
 *                           $ref: '#/components/schemas/PaginationMeta'
 *                         filters:
 *                           type: object
 *                           properties:
 *                             query:
 *                               type: string
 *                             category:
 *                               type: string
 *                             priceRange:
 *                               type: object
 *                               properties:
 *                                 min:
 *                                   type: number
 *                                 max:
 *                                   type: number
 *             example:
 *               success: true
 *               message: "Meals retrieved successfully"
 *               data:
 *                 meals:
 *                   - _id: "507f1f77bcf86cd799439012"
 *                     name: "Margherita Pizza"
 *                     price: 12.99
 *                     category: "pizza"
 *                     restaurant:
 *                       name: "Pizza Palace"
 *                       rating: 4.5
 *                 pagination:
 *                   page: 1
 *                   limit: 20
 *                   total: 45
 *                   pages: 3
 *       400:
 *         description: Invalid search parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               success: false
 *               message: "Search query must be at least 2 characters long"
 */
router.get(
  '/meals/search',
  validateSearchMeals,
  restaurantPublicController.searchMeals,
);

/**
 * @swagger
 * /api/restaurants/meals/featured:
 *   get:
 *     summary: Get featured meals (public)
 *     description: Retrieve a curated list of featured meals from various restaurants, typically highly-rated or promoted items
 *     tags: [Restaurant Public]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Number of featured meals to return
 *         example: 10
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [appetizer, main_course, dessert, beverage, salad, soup, sandwich, pizza, pasta, seafood, meat, vegetarian, vegan]
 *         description: Filter featured meals by category
 *     responses:
 *       200:
 *         description: Featured meals retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         meals:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Meal'
 *                         featuredReason:
 *                           type: string
 *                           enum: [highly_rated, popular, new, promotional]
 *                           description: Reason why these meals are featured
 *             example:
 *               success: true
 *               message: "Featured meals retrieved successfully"
 *               data:
 *                 meals:
 *                   - _id: "507f1f77bcf86cd799439012"
 *                     name: "Margherita Pizza"
 *                     price: 12.99
 *                     rating: 4.8
 *                     restaurant:
 *                       name: "Pizza Palace"
 *                       rating: 4.5
 *                 featuredReason: "highly_rated"
 */
router.get('/meals/featured', restaurantPublicController.getFeaturedMeals);

/**
 * @swagger
 * /api/restaurants/meals/popular:
 *   get:
 *     summary: Get popular meals (public)
 *     description: Retrieve the most popular meals based on order count and ratings with optional category filtering
 *     tags: [Restaurant Public]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [appetizer, main_course, dessert, beverage, salad, soup, sandwich, pizza, pasta, seafood, meat, vegetarian, vegan]
 *         description: Filter popular meals by category
 *         example: "pizza"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Number of popular meals to return
 *         example: 10
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
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
 *                       type: object
 *                       properties:
 *                         meals:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Meal'
 *                         pagination:
 *                           $ref: '#/components/schemas/PaginationMeta'
 *             example:
 *               success: true
 *               message: "Popular meals retrieved successfully"
 *               data:
 *                 meals:
 *                   - _id: "507f1f77bcf86cd799439012"
 *                     name: "Margherita Pizza"
 *                     price: 12.99
 *                     orderCount: 150
 *                     rating: 4.7
 *                     restaurant:
 *                       name: "Pizza Palace"
 *                       rating: 4.5
 *                 pagination:
 *                   currentPage: 1
 *                   totalPages: 3
 *                   totalMeals: 25
 *                   hasNext: true
 *                   hasPrev: false
 */
router.get('/meals/popular', validatePopularMeals, restaurantPublicController.getPopularMeals);

/**
 * @swagger
 * /api/restaurants/meals/category/{category}:
 *   get:
 *     summary: Get meals by category (public)
 *     description: Retrieve all meals from a specific category across all restaurants with pagination
 *     tags: [Restaurant Public]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *           enum: [appetizer, main_course, dessert, beverage, salad, soup, sandwich, pizza, pasta, seafood, meat, vegetarian, vegan]
 *         description: Meal category to filter by
 *         example: "pizza"
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
 *           maximum: 50
 *           default: 20
 *         description: Number of meals per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, price, rating, popularity]
 *           default: rating
 *         description: Sort meals by field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
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
 *                       type: object
 *                       properties:
 *                         meals:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Meal'
 *                         pagination:
 *                           $ref: '#/components/schemas/PaginationMeta'
 *                         category:
 *                           type: string
 *                           description: The category being filtered
 *             example:
 *               success: true
 *               message: "Meals retrieved successfully"
 *               data:
 *                 meals:
 *                   - _id: "507f1f77bcf86cd799439012"
 *                     name: "Margherita Pizza"
 *                     price: 12.99
 *                     category: "pizza"
 *                     restaurant:
 *                       name: "Pizza Palace"
 *                 pagination:
 *                   page: 1
 *                   limit: 20
 *                   total: 85
 *                   pages: 5
 *                 category: "pizza"
 *       404:
 *         description: Invalid category or no meals found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               success: false
 *               message: "Invalid meal category"
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.get(
  '/meals/category/:category',
  validateCategory,
  restaurantPublicController.getMealsByCategory,
);

/**
 * @swagger
 * /api/restaurants/meals/{mealId}:
 *   get:
 *     summary: Get meal by ID (public)
 *     description: Retrieve detailed information about a specific meal including nutritional info, ingredients, and reviews
 *     tags: [Restaurant Public]
 *     parameters:
 *       - in: path
 *         name: mealId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: MongoDB ObjectId of the meal
 *         example: "507f1f77bcf86cd799439012"
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
 *                       type: object
 *                       properties:
 *                         meal:
 *                           $ref: '#/components/schemas/Meal'
 *                         relatedMeals:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Meal'
 *                           description: Similar meals from the same restaurant
 *                         reviews:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                               customer:
 *                                 type: object
 *                                 properties:
 *                                   name:
 *                                     type: string
 *                                   avatar:
 *                                     type: string
 *                               rating:
 *                                 type: number
 *                               review:
 *                                 type: string
 *                               createdAt:
 *                                 type: string
 *                                 format: date-time
 *             example:
 *               success: true
 *               message: "Meal retrieved successfully"
 *               data:
 *                 meal:
 *                   _id: "507f1f77bcf86cd799439012"
 *                   name: "Margherita Pizza"
 *                   description: "Classic pizza with tomato sauce, mozzarella, and fresh basil"
 *                   price: 12.99
 *                   category: "pizza"
 *                   rating: 4.7
 *                   ingredients: ["tomato sauce", "mozzarella cheese", "fresh basil"]
 *                   nutritionalInfo:
 *                     calories: 285
 *                     protein: 12.2
 *                   restaurant:
 *                     name: "Pizza Palace"
 *                     rating: 4.5
 *                 relatedMeals:
 *                   - _id: "507f1f77bcf86cd799439013"
 *                     name: "Pepperoni Pizza"
 *                     price: 14.99
 *                 reviews:
 *                   - customer:
 *                       name: "John D."
 *                     rating: 5
 *                     review: "Excellent pizza, authentic taste!"
 *                     createdAt: "2025-07-20T15:30:00.000Z"
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
 *             example:
 *               success: false
 *               message: "Invalid meal ID format"
 */
router.get(
  '/meals/:mealId',
  validateMealId,
  restaurantPublicController.getMealById,
);

/**
 * @swagger
 * /api/restaurants/{restaurantId}:
 *   get:
 *     summary: Get restaurant by ID with menu (public)
 *     description: Retrieve detailed information about a specific restaurant including its complete menu
 *     tags: [Restaurant Public]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: MongoDB ObjectId of the restaurant
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Restaurant retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         restaurant:
 *                           $ref: '#/components/schemas/RestaurantWithMenu'
 *             example:
 *               success: true
 *               message: "Restaurant retrieved successfully"
 *               data:
 *                 restaurant:
 *                   _id: "507f1f77bcf86cd799439011"
 *                   name: "Pizza Palace"
 *                   description: "Authentic Italian pizzas"
 *                   cuisine: "Italian"
 *                   rating: 4.5
 *                   isOpen: true
 *                   menu:
 *                     - _id: "507f1f77bcf86cd799439012"
 *                       name: "Margherita Pizza"
 *                       price: 12.99
 *                       category: "pizza"
 *                       isAvailable: true
 *       404:
 *         description: Restaurant not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               success: false
 *               message: "Restaurant not found"
 *       400:
 *         description: Invalid restaurant ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               success: false
 *               message: "Invalid restaurant ID format"
 */
router.get('/:restaurantId', restaurantPublicController.getRestaurantById);

export default router;
