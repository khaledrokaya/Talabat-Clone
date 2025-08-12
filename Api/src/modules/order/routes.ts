import { Router } from 'express';
import { OrderController } from './controllers/order.controller';
import { authenticate, authorize } from '../shared/middlewares/auth.middleware';

const router = Router();
const orderController = new OrderController();

/**
 * @swagger
 * components:
 *   schemas:
 *     OrderItem:
 *       type: object
 *       required:
 *         - mealId
 *         - quantity
 *       properties:
 *         mealId:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *           description: MongoDB ObjectId of the meal
 *           example: "507f1f77bcf86cd799439011"
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           maximum: 10
 *           description: Number of items
 *           example: 2
 *         specialInstructions:
 *           type: string
 *           maxLength: 500
 *           description: Special preparation instructions
 *           example: "Extra spicy, no onions"
 *     DeliveryAddress:
 *       type: object
 *       required:
 *         - street
 *         - city
 *         - coordinates
 *       properties:
 *         street:
 *           type: string
 *           minLength: 5
 *           maxLength: 200
 *           example: "123 Main Street, Apt 4B"
 *         city:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           example: "New York"
 *         state:
 *           type: string
 *           maxLength: 50
 *           example: "NY"
 *         zipCode:
 *           type: string
 *           pattern: '^[0-9]{5}(-[0-9]{4})?$'
 *           example: "10001"
 *         coordinates:
 *           type: object
 *           required:
 *             - lat
 *             - lng
 *           properties:
 *             lat:
 *               type: number
 *               minimum: -90
 *               maximum: 90
 *               example: 40.7128
 *             lng:
 *               type: number
 *               minimum: -180
 *               maximum: 180
 *               example: -74.0060
 *     CreateOrderRequest:
 *       type: object
 *       required:
 *         - restaurantId
 *         - items
 *         - deliveryAddress
 *       properties:
 *         restaurantId:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *           description: MongoDB ObjectId of the restaurant
 *           example: "507f1f77bcf86cd799439012"
 *         items:
 *           type: array
 *           minItems: 1
 *           maxItems: 20
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *         deliveryAddress:
 *           $ref: '#/components/schemas/DeliveryAddress'
 *         paymentMethod:
 *           type: string
 *           enum: [cash, card, wallet]
 *           default: cash
 *           description: Payment method for the order
 *           example: "card"
 *         couponCode:
 *           type: string
 *           pattern: '^[A-Z0-9]{4,20}$'
 *           description: Promotional coupon code
 *           example: "SAVE20"
 *         notes:
 *           type: string
 *           maxLength: 500
 *           description: Additional notes for the order
 *           example: "Please ring the doorbell twice"
 *     Order:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "507f1f77bcf86cd799439013"
 *         orderNumber:
 *           type: string
 *           example: "ORD-2025-001234"
 *         customer:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *             phone:
 *               type: string
 *             email:
 *               type: string
 *         restaurant:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *             address:
 *               type: object
 *             phone:
 *               type: string
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               meal:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   price:
 *                     type: number
 *                   imageUrl:
 *                     type: string
 *               quantity:
 *                 type: integer
 *               price:
 *                 type: number
 *               subtotal:
 *                 type: number
 *               specialInstructions:
 *                 type: string
 *         pricing:
 *           type: object
 *           properties:
 *             subtotal:
 *               type: number
 *             deliveryFee:
 *               type: number
 *             serviceFee:
 *               type: number
 *             tax:
 *               type: number
 *             discount:
 *               type: number
 *             total:
 *               type: number
 *         deliveryAddress:
 *           $ref: '#/components/schemas/DeliveryAddress'
 *         status:
 *           type: string
 *           enum: [pending, confirmed, preparing, ready, out_for_delivery, delivered, cancelled]
 *         paymentMethod:
 *           type: string
 *           enum: [cash, card, wallet]
 *         paymentStatus:
 *           type: string
 *           enum: [pending, paid, failed, refunded]
 *         estimatedDeliveryTime:
 *           type: string
 *           format: date-time
 *         actualDeliveryTime:
 *           type: string
 *           format: date-time
 *         deliveryPerson:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *             phone:
 *               type: string
 *             location:
 *               type: object
 *         rating:
 *           type: object
 *           properties:
 *             rating:
 *               type: number
 *               minimum: 1
 *               maximum: 5
 *             review:
 *               type: string
 *             deliveryRating:
 *               type: number
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     OrderTracking:
 *       type: object
 *       properties:
 *         orderId:
 *           type: string
 *         status:
 *           type: string
 *         estimatedDeliveryTime:
 *           type: string
 *           format: date-time
 *         timeline:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *               description:
 *                 type: string
 *         deliveryPerson:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             phone:
 *               type: string
 *             currentLocation:
 *               type: object
 *               properties:
 *                 lat:
 *                   type: number
 *                 lng:
 *                   type: number
 *         restaurant:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             phone:
 *               type: string
 *             preparationTime:
 *               type: integer
 *     OrderStats:
 *       type: object
 *       properties:
 *         totalOrders:
 *           type: integer
 *         completedOrders:
 *           type: integer
 *         cancelledOrders:
 *           type: integer
 *         pendingOrders:
 *           type: integer
 *         totalRevenue:
 *           type: number
 *         averageOrderValue:
 *           type: number
 *         popularMeals:
 *           type: array
 *           items:
 *             type: object
 *         ordersByStatus:
 *           type: object
 *         revenueByPeriod:
 *           type: array
 *           items:
 *             type: object
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
 *         details:
 *           type: array
 *           items:
 *             type: object
 */

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management endpoints for creating, tracking, and managing food orders
 */

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     description: Create a new food order with items, delivery address, and payment information
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrderRequest'
 *           example:
 *             restaurantId: "507f1f77bcf86cd799439012"
 *             items:
 *               - mealId: "507f1f77bcf86cd799439011"
 *                 quantity: 2
 *                 specialInstructions: "Extra spicy"
 *               - mealId: "507f1f77bcf86cd799439014"
 *                 quantity: 1
 *             deliveryAddress:
 *               street: "123 Main Street, Apt 4B"
 *               city: "New York"
 *               state: "NY"
 *               zipCode: "10001"
 *               coordinates:
 *                 lat: 40.7128
 *                 lng: -74.0060
 *             paymentMethod: "card"
 *             couponCode: "SAVE20"
 *             notes: "Please ring the doorbell twice"
 *     responses:
 *       201:
 *         description: Order created successfully
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
 *                         order:
 *                           $ref: '#/components/schemas/Order'
 *                         estimatedDeliveryTime:
 *                           type: string
 *                           format: date-time
 *             example:
 *               success: true
 *               message: "Order created successfully"
 *               data:
 *                 order:
 *                   _id: "507f1f77bcf86cd799439013"
 *                   orderNumber: "ORD-2025-001234"
 *                   status: "pending"
 *                   pricing:
 *                     subtotal: 25.99
 *                     deliveryFee: 3.99
 *                     serviceFee: 1.50
 *                     tax: 2.45
 *                     total: 33.93
 *                 estimatedDeliveryTime: "2025-07-25T19:30:00.000Z"
 *       400:
 *         description: Invalid order data or validation errors
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               success: false
 *               message: "Validation failed"
 *               details:
 *                 - field: "items"
 *                   message: "At least one item is required"
 *                 - field: "deliveryAddress.coordinates"
 *                   message: "Valid coordinates are required"
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Restaurant or meal not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       422:
 *         description: Restaurant closed or items unavailable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.post('/', authenticate, orderController.createOrder);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     description: Retrieve detailed information about a specific order including items, pricing, and status
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: MongoDB ObjectId of the order
 *         example: "507f1f77bcf86cd799439013"
 *     responses:
 *       200:
 *         description: Order retrieved successfully
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
 *                         order:
 *                           $ref: '#/components/schemas/Order'
 *             example:
 *               success: true
 *               message: "Order retrieved successfully"
 *               data:
 *                 order:
 *                   _id: "507f1f77bcf86cd799439013"
 *                   orderNumber: "ORD-2025-001234"
 *                   customer:
 *                     name: "John Doe"
 *                     phone: "+1234567890"
 *                     email: "john@example.com"
 *                   restaurant:
 *                     name: "Pizza Palace"
 *                     address:
 *                       street: "456 Food Ave"
 *                       city: "New York"
 *                   items:
 *                     - meal:
 *                         name: "Margherita Pizza"
 *                         price: 12.99
 *                       quantity: 2
 *                       subtotal: 25.98
 *                   status: "preparing"
 *                   pricing:
 *                     total: 33.93
 *                   estimatedDeliveryTime: "2025-07-25T19:30:00.000Z"
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               success: false
 *               message: "Order not found"
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       403:
 *         description: Not authorized to view this order
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
// Admin Stats Route (MUST come before /:id route)
router.get(
  '/stats',
  authenticate,
  authorize('admin'),
  orderController.getOrderStats,
);

router.get('/:id', authenticate, orderController.getOrderById);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get orders with pagination (Smart routing based on user role)
 *     description: Retrieve a paginated list of orders. Routes to user orders for customers or restaurant orders for restaurant owners.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
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
 *         description: Number of orders per page
 *         example: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, preparing, ready, out_for_delivery, delivered, cancelled]
 *         description: Filter orders by status
 *         example: "delivered"
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, total]
 *           default: createdAt
 *         description: Sort orders by field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
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
 *                             $ref: '#/components/schemas/Order'
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
 *                             hasNext:
 *                               type: boolean
 *                             hasPrev:
 *                               type: boolean
 *             example:
 *               success: true
 *               message: "Orders retrieved successfully"
 *               data:
 *                 orders:
 *                   - _id: "507f1f77bcf86cd799439013"
 *                     orderNumber: "ORD-2025-001234"
 *                     restaurant:
 *                       name: "Pizza Palace"
 *                     status: "delivered"
 *                     pricing:
 *                       total: 33.93
 *                     createdAt: "2025-07-25T18:00:00.000Z"
 *                 pagination:
 *                   page: 1
 *                   limit: 10
 *                   total: 25
 *                   pages: 3
 *                   hasNext: true
 *                   hasPrev: false
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
// Smart Orders Route - returns orders based on user role
router.get(
  '/',
  authenticate,
  async (req: any, res: any, next: any) => {
    console.log('=== ORDER ROUTE DEBUG ===');
    console.log('User ID:', req.user._id);
    console.log('User Role:', req.user.role);
    console.log('User Email:', req.user.email);

    // Determine which controller method to call based on user role
    if (req.user.role === 'restaurant_owner') {
      console.log('Calling getRestaurantOrders for restaurant_owner');
      return orderController.getRestaurantOrders(req, res, next);
    } else if (req.user.role === 'customer') {
      console.log('Calling getUserOrders for customer');
      return orderController.getUserOrders(req, res, next);
    } else {
      console.log('Access denied for role:', req.user.role);
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only customers and restaurant owners can view orders.',
      });
    }
  }
);

/**
 * @swagger
 * /api/orders/{id}/status:
 *   patch:
 *     summary: Update order status
 *     description: Update the status of an order (typically used by restaurant or delivery personnel)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: MongoDB ObjectId of the order
 *         example: "507f1f77bcf86cd799439013"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, preparing, ready, out_for_delivery, delivered, cancelled]
 *                 description: New status for the order
 *               estimatedTime:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 120
 *                 description: Estimated time in minutes (for preparing status)
 *               notes:
 *                 type: string
 *                 maxLength: 500
 *                 description: Additional notes about the status change
 *           example:
 *             status: "preparing"
 *             estimatedTime: 25
 *             notes: "Started preparing your order"
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
 *                         previousStatus:
 *                           type: string
 *                         newStatus:
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
 *                 orderId: "507f1f77bcf86cd799439013"
 *                 previousStatus: "confirmed"
 *                 newStatus: "preparing"
 *                 updatedAt: "2025-07-25T18:45:00.000Z"
 *                 estimatedDeliveryTime: "2025-07-25T19:30:00.000Z"
 *       400:
 *         description: Invalid status transition or data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               success: false
 *               message: "Cannot change status from delivered to preparing"
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       403:
 *         description: Not authorized to update this order
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.patch('/:id/status', authenticate, orderController.updateOrderStatus);

/**
 * @swagger
 * /api/orders/{id}/cancel:
 *   patch:
 *     summary: Cancel order
 *     description: Cancel an order if it's still in a cancellable state (pending, confirmed, or preparing)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: MongoDB ObjectId of the order
 *         example: "507f1f77bcf86cd799439013"
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 enum: [customer_request, restaurant_unavailable, item_unavailable, payment_failed, other]
 *                 description: Reason for cancellation
 *                 example: "customer_request"
 *               details:
 *                 type: string
 *                 maxLength: 500
 *                 description: Additional details about the cancellation
 *                 example: "Customer changed their mind"
 *           example:
 *             reason: "customer_request"
 *             details: "Customer changed their mind"
 *     responses:
 *       200:
 *         description: Order cancelled successfully
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
 *                           example: "cancelled"
 *                         cancelledAt:
 *                           type: string
 *                           format: date-time
 *                         refundAmount:
 *                           type: number
 *                           description: Amount to be refunded (if applicable)
 *                         refundStatus:
 *                           type: string
 *                           enum: [pending, processing, completed, failed]
 *             example:
 *               success: true
 *               message: "Order cancelled successfully"
 *               data:
 *                 orderId: "507f1f77bcf86cd799439013"
 *                 status: "cancelled"
 *                 cancelledAt: "2025-07-25T18:45:00.000Z"
 *                 refundAmount: 33.93
 *                 refundStatus: "pending"
 *       400:
 *         description: Order cannot be cancelled (already out for delivery or delivered)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               success: false
 *               message: "Order cannot be cancelled as it's already out for delivery"
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       403:
 *         description: Not authorized to cancel this order
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.patch('/:id/cancel', authenticate, orderController.cancelOrder);

/**
 * @swagger
 * /api/orders/{id}/rate:
 *   post:
 *     summary: Rate and review order
 *     description: Submit a rating and review for a completed order, including food quality and delivery service
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: MongoDB ObjectId of the order
 *         example: "507f1f77bcf86cd799439013"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 multipleOf: 0.5
 *                 description: Overall rating for the order (1-5 stars)
 *                 example: 4.5
 *               review:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 1000
 *                 description: Written review of the order
 *                 example: "Great food, delivered on time. Pizza was hot and delicious!"
 *               deliveryRating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 multipleOf: 0.5
 *                 description: Rating specifically for delivery service
 *                 example: 5
 *               foodRating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 multipleOf: 0.5
 *                 description: Rating specifically for food quality
 *                 example: 4
 *           example:
 *             rating: 4.5
 *             review: "Great food, delivered on time. Pizza was hot and delicious!"
 *             deliveryRating: 5
 *             foodRating: 4
 *     responses:
 *       200:
 *         description: Order rated successfully
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
 *                         rating:
 *                           type: object
 *                           properties:
 *                             rating:
 *                               type: number
 *                             review:
 *                               type: string
 *                             deliveryRating:
 *                               type: number
 *                             foodRating:
 *                               type: number
 *                             createdAt:
 *                               type: string
 *                               format: date-time
 *             example:
 *               success: true
 *               message: "Order rated successfully"
 *               data:
 *                 orderId: "507f1f77bcf86cd799439013"
 *                 rating:
 *                   rating: 4.5
 *                   review: "Great food, delivered on time. Pizza was hot and delicious!"
 *                   deliveryRating: 5
 *                   foodRating: 4
 *                   createdAt: "2025-07-25T19:30:00.000Z"
 *       400:
 *         description: Order cannot be rated (not delivered) or already rated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               success: false
 *               message: "Order has already been rated"
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       403:
 *         description: Not authorized to rate this order
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.post('/:id/rate', authenticate, orderController.rateOrder);

/**
 * @swagger
 * /api/orders/{id}/track:
 *   get:
 *     summary: Track order real-time
 *     description: Get real-time tracking information for an active order including delivery person location and status updates
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: MongoDB ObjectId of the order
 *         example: "507f1f77bcf86cd799439013"
 *     responses:
 *       200:
 *         description: Order tracking information retrieved successfully
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
 *                         tracking:
 *                           $ref: '#/components/schemas/OrderTracking'
 *             example:
 *               success: true
 *               message: "Order tracking information retrieved successfully"
 *               data:
 *                 tracking:
 *                   orderId: "507f1f77bcf86cd799439013"
 *                   status: "out_for_delivery"
 *                   estimatedDeliveryTime: "2025-07-25T19:30:00.000Z"
 *                   timeline:
 *                     - status: "pending"
 *                       timestamp: "2025-07-25T18:00:00.000Z"
 *                       description: "Order placed"
 *                     - status: "confirmed"
 *                       timestamp: "2025-07-25T18:05:00.000Z"
 *                       description: "Order confirmed by restaurant"
 *                     - status: "preparing"
 *                       timestamp: "2025-07-25T18:10:00.000Z"
 *                       description: "Kitchen started preparing your order"
 *                     - status: "out_for_delivery"
 *                       timestamp: "2025-07-25T18:45:00.000Z"
 *                       description: "Order picked up by delivery person"
 *                   deliveryPerson:
 *                     name: "Mike Johnson"
 *                     phone: "+1234567891"
 *                     currentLocation:
 *                       lat: 40.7580
 *                       lng: -73.9855
 *                   restaurant:
 *                     name: "Pizza Palace"
 *                     phone: "+1234567892"
 *                     preparationTime: 25
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       403:
 *         description: Not authorized to track this order
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.get('/:id/track', authenticate, orderController.trackOrder);

/**
 * @swagger
 * /api/orders/stats:
 *   get:
 *     summary: Get order statistics (Admin only)
 *     description: Retrieve comprehensive order statistics and analytics for administrative purposes
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for statistics period (YYYY-MM-DD)
 *         example: "2025-07-01"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for statistics period (YYYY-MM-DD)
 *         example: "2025-07-31"
 *       - in: query
 *         name: groupBy
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *           default: day
 *         description: Group statistics by time period
 *       - in: query
 *         name: restaurantId
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Filter statistics by specific restaurant
 *     responses:
 *       200:
 *         description: Order statistics retrieved successfully
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
 *                         stats:
 *                           $ref: '#/components/schemas/OrderStats'
 *             example:
 *               success: true
 *               message: "Order statistics retrieved successfully"
 *               data:
 *                 stats:
 *                   totalOrders: 1250
 *                   completedOrders: 1100
 *                   cancelledOrders: 85
 *                   pendingOrders: 65
 *                   totalRevenue: 45750.25
 *                   averageOrderValue: 36.60
 *                   popularMeals:
 *                     - name: "Margherita Pizza"
 *                       orders: 145
 *                       revenue: 1885.25
 *                     - name: "Chicken Burger"
 *                       orders: 128
 *                       revenue: 1792.50
 *                   ordersByStatus:
 *                     pending: 65
 *                     confirmed: 45
 *                     preparing: 25
 *                     ready: 15
 *                     out_for_delivery: 8
 *                     delivered: 1100
 *                     cancelled: 85
 *                   revenueByPeriod:
 *                     - date: "2025-07-01"
 *                       orders: 45
 *                       revenue: 1650.75
 *                     - date: "2025-07-02"
 *                       orders: 52
 *                       revenue: 1892.50
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       403:
 *         description: Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               success: false
 *               message: "Admin access required to view order statistics"
 */
// Explicit Restaurant Orders Route (alternative endpoint)
router.get(
  '/restaurant',
  authenticate,
  authorize('restaurant_owner'),
  orderController.getRestaurantOrders,
);

export default router;
