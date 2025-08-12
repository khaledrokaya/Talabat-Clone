import { Response, NextFunction } from 'express';
import { asyncHandler } from '../../shared/middlewares/error.middleware';
import { Helpers } from '../../shared/utils/helpers';
import { AuthenticatedRequest } from '../../shared/middlewares/auth.middleware';
import Order from '../schemas/order.schema';

export class OrderController {
  /**
   * Create a new order
   */
  createOrder = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
      const orderData = {
        ...req.body,
        customerId: req.user._id,
        orderNumber: this.generateOrderNumber(),
      };

      const order = new Order(orderData);
      await order.save();

      res
        .status(201)
        .json(
          Helpers.formatResponse(true, 'Order created successfully', order),
        );
    },
  );

  /**
   * Get order by ID
   */
  getOrderById = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
      const { id } = req.params;
      const order = await Order.findById(id)
        .populate('customerId', 'firstName lastName email phone')
        .populate('restaurantId', 'name location phone')
        .populate('deliveryPersonId', 'firstName lastName phone');

      if (!order) {
        return res
          .status(404)
          .json(Helpers.formatResponse(false, 'Order not found'));
      }

      res
        .status(200)
        .json(
          Helpers.formatResponse(true, 'Order retrieved successfully', order),
        );
    },
  );

  /**
   * Update order status
   */
  updateOrderStatus = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
      const { orderId } = req.params;
      const { status, statusReason } = req.body;

      const order = await Order.findById(orderId);
      if (!order) {
        return res
          .status(404)
          .json(Helpers.formatResponse(false, 'Order not found'));
      }

      order.status = status;
      if (statusReason) order.statusReason = statusReason;

      // Add status history
      order.statusHistory.push({
        status: status,
        timestamp: new Date(),
        updatedBy: req.user._id,
        note: statusReason,
      });

      await order.save();

      res
        .status(200)
        .json(
          Helpers.formatResponse(
            true,
            'Order status updated successfully',
            order,
          ),
        );
    },
  );

  /**
   * Get user orders
   */
  getUserOrders = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
      const { page = 1, limit = 10, status } = req.query;
      const filter: Record<string, any> = { customerId: req.user._id };
      if (status) filter.status = status;

      const skip = (Number(page) - 1) * Number(limit);
      const orders = await Order.find(filter)
        .populate('restaurantId', 'name location')
        .populate('deliveryPersonId', 'firstName lastName phone')
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 });

      const totalOrders = await Order.countDocuments(filter);
      const totalPages = Math.ceil(totalOrders / Number(limit));

      res.status(200).json(
        Helpers.formatResponse(true, 'Orders retrieved successfully', orders, {
          totalOrders,
          totalPages,
          currentPage: Number(page),
        }),
      );
    },
  );

  /**
   * Get restaurant orders
   */
  getRestaurantOrders = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
      const { page = 1, limit = 10, status } = req.query;
      const filter: any = { restaurantId: req.user._id };
      if (status) filter.status = status;
      const skip = (Number(page) - 1) * Number(limit);
      const orders = await Order.find(filter)
        .populate('customerId', 'firstName lastName phone')
        .populate('deliveryPersonId', 'firstName lastName phone')
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 });
      const totalOrders = await Order.countDocuments(filter);
      const totalPages = Math.ceil(totalOrders / Number(limit));

      res.status(200).json(
        Helpers.formatResponse(
          true,
          'Restaurant orders retrieved successfully',
          orders,
          {
            totalOrders,
            totalPages,
            currentPage: Number(page),
          },
        ),
      );
    },
  );

  /**
   * Assign delivery person to order
   */
  assignDeliveryPerson = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
      const { orderId } = req.params;
      const { deliveryPersonId } = req.body;

      const order = await Order.findById(orderId);
      if (!order) {
        return res
          .status(404)
          .json(Helpers.formatResponse(false, 'Order not found'));
      }

      order.deliveryPersonId = deliveryPersonId;
      order.status = 'assigned';

      order.statusHistory.push({
        status: 'assigned',
        timestamp: new Date(),
        updatedBy: req.user._id,
        note: 'Delivery person assigned',
      });

      await order.save();

      res
        .status(200)
        .json(
          Helpers.formatResponse(
            true,
            'Delivery person assigned successfully',
            order,
          ),
        );
    },
  );

  /**
   * Cancel order
   */
  cancelOrder = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
      const { orderId } = req.params;
      const { reason } = req.body;

      const order = await Order.findById(orderId);
      if (!order) {
        return res
          .status(404)
          .json(Helpers.formatResponse(false, 'Order not found'));
      }

      if (['delivered', 'cancelled'].includes(order.status)) {
        return res
          .status(400)
          .json(Helpers.formatResponse(false, 'Order cannot be cancelled'));
      }

      order.status = 'cancelled';
      order.statusReason = reason;

      order.statusHistory.push({
        status: 'cancelled',
        timestamp: new Date(),
        updatedBy: req.user._id,
        note: reason,
      });

      await order.save();

      res
        .status(200)
        .json(
          Helpers.formatResponse(true, 'Order cancelled successfully', order),
        );
    },
  );

  /**
   * Rate order
   */
  rateOrder = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
      const { orderId } = req.params;
      const { rating, review } = req.body;

      const order = await Order.findById(orderId);
      if (!order) {
        return res
          .status(404)
          .json(Helpers.formatResponse(false, 'Order not found'));
      }

      if (order.status !== 'delivered') {
        return res
          .status(400)
          .json(
            Helpers.formatResponse(false, 'Can only rate delivered orders'),
          );
      }

      order.rating = {
        food: rating.food || rating,
        delivery: rating.delivery || rating,
        overall: rating.overall || rating,
        comment: review,
        ratedAt: new Date(),
      };

      await order.save();

      res
        .status(200)
        .json(Helpers.formatResponse(true, 'Order rated successfully', order));
    },
  );

  /**
   * Get order statistics
   */
  getOrderStats = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
      const { period = 'month' } = req.query;

      const startDate = this.getStartDate(period as string);

      const stats = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            ...(req.user.role === 'restaurant_owner' && { restaurantId: req.user._id }),
            ...(req.user.role === 'delivery' && {
              deliveryPersonId: req.user._id,
            }),
          },
        },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: '$totalAmount' },
            avgOrderValue: { $avg: '$totalAmount' },
            completedOrders: {
              $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] },
            },
            cancelledOrders: {
              $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] },
            },
          },
        },
      ]);

      res.status(200).json(
        Helpers.formatResponse(
          true,
          'Order statistics retrieved successfully',
          stats[0] || {
            totalOrders: 0,
            totalRevenue: 0,
            avgOrderValue: 0,
            completedOrders: 0,
            cancelledOrders: 0,
          },
        ),
      );
    },
  );

  /**
   * Generate unique order number
   */
  private generateOrderNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    return `ORD-${timestamp.slice(-6)}-${random}`;
  }

  /**
   * Get start date based on period
   */
  private getStartDate(period: string): Date {
    const now = new Date();
    switch (period) {
      case 'day':
        return new Date(now.setDate(now.getDate() - 1));
      case 'week':
        return new Date(now.setDate(now.getDate() - 7));
      case 'month':
        return new Date(now.setMonth(now.getMonth() - 1));
      case 'year':
        return new Date(now.setFullYear(now.getFullYear() - 1));
      default:
        return new Date(now.setMonth(now.getMonth() - 1));
    }
  }

  /**
   * Track order real-time
   */
  trackOrder = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
      const { id } = req.params;
      const order = await Order.findById(id)
        .populate('customerId', 'firstName lastName')
        .populate('restaurantId', 'name location phone')
        .populate('deliveryPersonId', 'firstName lastName phone location');

      if (!order) {
        return res
          .status(404)
          .json(Helpers.formatResponse(false, 'Order not found'));
      }

      // Check if user is authorized to track this order
      if (
        order.customerId.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin'
      ) {
        return res
          .status(403)
          .json(Helpers.formatResponse(false, 'Access denied'));
      }

      const trackingInfo = {
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        estimatedDeliveryTime: order.estimatedDeliveryTime,
        restaurant: order.restaurantId,
        deliveryPerson: order.deliveryPersonId,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      };

      res
        .status(200)
        .json(
          Helpers.formatResponse(
            true,
            'Order tracking information retrieved successfully',
            trackingInfo,
          ),
        );
    },
  );
}
