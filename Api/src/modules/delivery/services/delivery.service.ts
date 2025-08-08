import { Delivery } from '../../delivery/schemas/delivery.schema';
import { AppError } from '../../shared/middlewares/error.middleware';
import { Helpers } from '../../shared/utils/helpers';
import {
  UpdateLocationDTO,
  UpdateAvailabilityDTO,
  AcceptOrderDTO,
  UpdateOrderStatusDTO,
  SearchOrdersDTO,
  DeliveryEarningsDTO,
  UpdateVehicleInfoDTO,
  UpdateAvailableAreasDTO,
  DeliveryPreferencesDTO,
  RateCustomerDTO,
  DeliveryHistoryFiltersDTO,
  DeliveryStatsDTO,
} from '../dto/delivery.dto';

export class DeliveryService {
  /**
   * Update delivery person's location
   */
  async updateLocation(
    deliveryId: string,
    locationData: UpdateLocationDTO,
  ): Promise<any> {
    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      throw new AppError('Delivery person not found', 404);
    }

    delivery.currentLocation = {
      lat: locationData.coordinates[1], // latitude
      lng: locationData.coordinates[0], // longitude
      lastUpdated: new Date(),
    };

    await delivery.save();

    return delivery;
  }

  /**
   * Update availability status
   */
  async updateAvailability(
    deliveryId: string,
    availabilityData: UpdateAvailabilityDTO,
  ): Promise<any> {
    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      throw new AppError('Delivery person not found', 404);
    }

    delivery.isOnline = availabilityData.isOnline;

    if (availabilityData.isAcceptingOrders !== undefined) {
      delivery.isAvailable = availabilityData.isAcceptingOrders;
    }

    await delivery.save();

    return delivery;
  }

  /**
   * Get nearby available delivery persons
   */
  async getNearbyDeliveryPersons(
    coordinates: [number, number],
    maxDistance: number = 5,
  ): Promise<any[]> {
    // For MongoDB geospatial queries, we need to create a proper query
    // Since our schema uses lat/lng format, we'll need to do distance calculation differently
    const deliveryPersons = await Delivery.find({
      isOnline: true,
      isAvailable: true,
      verificationStatus: 'verified',
      currentLocation: { $exists: true },
    })
      .select('firstName lastName currentLocation ratings')
      .limit(10);

    // Filter by distance manually since we're using lat/lng format
    const nearbyPersons = deliveryPersons.filter((person) => {
      if (!person.currentLocation) return false;

      const distance = Helpers.calculateDistance(
        person.currentLocation.lat,
        person.currentLocation.lng,
        coordinates[1], // latitude
        coordinates[0], // longitude
      );

      return distance <= maxDistance;
    });

    return nearbyPersons;
  }

  /**
   * Accept an order
   */
  async acceptOrder(
    deliveryId: string,
    orderData: AcceptOrderDTO,
  ): Promise<any> {
    const Order = require('../../order/schemas/order.schema').default;

    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      throw new AppError('Delivery person not found', 404);
    }

    if (!delivery.isOnline || !delivery.isAvailable) {
      throw new AppError('Delivery person is not available', 400);
    }

    const order = await Order.findById(orderData.orderId);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (order.status !== 'confirmed') {
      throw new AppError('Order is not available for pickup', 400);
    }

    // Update order
    order.deliveryPersonId = deliveryId;
    order.status = 'assigned';
    order.estimatedDeliveryTime = new Date(
      Date.now() + orderData.estimatedDeliveryTime * 60000,
    );
    await order.save();

    // Update delivery person
    delivery.currentOrder = order._id;
    delivery.deliveryHistory.push(order._id);
    await delivery.save();

    return order;
  }

  /**
   * Update order status
   */
  async updateOrderStatus(
    deliveryId: string,
    orderId: string,
    statusData: UpdateOrderStatusDTO,
  ): Promise<any> {
    const Order = require('../../order/schemas/order.schema').default;

    const order = await Order.findOne({
      _id: orderId,
      deliveryPersonId: deliveryId,
    });
    if (!order) {
      throw new AppError(
        'Order not found or not assigned to this delivery person',
        404,
      );
    }

    order.status = statusData.status;

    if (statusData.notes) {
      if (!order.deliveryNotes) {
        order.deliveryNotes = [];
      }
      order.deliveryNotes.push({
        note: statusData.notes,
        timestamp: new Date(),
      });
    }

    if (statusData.deliveryProof) {
      order.deliveryProof = statusData.deliveryProof;
    }

    // Update timestamps
    switch (statusData.status) {
      case 'picked_up':
        order.pickedUpAt = new Date();
        break;
      case 'on_the_way':
        order.onTheWayAt = new Date();
        break;
      case 'delivered': {
        order.deliveredAt = new Date();
        // Remove from delivery person's current order and add to history
        const delivery = await Delivery.findById(deliveryId);
        if (delivery) {
          delivery.currentOrder = undefined;
          if (!delivery.deliveryHistory.includes(orderId as any)) {
            delivery.deliveryHistory.push(orderId as any);
          }
          await delivery.save();
        }
        break;
      }
    }

    await order.save();

    return order;
  }

  /**
   * Get delivery person's orders
   */
  async getDeliveryOrders(
    deliveryId: string,
    filters: SearchOrdersDTO,
  ): Promise<any> {
    const Order = require('../../order/schemas/order.schema').default;

    const query: any = { deliveryPersonId: deliveryId };

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.dateFrom || filters.dateTo) {
      query.createdAt = {};
      if (filters.dateFrom) {
        query.createdAt.$gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        query.createdAt.$lte = new Date(filters.dateTo);
      }
    }

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const { skip, limit: pageLimit } = Helpers.paginate(page, limit);

    const orders = await Order.find(query)
      .populate('customerId', 'firstName lastName')
      .populate('restaurantId', 'firstName lastName restaurantDetails.name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageLimit);

    const totalOrders = await Order.countDocuments(query);
    const totalPages = Math.ceil(totalOrders / pageLimit);

    return {
      orders,
      totalOrders,
      totalPages,
      currentPage: page,
    };
  }

  /**
   * Get delivery earnings
   */
  async getDeliveryEarnings(
    deliveryId: string,
    filters: DeliveryEarningsDTO,
  ): Promise<any> {
    const Order = require('../../order/schemas/order.schema').default;

    const matchStage: any = {
      deliveryPersonId: deliveryId,
      status: 'delivered',
    };

    if (filters.dateFrom || filters.dateTo) {
      matchStage.deliveredAt = {};
      if (filters.dateFrom) {
        matchStage.deliveredAt.$gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        matchStage.deliveredAt.$lte = new Date(filters.dateTo);
      }
    }

    const earnings = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: '$deliveryFee' },
          totalOrders: { $sum: 1 },
          averageEarningsPerOrder: { $avg: '$deliveryFee' },
          totalTips: { $sum: '$tip' },
        },
      },
    ]);

    // Group by period if specified
    let periodBreakdown = [];
    if (filters.period) {
      let groupBy: any = {};

      switch (filters.period) {
        case 'daily':
          groupBy = {
            year: { $year: '$deliveredAt' },
            month: { $month: '$deliveredAt' },
            day: { $dayOfMonth: '$deliveredAt' },
          };
          break;
        case 'weekly':
          groupBy = {
            year: { $year: '$deliveredAt' },
            week: { $week: '$deliveredAt' },
          };
          break;
        case 'monthly':
          groupBy = {
            year: { $year: '$deliveredAt' },
            month: { $month: '$deliveredAt' },
          };
          break;
      }

      periodBreakdown = await Order.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: groupBy,
            earnings: { $sum: '$deliveryFee' },
            orders: { $sum: 1 },
            tips: { $sum: '$tip' },
          },
        },
        { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 } },
      ]);
    }

    return {
      ...(earnings[0] || {}),
      periodBreakdown,
      dateRange: {
        from: filters.dateFrom,
        to: filters.dateTo,
      },
    };
  }

  /**
   * Update vehicle information
   */
  async updateVehicleInfo(
    deliveryId: string,
    vehicleData: UpdateVehicleInfoDTO,
  ): Promise<any> {
    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      throw new AppError('Delivery person not found', 404);
    }

    delivery.vehicleInfo = {
      ...delivery.vehicleInfo,
      type: vehicleData.vehicleType as any,
      licensePlate: vehicleData.licensePlate,
      model: vehicleData.vehicleModel,
      color: vehicleData.vehicleColor,
    };

    await delivery.save();

    return delivery;
  }

  /**
   * Update available areas
   */
  async updateAvailableAreas(
    deliveryId: string,
    areasData: UpdateAvailableAreasDTO,
  ): Promise<any> {
    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      throw new AppError('Delivery person not found', 404);
    }

    delivery.deliveryZones = areasData.areas;

    await delivery.save();

    return delivery;
  }

  /**
   * Update delivery preferences (working hours)
   */
  async updatePreferences(
    deliveryId: string,
    preferencesData: DeliveryPreferencesDTO,
  ): Promise<any> {
    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      throw new AppError('Delivery person not found', 404);
    }

    // Update working hours if provided
    if (preferencesData.workingDays && preferencesData.preferredDeliveryTime) {
      preferencesData.workingDays.forEach((day) => {
        if (delivery.workingHours[day]) {
          delivery.workingHours[day].start =
            preferencesData.preferredDeliveryTime!.start;
          delivery.workingHours[day].end =
            preferencesData.preferredDeliveryTime!.end;
          delivery.workingHours[day].isWorking = true;
        }
      });
    }

    await delivery.save();

    return delivery;
  }

  /**
   * Rate a customer
   */
  async rateCustomer(
    deliveryId: string,
    ratingData: RateCustomerDTO,
  ): Promise<any> {
    const Order = require('../../order/schemas/order.schema').default;
    const Customer = require('../../user/schemas').Customer;

    // Verify the delivery person completed this order
    const order = await Order.findOne({
      _id: ratingData.orderId,
      deliveryPersonId: deliveryId,
      customerId: ratingData.customerId,
      status: 'delivered',
    });

    if (!order) {
      throw new AppError('Order not found or not delivered by you', 404);
    }

    // Check if already rated
    if (order.customerRating) {
      throw new AppError('Customer already rated for this order', 400);
    }

    // Add rating to order
    order.customerRating = {
      rating: ratingData.rating,
      comment: ratingData.comment,
      ratedAt: new Date(),
    };
    await order.save();

    // Update customer's overall rating
    const customer = await Customer.findById(ratingData.customerId);
    if (customer) {
      const totalRatings = (customer.ratings?.count || 0) + 1;
      const currentAverage = customer.ratings?.average || 0;
      const newAverage =
        (currentAverage * (totalRatings - 1) + ratingData.rating) /
        totalRatings;

      customer.ratings = {
        average: newAverage,
        count: totalRatings,
      };
      await customer.save();
    }

    return order;
  }

  /**
   * Get delivery history with filters
   */
  async getDeliveryHistory(
    deliveryId: string,
    filters: DeliveryHistoryFiltersDTO,
  ): Promise<any> {
    const Order = require('../../order/schemas/order.schema').default;

    const query: any = {
      deliveryPersonId: deliveryId,
      status: 'delivered',
    };

    if (filters.startDate || filters.endDate) {
      query.deliveredAt = {};
      if (filters.startDate) {
        query.deliveredAt.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.deliveredAt.$lte = new Date(filters.endDate);
      }
    }

    if (filters.minRating || filters.maxRating) {
      query['customerRating.rating'] = {};
      if (filters.minRating) {
        query['customerRating.rating'].$gte = filters.minRating;
      }
      if (filters.maxRating) {
        query['customerRating.rating'].$lte = filters.maxRating;
      }
    }

    if (filters.minEarnings || filters.maxEarnings) {
      query.deliveryFee = {};
      if (filters.minEarnings) {
        query.deliveryFee.$gte = filters.minEarnings;
      }
      if (filters.maxEarnings) {
        query.deliveryFee.$lte = filters.maxEarnings;
      }
    }

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const { skip, limit: pageLimit } = Helpers.paginate(page, limit);

    const orders = await Order.find(query)
      .populate('customerId', 'firstName lastName')
      .populate('restaurantId', 'firstName lastName restaurantDetails.name')
      .sort({ deliveredAt: -1 })
      .skip(skip)
      .limit(pageLimit);

    const totalOrders = await Order.countDocuments(query);
    const totalPages = Math.ceil(totalOrders / pageLimit);

    return {
      orders,
      totalOrders,
      totalPages,
      currentPage: page,
    };
  }

  /**
   * Get delivery statistics
   */
  async getDeliveryStats(
    deliveryId: string,
    statsData: DeliveryStatsDTO,
  ): Promise<any> {
    const Order = require('../../order/schemas/order.schema').default;

    const matchStage: any = {
      deliveryPersonId: deliveryId,
    };

    // Set date range based on period
    const now = new Date();
    let startDate: Date | undefined;
    let endDate: Date = now;

    switch (statsData.period) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'custom':
        if (statsData.startDate) startDate = new Date(statsData.startDate);
        if (statsData.endDate) endDate = new Date(statsData.endDate);
        break;
    }

    if (startDate) {
      matchStage.createdAt = { $gte: startDate, $lte: endDate };
    }

    const stats = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          deliveredOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] },
          },
          totalEarnings: {
            $sum: {
              $cond: [{ $eq: ['$status', 'delivered'] }, '$deliveryFee', 0],
            },
          },
          totalTips: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, '$tip', 0] },
          },
          averageDeliveryTime: {
            $avg: {
              $cond: [
                {
                  $and: [
                    { $ne: ['$pickedUpAt', null] },
                    { $ne: ['$deliveredAt', null] },
                  ],
                },
                { $subtract: ['$deliveredAt', '$pickedUpAt'] },
                null,
              ],
            },
          },
        },
      },
    ]);

    return {
      ...(stats[0] || {}),
      period: statsData.period,
      dateRange: { startDate, endDate },
    };
  }
}
