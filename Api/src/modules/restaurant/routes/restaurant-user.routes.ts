import { Router } from 'express';
import { RestaurantUserController } from '../controllers/restaurant-user.controller';
import {
  authenticate,
  authorize,
} from '../../shared/middlewares/auth.middleware';
import {
  validateCreateMeal,
  validateUpdateMeal,
  validateMealId,
  validateMealDiscount,
} from '../middlewares/restaurant.middleware';

const router = Router();
const restaurantUserController = new RestaurantUserController();

// Apply authentication middleware to all restaurant user routes
router.use(authenticate);
router.use(authorize('restaurant_owner'));

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateMealRequest:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - price
 *         - category
 *         - preparationTime
 *         - ingredients
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           description: Name of the meal
 *           example: "Margherita Pizza"
 *         description:
 *           type: string
 *           minLength: 10
 *           maxLength: 500
 *           description: Detailed description of the meal
 *           example: "Classic pizza with tomato sauce, mozzarella, and fresh basil"
 *         price:
 *           type: number
 *           minimum: 0.01
 *           description: Price of the meal in USD
 *           example: 12.99
 *         category:
 *           type: string
 *           enum: [appetizer, main_course, dessert, beverage, salad, soup, sandwich, pizza, pasta, seafood, meat, vegetarian, vegan]
 *           description: Category of the meal
 *           example: "pizza"
 *         preparationTime:
 *           type: integer
 *           minimum: 1
 *           maximum: 180
 *           description: Preparation time in minutes
 *           example: 15
 *         ingredients:
 *           type: array
 *           minItems: 1
 *           items:
 *             type: string
 *           description: List of ingredients
 *           example: ["tomato sauce", "mozzarella cheese", "fresh basil", "olive oil"]
 *         imageUrl:
 *           type: string
 *           format: uri
 *           description: URL of the meal image
 *           example: "https://example.com/margherita-pizza.jpg"
 *         isAvailable:
 *           type: boolean
 *           default: true
 *           description: Whether the meal is currently available
 *         allergens:
 *           type: array
 *           items:
 *             type: string
 *             enum: [gluten, dairy, nuts, eggs, soy, shellfish, fish]
 *           description: List of allergens in the meal
 *           example: ["gluten", "dairy"]
 *         spiceLevel:
 *           type: string
 *           enum: [mild, medium, hot, very_hot]
 *           default: mild
 *           description: Spice level of the meal
 *         nutritionalInfo:
 *           type: object
 *           properties:
 *             calories:
 *               type: integer
 *               minimum: 0
 *             protein:
 *               type: number
 *               minimum: 0
 *             carbs:
 *               type: number
 *               minimum: 0
 *             fat:
 *               type: number
 *               minimum: 0
 *     UpdateMealRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *         description:
 *           type: string
 *           minLength: 10
 *           maxLength: 500
 *         price:
 *           type: number
 *           minimum: 0.01
 *         category:
 *           type: string
 *           enum: [appetizer, main_course, dessert, beverage, salad, soup, sandwich, pizza, pasta, seafood, meat, vegetarian, vegan]
 *         preparationTime:
 *           type: integer
 *           minimum: 1
 *           maximum: 180
 *         ingredients:
 *           type: array
 *           items:
 *             type: string
 *         imageUrl:
 *           type: string
 *           format: uri
 *         isAvailable:
 *           type: boolean
 *         allergens:
 *           type: array
 *           items:
 *             type: string
 *         spiceLevel:
 *           type: string
 *           enum: [mild, medium, hot, very_hot]
 *         nutritionalInfo:
 *           type: object
 *     RestaurantProfile:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *         description:
 *           type: string
 *           maxLength: 1000
 *         cuisine:
 *           type: string
 *           enum: [Italian, Chinese, Mexican, Indian, American, Thai, Japanese, Mediterranean, French, Greek]
 *         address:
 *           type: object
 *           properties:
 *             street:
 *               type: string
 *             city:
 *               type: string
 *             state:
 *               type: string
 *             zipCode:
 *               type: string
 *             coordinates:
 *               type: object
 *               properties:
 *                 lat:
 *                   type: number
 *                 lng:
 *                   type: number
 *         phone:
 *           type: string
 *           pattern: '^[+]?[1-9]\\d{1,14}$'
 *         email:
 *           type: string
 *           format: email
 *         openingHours:
 *           type: object
 *         isOpen:
 *           type: boolean
 *         deliveryFee:
 *           type: number
 *           minimum: 0
 *         minimumOrder:
 *           type: number
 *           minimum: 0
 *         imageUrl:
 *           type: string
 *           format: uri
 *     SetDiscountRequest:
 *       type: object
 *       required:
 *         - percentage
 *         - validUntil
 *       properties:
 *         percentage:
 *           type: number
 *           minimum: 1
 *           maximum: 99
 *           description: Discount percentage (1-99%)
 *           example: 15
 *         validUntil:
 *           type: string
 *           format: date-time
 *           description: Discount expiration date and time
 *           example: "2025-07-30T23:59:59.000Z"
 *         description:
 *           type: string
 *           maxLength: 200
 *           description: Optional description for the discount
 *           example: "Weekend special offer"
 *     RestaurantDashboard:
 *       type: object
 *       properties:
 *         todayStats:
 *           type: object
 *           properties:
 *             orders:
 *               type: integer
 *             revenue:
 *               type: number
 *             avgOrderValue:
 *               type: number
 *         weeklyStats:
 *           type: object
 *         monthlyStats:
 *           type: object
 *         recentOrders:
 *           type: array
 *           items:
 *             type: object
 *         popularMeals:
 *           type: array
 *           items:
 *             type: object
 *         notifications:
 *           type: array
 *           items:
 *             type: object
 *     RestaurantAnalytics:
 *       type: object
 *       properties:
 *         revenue:
 *           type: object
 *           properties:
 *             total:
 *               type: number
 *             byPeriod:
 *               type: array
 *         orders:
 *           type: object
 *         customerInsights:
 *           type: object
 *         mealPerformance:
 *           type: array
 *           items:
 *             type: object
 */

/**
 * @swagger
 * tags:
 *   name: Restaurant Management
 *   description: Restaurant owner management endpoints - requires restaurant authentication
 */

/**
 * @swagger
 * /api/restaurants/manage/dashboard:
 *   get:
 *     summary: Get restaurant dashboard data
 *     description: Retrieve comprehensive dashboard data including today's stats, recent orders, and key performance indicators
 *     tags: [Restaurant Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
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
 *                         dashboard:
 *                           $ref: '#/components/schemas/RestaurantDashboard'
 *             example:
 *               success: true
 *               message: "Dashboard data retrieved successfully"
 *               data:
 *                 dashboard:
 *                   todayStats:
 *                     orders: 25
 *                     revenue: 456.75
 *                     avgOrderValue: 18.27
 *                   weeklyStats:
 *                     orders: 156
 *                     revenue: 2845.50
 *                   recentOrders:
 *                     - orderId: "ORD-2025-001234"
 *                       customer: "John D."
 *                       items: 3
 *                       total: 28.99
 *                       status: "preparing"
 *                   popularMeals:
 *                     - name: "Margherita Pizza"
 *                       orders: 45
 *                       revenue: 584.55
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       403:
 *         description: Forbidden - Not a restaurant owner
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.get('/dashboard', restaurantUserController.getDashboard);

/**
 * @swagger
 * /api/restaurant/analytics:
 *   get:
 *     summary: Get restaurant analytics
 *     tags: [Restaurant Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/analytics', restaurantUserController.getAnalytics);

/**
 * @swagger
 * /api/restaurant/profile:
 *   put:
 *     summary: Update restaurant profile
 *     tags: [Restaurant Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               cuisine:
 *                 type: string
 *               address:
 *                 type: object
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               isOpen:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 */
router.put('/profile', restaurantUserController.updateProfile);

/**
 * @swagger
 * /api/restaurant/operational-status:
 *   patch:
 *     summary: Toggle restaurant operational status
 *     tags: [Restaurant Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Operational status toggled successfully
 *       401:
 *         description: Unauthorized
 */
router.patch(
  '/operational-status',
  restaurantUserController.toggleOperationalStatus,
);

/**
 * @swagger
 * /api/restaurant/meals:
 *   get:
 *     summary: Get restaurant's meals
 *     tags: [Restaurant Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Meals retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/meals', restaurantUserController.getMyMeals);

/**
 * @swagger
 * /api/restaurants/manage/meals:
 *   post:
 *     summary: Create a new meal
 *     description: Add a new meal to the restaurant's menu with detailed information including ingredients, nutritional data, and pricing
 *     tags: [Restaurant Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateMealRequest'
 *           example:
 *             name: "Margherita Pizza"
 *             description: "Classic pizza with tomato sauce, mozzarella, and fresh basil"
 *             price: 12.99
 *             category: "pizza"
 *             preparationTime: 15
 *             ingredients: ["tomato sauce", "mozzarella cheese", "fresh basil", "olive oil"]
 *             imageUrl: "https://example.com/margherita-pizza.jpg"
 *             isAvailable: true
 *             allergens: ["gluten", "dairy"]
 *             spiceLevel: "mild"
 *             nutritionalInfo:
 *               calories: 285
 *               protein: 12.2
 *               carbs: 35.6
 *               fat: 10.4
 *     responses:
 *       201:
 *         description: Meal created successfully
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
 *             example:
 *               success: true
 *               message: "Meal created successfully"
 *               data:
 *                 meal:
 *                   _id: "507f1f77bcf86cd799439012"
 *                   name: "Margherita Pizza"
 *                   price: 12.99
 *                   category: "pizza"
 *                   isAvailable: true
 *                   createdAt: "2025-07-25T18:30:00.000Z"
 *       400:
 *         description: Validation errors or invalid data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               success: false
 *               message: "Validation failed"
 *               error: "Price must be a positive number"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       403:
 *         description: Forbidden - Not a restaurant owner
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       409:
 *         description: Meal with the same name already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.post('/meals', validateCreateMeal, restaurantUserController.createMeal);

/**
 * @swagger
 * /api/restaurants/manage/meals/{mealId}:
 *   put:
 *     summary: Update a meal
 *     description: Update an existing meal's information including name, price, description, and availability
 *     tags: [Restaurant Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: mealId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: MongoDB ObjectId of the meal to update
 *         example: "507f1f77bcf86cd799439012"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateMealRequest'
 *           example:
 *             name: "Premium Margherita Pizza"
 *             description: "Classic pizza with premium tomato sauce, fresh mozzarella, and basil"
 *             price: 15.99
 *             category: "pizza"
 *             preparationTime: 18
 *             ingredients: ["premium tomato sauce", "fresh mozzarella", "organic basil", "extra virgin olive oil"]
 *             imageUrl: "https://example.com/premium-margherita.jpg"
 *             isAvailable: true
 *     responses:
 *       200:
 *         description: Meal updated successfully
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
 *                         changes:
 *                           type: object
 *                           description: Summary of what was changed
 *             example:
 *               success: true
 *               message: "Meal updated successfully"
 *               data:
 *                 meal:
 *                   _id: "507f1f77bcf86cd799439012"
 *                   name: "Premium Margherita Pizza"
 *                   price: 15.99
 *                   updatedAt: "2025-07-25T18:45:00.000Z"
 *                 changes:
 *                   name: "changed"
 *                   price: "changed"
 *                   description: "changed"
 *       400:
 *         description: Validation errors or invalid data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Meal not found or doesn't belong to this restaurant
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               success: false
 *               message: "Meal not found"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       403:
 *         description: Forbidden - Not authorized to update this meal
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.put(
  '/meals/:mealId',
  validateMealId,
  validateUpdateMeal,
  restaurantUserController.updateMeal,
);

/**
 * @swagger
 * /api/restaurants/manage/meals/{mealId}:
 *   delete:
 *     summary: Delete a meal
 *     description: Remove a meal from the restaurant menu permanently
 *     tags: [Restaurant Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: mealId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: MongoDB ObjectId of the meal to delete
 *         example: "507f1f77bcf86cd799439012"
 *     responses:
 *       200:
 *         description: Meal deleted successfully
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
 *                         deletedMeal:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                             name:
 *                               type: string
 *                             deletedAt:
 *                               type: string
 *                               format: date-time
 *             example:
 *               success: true
 *               message: "Meal deleted successfully"
 *               data:
 *                 deletedMeal:
 *                   _id: "507f1f77bcf86cd799439012"
 *                   name: "Premium Margherita Pizza"
 *                   deletedAt: "2025-07-25T18:45:00.000Z"
 *       404:
 *         description: Meal not found or doesn't belong to this restaurant
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               success: false
 *               message: "Meal not found"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       403:
 *         description: Forbidden - Not authorized to delete this meal
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       409:
 *         description: Cannot delete meal - it's part of active orders
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               success: false
 *               message: "Cannot delete meal. It's currently part of active orders."
 */
router.delete(
  '/meals/:mealId',
  validateMealId,
  restaurantUserController.deleteMeal,
);

/**
 * @swagger
 * /api/restaurant/meals/{mealId}/availability:
 *   patch:
 *     summary: Toggle meal availability
 *     tags: [Restaurant Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: mealId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Meal availability updated successfully
 *       404:
 *         description: Meal not found
 *       401:
 *         description: Unauthorized
 */
router.patch(
  '/meals/:mealId/availability',
  validateMealId,
  restaurantUserController.toggleMealAvailability,
);

/**
 * @swagger
 * /api/restaurant/meals/{mealId}/discount:
 *   post:
 *     summary: Set meal discount
 *     tags: [Restaurant Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: mealId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - percentage
 *               - validUntil
 *             properties:
 *               percentage:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 99
 *               validUntil:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Discount set successfully
 *       404:
 *         description: Meal not found
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/meals/:mealId/discount',
  validateMealId,
  validateMealDiscount,
  restaurantUserController.setMealDiscount,
);

/**
 * @swagger
 * /api/restaurant/meals/{mealId}/discount:
 *   delete:
 *     summary: Remove meal discount
 *     tags: [Restaurant Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: mealId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Discount removed successfully
 *       404:
 *         description: Meal not found
 *       401:
 *         description: Unauthorized
 */
router.delete(
  '/meals/:mealId/discount',
  validateMealId,
  restaurantUserController.removeMealDiscount,
);

export default router;
