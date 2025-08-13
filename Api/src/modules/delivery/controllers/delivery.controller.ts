import { Response, NextFunction } from 'express';
import { DeliveryService } from '../services/delivery.service';
import { asyncHandler } from '../../shared/middlewares/error.middleware';
import { Helpers } from '../../shared/utils/helpers';
import { AuthenticatedRequest } from '../../shared/middlewares/auth.middleware';

export class DeliveryController {
  private deliveryService: DeliveryService;

  constructor() {
    this.deliveryService = new DeliveryService();
  }

  /**
   * Update delivery person's location
   */
  updateLocation = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
      const result = await this.deliveryService.updateLocation(
        req.user._id,
        req.body,
      );

      res
        .status(200)
        .json(
          Helpers.formatResponse(true, 'Location updated successfully', result),
        );
    },
  );

  /**
   * Get delivery person's current status
   */
  getDeliveryStatus = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
      const result = await this.deliveryService.getDeliveryStatus(req.user._id);

      res
        .status(200)
        .json(
          Helpers.formatResponse(
            true,
            'Delivery status retrieved successfully',
            result,
          ),
        );
    },
  );

  /**
   * Update availability status
   */
  updateAvailability = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
      const result = await this.deliveryService.updateAvailability(
        req.user._id,
        req.body,
      );

      res
        .status(200)
        .json(
          Helpers.formatResponse(
            true,
            'Availability updated successfully',
            result,
          ),
        );
    },
  );

  /**
   * Accept an order for delivery
   */
  acceptOrder = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
      const { orderId } = req.params;
      const result = await this.deliveryService.acceptOrder(req.user._id, {
        orderId,
        ...req.body,
      });

      res
        .status(200)
        .json(
          Helpers.formatResponse(true, 'Order accepted successfully', result),
        );
    },
  );

  /**
   * Update order delivery status
   */
  updateOrderStatus = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
      const { orderId } = req.params;
      const result = await this.deliveryService.updateOrderStatus(
        req.user._id,
        orderId,
        req.body,
      );

      res
        .status(200)
        .json(
          Helpers.formatResponse(
            true,
            'Order status updated successfully',
            result,
          ),
        );
    },
  );

  /**
   * Get available orders for delivery
   */
  getAvailableOrders = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
      const result = await this.deliveryService.getAvailableOrders(
        req.user._id,
        req.query as any,
      );

      res
        .status(200)
        .json(
          Helpers.formatResponse(
            true,
            'Available orders retrieved successfully',
            result,
          ),
        );
    },
  );

  /**
   * Get delivery orders
   */
  getDeliveryOrders = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
      const result = await this.deliveryService.getDeliveryOrders(
        req.user._id,
        req.query as any,
      );

      res
        .status(200)
        .json(
          Helpers.formatResponse(true, 'Orders retrieved successfully', result),
        );
    },
  );

  /**
   * Track order details
   */
  trackOrder = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
      const { orderId } = req.params;
      const result = await this.deliveryService.trackOrder(orderId, req.user);

      res
        .status(200)
        .json(
          Helpers.formatResponse(
            true,
            'Order tracking details retrieved successfully',
            result,
          ),
        );
    },
  );

  /**
   * Get delivery earnings
   */
  getDeliveryEarnings = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
      const result = await this.deliveryService.getDeliveryEarnings(
        req.user._id,
        req.query as any,
      );

      res
        .status(200)
        .json(
          Helpers.formatResponse(
            true,
            'Earnings retrieved successfully',
            result,
          ),
        );
    },
  );

  /**
   * Update vehicle information
   */
  updateVehicleInfo = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
      const result = await this.deliveryService.updateVehicleInfo(
        req.user._id,
        req.body,
      );

      res
        .status(200)
        .json(
          Helpers.formatResponse(
            true,
            'Vehicle information updated successfully',
            result,
          ),
        );
    },
  );

  /**
   * Update available delivery areas
   */
  updateAvailableAreas = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
      const result = await this.deliveryService.updateAvailableAreas(
        req.user._id,
        req.body,
      );

      res
        .status(200)
        .json(
          Helpers.formatResponse(
            true,
            'Available areas updated successfully',
            result,
          ),
        );
    },
  );

  /**
   * Update delivery preferences
   */
  updatePreferences = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
      const result = await this.deliveryService.updatePreferences(
        req.user._id,
        req.body,
      );

      res
        .status(200)
        .json(
          Helpers.formatResponse(
            true,
            'Preferences updated successfully',
            result,
          ),
        );
    },
  );

  /**
   * Rate a customer
   */
  rateCustomer = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
      const { customerId } = req.params;
      const result = await this.deliveryService.rateCustomer(req.user._id, {
        customerId,
        ...req.body,
      });

      res
        .status(200)
        .json(
          Helpers.formatResponse(true, 'Customer rated successfully', result),
        );
    },
  );

  /**
   * Get delivery history
   */
  getDeliveryHistory = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
      const result = await this.deliveryService.getDeliveryHistory(
        req.user._id,
        req.query as any,
      );

      res
        .status(200)
        .json(
          Helpers.formatResponse(
            true,
            'Delivery history retrieved successfully',
            result,
          ),
        );
    },
  );

  /**
   * Get delivery statistics
   */
  getDeliveryStats = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
      const result = await this.deliveryService.getDeliveryStats(
        req.user._id,
        req.query as any,
      );

      res
        .status(200)
        .json(
          Helpers.formatResponse(
            true,
            'Delivery statistics retrieved successfully',
            result,
          ),
        );
    },
  );

  /**
   * Get nearby delivery persons
   */
  getNearbyDeliveryPersons = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
      const result = await this.deliveryService.getNearbyDeliveryPersons(
        req.body,
      );

      res
        .status(200)
        .json(
          Helpers.formatResponse(
            true,
            'Nearby delivery persons retrieved successfully',
            result,
          ),
        );
    },
  );
}
