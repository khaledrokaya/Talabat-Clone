import { Router } from 'express';
import { CustomerController } from './controllers/customer.controller';
import { authenticate, authorize } from '../shared/middlewares/auth.middleware';
import { validateRequest } from '../shared/middlewares/validation.middleware';
import { body, param } from 'express-validator';

const router = Router();
const customerController = new CustomerController();

// All customer routes require authentication and customer role
router.use(authenticate);
router.use(authorize('customer'));

/**
 * @swagger
 * tags:
 *   name: Customer
 *   description: Customer management endpoints
 */

/**
 * @swagger
 * /api/customer/profile:
 *   get:
 *     summary: Get customer profile
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Profile retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     role:
 *                       type: string
 *                       example: "customer"
 *                     isActive:
 *                       type: boolean
 *                     isEmailVerified:
 *                       type: boolean
 *                     address:
 *                       type: object
 *                       properties:
 *                         street:
 *                           type: string
 *                         city:
 *                           type: string
 *                         state:
 *                           type: string
 *                         zipCode:
 *                           type: string
 *                         coordinates:
 *                           type: object
 *                           properties:
 *                             lat:
 *                               type: number
 *                             lng:
 *                               type: number
 *                     deliveryPreferences:
 *                       type: object
 *                       properties:
 *                         preferredDeliveryTime:
 *                           type: string
 *                         specialInstructions:
 *                           type: string
 *                     favoriteRestaurants:
 *                       type: array
 *                       items:
 *                         type: string
 *                     orderHistory:
 *                       type: array
 *                       items:
 *                         type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Customer access required
 */
router.get('/profile', customerController.getProfile);

/**
 * @swagger
 * /api/customer/profile:
 *   put:
 *     summary: Update customer profile
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: Customer's first name
 *               lastName:
 *                 type: string
 *                 description: Customer's last name
 *               phone:
 *                 type: string
 *                 description: Customer's phone number
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   zipCode:
 *                     type: string
 *                   coordinates:
 *                     type: object
 *                     properties:
 *                       lat:
 *                         type: number
 *                       lng:
 *                         type: number
 *               deliveryPreferences:
 *                 type: object
 *                 properties:
 *                   preferredDeliveryTime:
 *                     type: string
 *                     description: Preferred delivery time
 *                   specialInstructions:
 *                     type: string
 *                     maxLength: 200
 *                     description: Special delivery instructions
 *             example:
 *               firstName: "John"
 *               lastName: "Doe"
 *               phone: "+1234567890"
 *               address:
 *                 street: "123 Main St"
 *                 city: "New York"
 *                 state: "NY"
 *                 zipCode: "10001"
 *               deliveryPreferences:
 *                 preferredDeliveryTime: "18:00-20:00"
 *                 specialInstructions: "Ring doorbell twice"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Profile updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Customer'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Customer access required
 */
router.put(
  '/profile',
  body('firstName')
    .optional()
    .isString()
    .withMessage('First name must be a string'),
  body('lastName')
    .optional()
    .isString()
    .withMessage('Last name must be a string'),
  body('phone')
    .optional()
    .matches(/^\+?[\d\s-()]+$/)
    .withMessage('Invalid phone number'),
  body('deliveryPreferences.specialInstructions')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Special instructions cannot exceed 200 characters'),
  validateRequest,
  customerController.updateProfile,
);

/**
 * @swagger
 * /api/customer/favorites:
 *   post:
 *     summary: Add restaurant to favorites
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - restaurantId
 *             properties:
 *               restaurantId:
 *                 type: string
 *                 description: ID of the restaurant to add to favorites
 *             example:
 *               restaurantId: "60f7b1b3b3f3a40015f3b1b3"
 *     responses:
 *       200:
 *         description: Restaurant added to favorites successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Restaurant not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Customer access required
 */
router.post(
  '/favorites',
  body('restaurantId').isMongoId().withMessage('Invalid restaurant ID'),
  validateRequest,
  customerController.addToFavorites,
);

/**
 * @swagger
 * /api/customer/favorites:
 *   get:
 *     summary: Get favorite restaurants
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Favorite restaurants retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Favorite restaurants retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       restaurantDetails:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                       email:
 *                         type: string
 *                       isActive:
 *                         type: boolean
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Customer access required
 */
router.get('/favorites', customerController.getFavoriteRestaurants);

/**
 * @swagger
 * /api/customer/favorites/{restaurantId}:
 *   delete:
 *     summary: Remove restaurant from favorites
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *         description: Restaurant ID to remove from favorites
 *     responses:
 *       200:
 *         description: Restaurant removed from favorites successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Customer access required
 *       404:
 *         description: Restaurant not found in favorites
 */
router.delete(
  '/favorites/:restaurantId',
  param('restaurantId').isMongoId().withMessage('Invalid restaurant ID'),
  validateRequest,
  customerController.removeFromFavorites,
);

/**
 * @swagger
 * /api/customer/orders:
 *   get:
 *     summary: Get customer order history
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Order history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Order history retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     orders:
 *                       type: array
 *                       items:
 *                         type: object
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: number
 *                         totalPages:
 *                           type: number
 *                         totalOrders:
 *                           type: number
 *                         hasNext:
 *                           type: boolean
 *                         hasPrev:
 *                           type: boolean
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Customer access required
 */
router.get('/orders', customerController.getOrderHistory);

/**
 * @swagger
 * /api/customer/delivery-preferences:
 *   put:
 *     summary: Update delivery preferences
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               preferredDeliveryTime:
 *                 type: string
 *                 description: Preferred delivery time window
 *               specialInstructions:
 *                 type: string
 *                 maxLength: 200
 *                 description: Special delivery instructions
 *             example:
 *               preferredDeliveryTime: "18:00-20:00"
 *               specialInstructions: "Leave at front door"
 *     responses:
 *       200:
 *         description: Delivery preferences updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Customer access required
 */
router.put(
  '/delivery-preferences',
  body('specialInstructions')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Special instructions cannot exceed 200 characters'),
  validateRequest,
  customerController.updateDeliveryPreferences,
);

export default router;
