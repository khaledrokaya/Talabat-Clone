import { Customer, ICustomer } from '../../customer/schemas/customer.schema';
import { Restaurant } from '../../restaurant/schemas/restaurant.schema';
import {
  UpdateCustomerProfileDTO,
  AddToFavoritesDTO,
} from '../dto/customer.dto';
import { AppError } from '../../shared/middlewares/error.middleware';

export class CustomerService {
  /**
   * Get customer profile by ID
   */
  async getProfile(userId: string): Promise<ICustomer> {
    const customer = await Customer.findById(userId)
      .populate('favoriteRestaurants', 'restaurantDetails.name email')
      .select('-password -__v');

    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    return customer;
  }

  /**
   * Update customer profile
   */
  async updateProfile(
    userId: string,
    updateData: UpdateCustomerProfileDTO,
  ): Promise<ICustomer> {
    const customer = await Customer.findById(userId);

    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    // Update basic fields
    if (updateData.firstName) customer.firstName = updateData.firstName;
    if (updateData.lastName) customer.lastName = updateData.lastName;
    if (updateData.phone) customer.phone = updateData.phone;
    if (updateData.address) customer.address = updateData.address;
    if (updateData.deliveryPreferences) {
      customer.deliveryPreferences = updateData.deliveryPreferences;
    }

    await customer.save();
    return customer;
  }

  /**
   * Add restaurant to favorites
   */
  async addToFavorites(userId: string, data: AddToFavoritesDTO): Promise<void> {
    const customer = (await Customer.findById(userId)) as any;

    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    // Check if restaurant exists
    const restaurantExists = await Restaurant.findOne({
      _id: data.restaurantId,
      role: 'restaurant_owner',
      isActive: true,
    });

    if (!restaurantExists) {
      throw new AppError('Restaurant not found', 404);
    }

    await customer.addToFavorites(data.restaurantId);
  }

  /**
   * Remove restaurant from favorites
   */
  async removeFromFavorites(
    userId: string,
    restaurantId: string,
  ): Promise<void> {
    const customer = (await Customer.findById(userId)) as any;

    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    await customer.removeFromFavorites(restaurantId);
  }

  /**
   * Get customer's favorite restaurants
   */
  async getFavoriteRestaurants(userId: string): Promise<any[]> {
    const customer = await Customer.findById(userId).populate({
      path: 'favoriteRestaurants',
      select: 'restaurantDetails email isActive',
      match: { isActive: true },
    });

    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    return customer.favoriteRestaurants || [];
  }

  /**
   * Get order history
   */
  async getOrderHistory(userId: string, page = 1, limit = 10): Promise<any> {
    const customer = await Customer.findById(userId).populate({
      path: 'orderHistory',
      options: {
        sort: { createdAt: -1 },
        skip: (page - 1) * limit,
        limit: limit,
      },
    });

    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    const totalOrders = customer.orderHistory?.length || 0;
    const totalPages = Math.ceil(totalOrders / limit);

    return {
      orders: customer.orderHistory || [],
      pagination: {
        currentPage: page,
        totalPages,
        totalOrders,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Update delivery preferences
   */
  async updateDeliveryPreferences(
    userId: string,
    preferences: {
      preferredDeliveryTime?: string;
      specialInstructions?: string;
    },
  ): Promise<ICustomer> {
    const customer = await Customer.findById(userId);

    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    customer.deliveryPreferences = {
      ...customer.deliveryPreferences,
      ...preferences,
    };

    await customer.save();
    return customer;
  }
}
