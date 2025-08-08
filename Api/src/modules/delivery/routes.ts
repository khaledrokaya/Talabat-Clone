import { Router } from 'express';
import { DeliveryController } from './controllers/delivery.controller';
import { authenticate, authorize } from '../shared/middlewares/auth.middleware';
import { validateRequest } from '../shared/middlewares/validation.middleware';
import { body, param } from 'express-validator';

const router = Router();
const deliveryController = new DeliveryController();

// Apply authentication to all delivery routes
router.use(authenticate);
router.use(authorize('delivery'));

/**
 * @swagger
 * components:
 *   schemas:
 *     DeliveryLocation:
 *       type: object
 *       required:
 *         - coordinates
 *       properties:
 *         coordinates:
 *           type: array
 *           items:
 *             type: number
 *           minItems: 2
 *           maxItems: 2
 *           description: Longitude and latitude [lng, lat]
 *           example: [-74.006, 40.7128]
 *     DeliveryAvailability:
 *       type: object
 *       required:
 *         - isOnline
 *       properties:
 *         isOnline:
 *           type: boolean
 *           description: Online status of delivery person
 *           example: true
 *     DeliveryOrderStatus:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [picked_up, on_the_way, delivered]
 *           description: Current delivery status
 *           example: "picked_up"
 *     DeliveryOrder:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Order ID
 *         customer:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             phone:
 *               type: string
 *             address:
 *               type: object
 *         restaurant:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             address:
 *               type: object
 *         items:
 *           type: array
 *           items:
 *             type: object
 *         totalAmount:
 *           type: number
 *         deliveryFee:
 *           type: number
 *         status:
 *           type: string
 *         estimatedDeliveryTime:
 *           type: string
 *           format: date-time
 *     DeliveryEarnings:
 *       type: object
 *       properties:
 *         totalEarnings:
 *           type: number
 *           description: Total earnings for the period
 *         deliveryCount:
 *           type: number
 *           description: Number of deliveries completed
 *         averageEarningPerDelivery:
 *           type: number
 *         period:
 *           type: string
 *           description: Time period for earnings
 *         breakdown:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *               earnings:
 *                 type: number
 *               deliveries:
 *                 type: number
 *     DeliveryStats:
 *       type: object
 *       properties:
 *         totalDeliveries:
 *           type: number
 *         completedDeliveries:
 *           type: number
 *         cancelledDeliveries:
 *           type: number
 *         averageRating:
 *           type: number
 *         totalEarnings:
 *           type: number
 *         onTimeDeliveryRate:
 *           type: number
 *         averageDeliveryTime:
 *           type: number
 *     ApiResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
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
 *   name: Delivery
 *   description: Delivery management endpoints for delivery personnel
 */

/**
 * @swagger
 * /api/delivery/location:
 *   patch:
 *     summary: Update delivery person location
 *     description: Updates the current location of the delivery person for order tracking
 *     tags: [Delivery]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DeliveryLocation'
 *           example:
 *             coordinates: [-74.006, 40.7128]
 *     responses:
 *       200:
 *         description: Location updated successfully
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
 *                         location:
 *                           type: object
 *                           properties:
 *                             type:
 *                               type: string
 *                               example: "Point"
 *                             coordinates:
 *                               type: array
 *                               items:
 *                                 type: number
 *                               example: [-74.006, 40.7128]
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *             example:
 *               success: true
 *               message: "Location updated successfully"
 *               data:
 *                 location:
 *                   type: "Point"
 *                   coordinates: [-74.006, 40.7128]
 *                 updatedAt: "2025-07-25T18:30:00.000Z"
 *       400:
 *         description: Invalid coordinates format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               success: false
 *               message: "Coordinates must be [lng, lat]"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       403:
 *         description: Forbidden - Not a delivery person
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.patch(
  '/location',
  body('coordinates')
    .isArray({ min: 2, max: 2 })
    .withMessage('Coordinates must be [lng, lat]'),
  validateRequest,
  deliveryController.updateLocation,
);

/**
 * @swagger
 * /api/delivery/availability:
 *   patch:
 *     summary: Update availability status
 *     description: Toggle delivery person online/offline status for receiving new orders
 *     tags: [Delivery]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DeliveryAvailability'
 *           example:
 *             isOnline: true
 *     responses:
 *       200:
 *         description: Availability updated successfully
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
 *                         isOnline:
 *                           type: boolean
 *                         statusChangedAt:
 *                           type: string
 *                           format: date-time
 *             example:
 *               success: true
 *               message: "Availability updated successfully"
 *               data:
 *                 isOnline: true
 *                 statusChangedAt: "2025-07-25T18:30:00.000Z"
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       403:
 *         description: Forbidden - Not a delivery person
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.patch(
  '/availability',
  body('isOnline').isBoolean().withMessage('isOnline must be a boolean'),
  validateRequest,
  deliveryController.updateAvailability,
);

/**
 * @swagger
 * /api/delivery/orders/{orderId}/accept:
 *   post:
 *     summary: Accept an order for delivery
 *     description: Accept a pending delivery order and start the delivery process
 *     tags: [Delivery]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: MongoDB ObjectId of the order
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Order accepted successfully
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
 *                         orderId:
 *                           type: string
 *                         status:
 *                           type: string
 *                           example: "accepted"
 *                         acceptedAt:
 *                           type: string
 *                           format: date-time
 *                         estimatedPickupTime:
 *                           type: string
 *                           format: date-time
 *             example:
 *               success: true
 *               message: "Order accepted successfully"
 *               data:
 *                 orderId: "507f1f77bcf86cd799439011"
 *                 status: "accepted"
 *                 acceptedAt: "2025-07-25T18:30:00.000Z"
 *                 estimatedPickupTime: "2025-07-25T19:00:00.000Z"
 *       400:
 *         description: Invalid order ID or order cannot be accepted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               success: false
 *               message: "Order is no longer available for delivery"
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       403:
 *         description: Forbidden - Not a delivery person
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.post(
  '/orders/:orderId/accept',
  param('orderId').isMongoId().withMessage('Invalid order ID'),
  validateRequest,
  deliveryController.acceptOrder,
);

/**
 * @swagger
 * /api/delivery/orders/{orderId}/status:
 *   patch:
 *     summary: Update order delivery status
 *     description: Update the current status of an order during delivery process
 *     tags: [Delivery]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: MongoDB ObjectId of the order
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DeliveryOrderStatus'
 *           example:
 *             status: "picked_up"
 *     responses:
 *       200:
 *         description: Order status updated successfully
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
 *                         orderId:
 *                           type: string
 *                         status:
 *                           type: string
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                         estimatedDeliveryTime:
 *                           type: string
 *                           format: date-time
 *             example:
 *               success: true
 *               message: "Order status updated successfully"
 *               data:
 *                 orderId: "507f1f77bcf86cd799439011"
 *                 status: "picked_up"
 *                 updatedAt: "2025-07-25T18:45:00.000Z"
 *                 estimatedDeliveryTime: "2025-07-25T19:15:00.000Z"
 *       400:
 *         description: Invalid status or status transition not allowed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               success: false
 *               message: "Invalid status transition"
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       403:
 *         description: Forbidden - Not authorized to update this order
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.patch(
  '/orders/:orderId/status',
  param('orderId').isMongoId().withMessage('Invalid order ID'),
  body('status')
    .isIn(['picked_up', 'on_the_way', 'delivered'])
    .withMessage('Invalid status'),
  validateRequest,
  deliveryController.updateOrderStatus,
);

/**
 * @swagger
 * /api/delivery/orders:
 *   get:
 *     summary: Get delivery orders
 *     description: Retrieve list of orders assigned to the delivery person with optional filtering
 *     tags: [Delivery]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, accepted, picked_up, on_the_way, delivered, cancelled]
 *         description: Filter orders by delivery status
 *         example: "pending"
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
 *         description: Number of orders per page
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
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
 *                         orders:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/DeliveryOrder'
 *                         pagination:
 *                           type: object
 *                           properties:
 *                             page:
 *                               type: integer
 *                             limit:
 *                               type: integer
 *                             total:
 *                               type: integer
 *                             pages:
 *                               type: integer
 *             example:
 *               success: true
 *               message: "Orders retrieved successfully"
 *               data:
 *                 orders:
 *                   - _id: "507f1f77bcf86cd799439011"
 *                     customer:
 *                       name: "John Doe"
 *                       phone: "+1234567890"
 *                       address:
 *                         street: "123 Main St"
 *                         city: "New York"
 *                     restaurant:
 *                       name: "Pizza Palace"
 *                       address:
 *                         street: "456 Food Ave"
 *                         city: "New York"
 *                     totalAmount: 25.99
 *                     deliveryFee: 3.99
 *                     status: "pending"
 *                     estimatedDeliveryTime: "2025-07-25T19:30:00.000Z"
 *                 pagination:
 *                   page: 1
 *                   limit: 10
 *                   total: 25
 *                   pages: 3
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       403:
 *         description: Forbidden - Not a delivery person
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.get('/orders', deliveryController.getDeliveryOrders);

/**
 * @swagger
 * /api/delivery/earnings:
 *   get:
 *     summary: Get delivery earnings
 *     description: Retrieve earnings data for the delivery person with optional time period filtering
 *     tags: [Delivery]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *           default: month
 *         description: Time period for earnings calculation
 *         example: "month"
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for custom period (YYYY-MM-DD)
 *         example: "2025-07-01"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for custom period (YYYY-MM-DD)
 *         example: "2025-07-31"
 *     responses:
 *       200:
 *         description: Earnings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/DeliveryEarnings'
 *             example:
 *               success: true
 *               message: "Earnings retrieved successfully"
 *               data:
 *                 totalEarnings: 1250.75
 *                 deliveryCount: 85
 *                 averageEarningPerDelivery: 14.71
 *                 period: "month"
 *                 breakdown:
 *                   - date: "2025-07-01"
 *                     earnings: 45.25
 *                     deliveries: 3
 *                   - date: "2025-07-02"
 *                     earnings: 62.50
 *                     deliveries: 4
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       403:
 *         description: Forbidden - Not a delivery person
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.get('/earnings', deliveryController.getDeliveryEarnings);

/**
 * @swagger
 * /api/delivery/stats:
 *   get:
 *     summary: Get delivery statistics
 *     description: Retrieve comprehensive delivery statistics and performance metrics
 *     tags: [Delivery]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/DeliveryStats'
 *             example:
 *               success: true
 *               message: "Statistics retrieved successfully"
 *               data:
 *                 totalDeliveries: 250
 *                 completedDeliveries: 235
 *                 cancelledDeliveries: 15
 *                 averageRating: 4.7
 *                 totalEarnings: 3250.50
 *                 onTimeDeliveryRate: 92.5
 *                 averageDeliveryTime: 28.5
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       403:
 *         description: Forbidden - Not a delivery person
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.get('/stats', deliveryController.getDeliveryStats);

export default router;
