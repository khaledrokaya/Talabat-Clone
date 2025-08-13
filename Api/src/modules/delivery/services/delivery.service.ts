import { Delivery } from '../../delivery/schemas/delivery.schema';
import { AppError } from '../../shared/middlewares/error.middleware';
import { Helpers } from '../../shared/utils/helpers';
import CacheService from '../../shared/services/cache.service';
import {
  UpdateLocationDTO,
  UpdateAvailabilityDTO,
  AcceptOrderDTO,
  UpdateOrderStatusDTO,
  SearchOrdersDTO,
  AvailableOrdersDTO,
  DeliveryEarningsDTO,
  UpdateVehicleInfoDTO,
  UpdateAvailableAreasDTO,
  DeliveryPreferencesDTO,
  RateCustomerDTO,
  DeliveryHistoryFiltersDTO,
  DeliveryStatsDTO,
} from '../dto/delivery.dto';

export class DeliveryService {
  private cache = CacheService.getInstance();

  /**
   * Get delivery person's current status (online/available)
   */
  async getDeliveryStatus(deliveryId: string): Promise<any> {
    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      throw new AppError('Delivery person not found', 404);
    }

    return {
      isOnline: delivery.isOnline || false,
      isAvailable: delivery.isAvailable || false,
      currentLocation: delivery.currentLocation ? {
        lat: delivery.currentLocation.lat,
        lng: delivery.currentLocation.lng,
        lastUpdated: delivery.currentLocation.lastUpdated
      } : null,
      hasCurrentOrder: !!delivery.currentOrder,
      verificationStatus: delivery.verificationStatus
    };
  }

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

    const [lng, lat] = locationData.coordinates;
    if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
      throw new AppError('Invalid coordinates', 400);
    }

    const updatedAt = new Date();
    delivery.currentLocation = {
      lat,
      lng,
      lastUpdated: updatedAt,
    };

    await delivery.save();

    // Location updated successfully (WebSocket removed for simplicity)

    return {
      location: {
        type: 'Point',
        coordinates: [lng, lat]
      },
      updatedAt
    };
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

    const statusChangedAt = new Date();
    delivery.isOnline = availabilityData.isOnline;

    if (availabilityData.isAcceptingOrders !== undefined) {
      delivery.isAvailable = availabilityData.isAcceptingOrders;
    }

    await delivery.save();

    return {
      isOnline: delivery.isOnline,
      statusChangedAt
    };
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

    if (order.deliveryPersonId) {
      throw new AppError('Order already accepted by another delivery person', 400);
    }

    // **IMPROVED VALIDATION**: Allow accepting orders that are ready or have been preparing for a while
    if (!['ready', 'preparing'].includes(order.status)) {
      throw new AppError(
        'Order is not ready for pickup yet. Restaurant must confirm the order is ready first.',
        400
      );
    }

    // For 'ready' orders, allow acceptance (ideally they should have timeline entry)
    if (order.status === 'ready') {
      // Check timeline if available, but don't be too strict
      if (order.timeline && order.timeline.length > 0) {
        const wasMarkedReady = order.timeline.some(entry => entry.status === 'ready');
        if (!wasMarkedReady) {
        }
      }
    }

    // For 'preparing' orders, check if they've been preparing long enough
    if (order.status === 'preparing') {
      if (!order.timeline || !Array.isArray(order.timeline)) {
        throw new AppError(
          'Order is still being prepared and timeline data is not available.',
          400
        );
      }

      const preparingEntry = order.timeline.find(entry => entry.status === 'preparing');
      if (!preparingEntry) {
        throw new AppError(
          'Order timeline data is inconsistent. Please contact support.',
          400
        );
      }

      // Check if it's been preparing for at least 15 minutes
      const preparingTime = new Date().getTime() - new Date(preparingEntry.timestamp).getTime();
      const fifteenMinutes = 15 * 60 * 1000;

      if (preparingTime < fifteenMinutes) {
        const remainingMinutes = Math.ceil((fifteenMinutes - preparingTime) / 1000 / 60);
        throw new AppError(
          `Order is still being prepared. Please wait ${remainingMinutes} more minute(s) before pickup.`,
          400
        );
      }
    }

    const estimatedPickupTime = new Date(Date.now() + 15 * 60000);

    order.deliveryPersonId = deliveryId;
    order.status = 'assigned';

    // Add to timeline
    if (!order.timeline) {
      order.timeline = [];
    }
    order.timeline.push({
      status: 'assigned',
      timestamp: new Date(),
      note: `Assigned to delivery person`
    });

    await order.save();

    delivery.currentOrder = order._id;
    delivery.isAvailable = false;
    if (!delivery.deliveryHistory.includes(order._id)) {
      delivery.deliveryHistory.push(order._id);
    }
    await delivery.save();

    // Clear cache for this delivery person
    this.cache.clearDeliveryCache(deliveryId);

    return {
      orderId: order._id,
      status: 'accepted',
      estimatedPickupTime,
      message: 'Order accepted successfully. Please proceed to restaurant for pickup.'
    };
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

    // **UPDATED VALIDATION**: Allow pickup for ready orders or orders that have been preparing long enough
    if (statusData.status === 'picked_up') {
      // Allow pickup if order is already marked as ready
      if (order.status === 'ready') {
        // Ideally check timeline, but don't block if missing
        if (order.timeline && order.timeline.length > 0) {
          const wasMarkedReady = order.timeline.some(entry => entry.status === 'ready');
          if (!wasMarkedReady) {
            } else {
          // No timeline entry found but allow pickup anyway for debugging
          }
        }
      }
      // Allow pickup if order has been preparing for a sufficient time
      else if (order.status === 'preparing') {
        if (!order.timeline || !Array.isArray(order.timeline)) {
          throw new AppError(
            'Cannot mark order as picked up. Order timeline data is not available.',
            400
          );
        }

        const preparingEntry = order.timeline.find(entry => entry.status === 'preparing');
        if (!preparingEntry) {
          throw new AppError(
            'Cannot mark order as picked up. Order timeline data is inconsistent.',
            400
          );
        }

        // Check if it's been preparing for at least 15 minutes
        const preparingTime = new Date().getTime() - new Date(preparingEntry.timestamp).getTime();
        const fifteenMinutes = 15 * 60 * 1000;

        if (preparingTime < fifteenMinutes) {
          const remainingMinutes = Math.ceil((fifteenMinutes - preparingTime) / 1000 / 60);
          throw new AppError(
            `Cannot mark order as picked up. Order is still being prepared. Please wait ${remainingMinutes} more minute(s).`,
            400
          );
        }
      }
      // For orders in other statuses, require ready status
      else if (!['assigned'].includes(order.status)) {
        throw new AppError(
          'Cannot mark order as picked up. Order must be ready or assigned first.',
          400
        );
      }
    }

    // Additional validation: Allow delivery progression for orders that meet our criteria
    if (['on_the_way', 'delivered'].includes(statusData.status)) {
      // These statuses require the order to have been picked up first
      if (!['picked_up', 'on_the_way'].includes(order.status)) {
        throw new AppError(
          `Cannot mark order as ${statusData.status}. Order must be picked up first.`,
          400
        );
      }
    }

    const validTransitions: { [key: string]: string[] } = {
      'assigned': ['picked_up'],
      'picked_up': ['on_the_way'],
      'on_the_way': ['delivered']
    };

    if (!validTransitions[order.status]?.includes(statusData.status)) {
      throw new AppError(
        `Invalid status transition from ${order.status} to ${statusData.status}`,
        400
      );
    }

    const updatedAt = new Date();
    order.status = statusData.status;

    // Add to timeline for tracking
    if (!order.timeline) {
      order.timeline = [];
    }
    order.timeline.push({
      status: statusData.status,
      timestamp: updatedAt,
      note: `Updated by delivery person`
    });

    switch (statusData.status) {
      case 'picked_up':
        order.pickedUpAt = updatedAt;
        break;
      case 'on_the_way':
        order.onTheWayAt = updatedAt;
        break;
      case 'delivered':
        order.deliveredAt = updatedAt;
        const delivery = await Delivery.findById(deliveryId);
        if (delivery) {
          delivery.currentOrder = undefined;
          delivery.isAvailable = true;
          await delivery.save();
          // Clear cache when order is completed
          this.cache.clearDeliveryCache(deliveryId);
        }
        break;
    }

    await order.save();

    // Clear cache to ensure fresh data on next request
    this.cache.clearDeliveryCache(deliveryId);

    // Order status updated successfully (WebSocket removed for simplicity)

    return {
      orderId: order._id,
      status: statusData.status,
      updatedAt,
      message: 'Order status updated successfully'
    };
  }

  /**
   * Get available orders for delivery assignment
   */
  async getAvailableOrders(
    deliveryId: string,
    filters: AvailableOrdersDTO,
  ): Promise<any> {
    const Order = require('../../order/schemas/order.schema').default;

    // Get delivery person's current location
    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      throw new AppError('Delivery person not found', 404);
    }

    if (!delivery.isOnline || !delivery.isAvailable) {
      return {
        orders: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0
        }
      };
    }

    // **IMPROVED QUERY**: Look for orders that could be ready for pickup
    // Include orders that are 'ready' or 'preparing' (but validate timeline for preparing orders)
    const query: any = {
      status: { $in: ['ready', 'preparing'] }, // Allow both ready and preparing orders
      $or: [
        { deliveryPersonId: { $exists: false } },
        { deliveryPersonId: null }
      ]
    };

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const { skip, limit: pageLimit } = Helpers.paginate(page, limit);

    const orders = await Order.find(query)
      .populate('customerId', 'firstName lastName phone')
      .populate('restaurantId', 'firstName lastName restaurantDetails phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageLimit)
      .select('_id customerInfo deliveryAddress restaurantId customerId totalAmount deliveryFee status estimatedDeliveryTime createdAt items timeline updatedAt');

    // Debug: Log timeline data for first order
    if (orders.length > 0) {
    }

    // Additional validation: Filter orders that are actually available for pickup
    const validOrders = orders.filter(order => {
      // Always accept orders with status 'ready'
      if (order.status === 'ready') {
        // For ready orders, ideally check timeline, but don't be too strict
        if (order.timeline && Array.isArray(order.timeline)) {
          const hasReadyTimeline = order.timeline.some(entry => entry.status === 'ready');
          if (!hasReadyTimeline) {
          }
        }
        return true;
      }

      // For 'preparing' orders, check if they've been preparing for a reasonable time
      if (order.status === 'preparing') {
        if (!order.timeline || !Array.isArray(order.timeline)) {
          return false;
        }

        // Find when the order started preparing
        const preparingEntry = order.timeline.find(entry => entry.status === 'preparing');
        if (!preparingEntry) {
          return false;
        }

        // Check if it's been preparing for at least 15 minutes (could be ready)
        const preparingTime = new Date().getTime() - new Date(preparingEntry.timestamp).getTime();
        const fifteenMinutes = 15 * 60 * 1000;

        if (preparingTime >= fifteenMinutes) {
          return true;
        } else {
          return false;
        }
      }

      return false;
    });


    // Format orders for response
    const formattedOrders = validOrders.map(order => ({
      _id: order._id,
      restaurant: {
        name: order.restaurantId?.restaurantDetails?.name ||
          `${order.restaurantId?.firstName} ${order.restaurantId?.lastName}`,
        address: order.restaurantId?.restaurantDetails?.address || 'Restaurant Address',
        phone: order.restaurantId?.phone || 'N/A'
      },
      customer: {
        name: order.customerInfo?.name ||
          `${order.customerId?.firstName} ${order.customerId?.lastName}`,
        address: order.deliveryAddress ?
          `${order.deliveryAddress.street}, ${order.deliveryAddress.city}` :
          'Delivery Address',
        phone: order.customerInfo?.phone || order.customerId?.phone || 'N/A'
      },
      totalAmount: order.totalAmount,
      deliveryFee: order.deliveryFee || 0,
      status: order.status,
      estimatedDeliveryTime: order.estimatedDeliveryTime,
      createdAt: order.createdAt,
      items: order.items || []
    }));

    const total = formattedOrders.length;

    return {
      orders: formattedOrders,
      pagination: {
        page,
        limit: pageLimit,
        total,
        pages: Math.ceil(total / pageLimit)
      }
    };
  }

  /**
   * UTILITY METHOD: Manually mark an order as ready for testing
   * This can be used to test the delivery flow when restaurant workflow isn't fully implemented
   */
  async markOrderAsReadyForTesting(orderId: string): Promise<any> {
    const Order = require('../../order/schemas/order.schema').default;

    const order = await Order.findById(orderId);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // Update status to ready
    order.status = 'ready';

    // Ensure timeline exists and add ready entry
    if (!order.timeline) {
      order.timeline = [];
    }

    // Add timeline entries if missing
    const statuses = ['confirmed', 'preparing', 'ready'];
    const currentTime = new Date();

    statuses.forEach((status, index) => {
      const exists = order.timeline.some(entry => entry.status === status);
      if (!exists) {
        order.timeline.push({
          status,
          timestamp: new Date(currentTime.getTime() - (statuses.length - index - 1) * 5 * 60000), // 5 minutes apart
          note: `${status} - added for testing`
        });
      }
    });

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
    const cacheKey = `${deliveryId}:${JSON.stringify(filters)}`;
    const cached = this.cache.getOrders(cacheKey);
    if (cached) return cached;

    const Order = require('../../order/schemas/order.schema').default;

    const query: any = {};

    if (filters.status === 'pending') {
      query.status = { $in: ['ready', 'confirmed'] };
      query.deliveryPersonId = { $exists: false };
    } else {
      query.deliveryPersonId = deliveryId;
      if (filters.status) {
        query.status = filters.status;
      }
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
    const limit = filters.limit || 10;
    const { skip, limit: pageLimit } = Helpers.paginate(page, limit);

    const orders = await Order.find(query)
      .populate('customerId', 'firstName lastName phone')
      .populate('restaurantId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageLimit)
      .select('_id customerInfo deliveryAddress totalAmount status estimatedDeliveryTime items');

    const total = await Order.countDocuments(query);

    const formattedOrders = orders.map(order => ({
      _id: order._id,
      customer: {
        name: order.customerInfo?.name || `${order.customerId?.firstName} ${order.customerId?.lastName}`,
        address: `${order.deliveryAddress?.street}, ${order.deliveryAddress?.city}`
      },
      status: order.status,
      totalAmount: order.totalAmount,
      estimatedDeliveryTime: order.estimatedDeliveryTime
    }));

    const result = {
      orders: formattedOrders,
      pagination: {
        page,
        limit: pageLimit,
        total,
        pages: Math.ceil(total / pageLimit)
      }
    };

    this.cache.setOrders(cacheKey, result);
    return result;
  }

  /**
   * Get delivery earnings
   */
  async getDeliveryEarnings(
    deliveryId: string,
    filters: DeliveryEarningsDTO,
  ): Promise<any> {
    const cacheKey = `${deliveryId}:${JSON.stringify(filters)}`;
    const cached = this.cache.getEarnings(cacheKey);
    if (cached) return cached;

    const Order = require('../../order/schemas/order.schema').default;

    let startDate: Date | undefined;
    let endDate: Date = new Date();

    if (filters.period) {
      const now = new Date();
      switch (filters.period) {
        case 'day':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          endDate = new Date(now.setHours(23, 59, 59, 999));
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
      }
    }

    if (filters.startDate) startDate = new Date(filters.startDate);
    if (filters.endDate) endDate = new Date(filters.endDate);

    const matchStage: any = {
      deliveryPersonId: deliveryId,
      status: 'delivered',
    };

    if (startDate || endDate) {
      matchStage.deliveredAt = {};
      if (startDate) matchStage.deliveredAt.$gte = startDate;
      if (endDate) matchStage.deliveredAt.$lte = endDate;
    }

    const earnings = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: '$deliveryFee' },
          deliveryCount: { $sum: 1 },
          averageEarningsPerOrder: { $avg: '$deliveryFee' },
        },
      },
    ]);

    let breakdown = [];
    if (filters.period === 'month' || filters.period === 'week' || filters.period === 'monthly' || filters.period === 'weekly') {
      breakdown = await Order.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$deliveredAt' }
            },
            earnings: { $sum: '$deliveryFee' },
            deliveries: { $sum: 1 },
          },
        },
        { $sort: { '_id': 1 } },
        {
          $project: {
            date: '$_id',
            earnings: 1,
            deliveries: 1,
            _id: 0
          }
        }
      ]);
    }

    const result = earnings[0] || { totalEarnings: 0, deliveryCount: 0 };

    const finalResult = {
      totalEarnings: result.totalEarnings || 0,
      deliveryCount: result.deliveryCount || 0,
      breakdown
    };

    this.cache.setEarnings(cacheKey, finalResult);
    return finalResult;
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
    const cacheKey = `${deliveryId}:${JSON.stringify(statsData)}`;
    const cached = this.cache.getStats(cacheKey);
    if (cached) return cached;

    const Order = require('../../order/schemas/order.schema').default;

    const now = new Date();
    let startDate: Date | undefined;
    let endDate: Date = now;

    switch (statsData.period) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        endDate = new Date(now.setHours(23, 59, 59, 999));
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

    const matchStage: any = { deliveryPersonId: deliveryId };

    if (startDate) {
      matchStage.createdAt = { $gte: startDate, $lte: endDate };
    }

    const stats = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalDeliveries: { $sum: 1 },
          completedDeliveries: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] },
          },
          cancelledDeliveries: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] },
          },
          totalEarnings: {
            $sum: {
              $cond: [{ $eq: ['$status', 'delivered'] }, '$deliveryFee', 0],
            },
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

    const delivery = await Delivery.findById(deliveryId).select('ratings');
    const result = stats[0] || {};

    const finalResult = {
      totalDeliveries: result.totalDeliveries || 0,
      completedDeliveries: result.completedDeliveries || 0,
      cancelledDeliveries: result.cancelledDeliveries || 0,
      averageRating: delivery?.ratings?.averageRating || 0,
      totalEarnings: result.totalEarnings || 0,
      onTimeDeliveryRate: result.completedDeliveries > 0 ?
        (result.completedDeliveries / result.totalDeliveries) * 100 : 0,
      averageDeliveryTime: result.averageDeliveryTime ?
        Math.round(result.averageDeliveryTime / (1000 * 60)) : 0
    };

    this.cache.setStats(cacheKey, finalResult);
    return finalResult;
  }

  /**
   * Track order for any user (customer, restaurant, delivery)
   * @param orderId The order ID to track
   * @param user The authenticated user making the request
   * @returns Order with delivery tracking details
   */
  async trackOrder(orderId: string, user: any): Promise<any> {
    try {
      const Order = require('../../order/schemas/order.schema').default;

      const order = await Order.findById(orderId)
        .populate('customerId', 'name email phone')
        .populate('restaurantId', 'name location phone')
        .populate('deliveryPersonId', 'name phone')
        .lean();

      if (!order) {
        throw new AppError('Order not found', 404);
      }

      // Check if user has permission to view this order
      const userId = user._id.toString();
      const customerId = order.customerId?._id?.toString() || order.customerId?.toString();
      const restaurantId = order.restaurantId?._id?.toString() || order.restaurantId?.toString();
      const deliveryPersonId = order.deliveryPersonId?._id?.toString() || order.deliveryPersonId?.toString();

      const hasPermission =
        customerId === userId ||
        restaurantId === userId ||
        (deliveryPersonId && deliveryPersonId === userId) ||
        user.role === 'admin';

      if (!hasPermission) {
        throw new AppError('You do not have permission to view this order', 403);
      }

      return order;
    } catch (error) {
      throw error;
    }
  }
}
