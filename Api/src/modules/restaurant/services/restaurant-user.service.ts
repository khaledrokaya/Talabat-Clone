import { Restaurant } from '../schemas/restaurant.schema';
import Meal from '../../meal/schemas/meal.schema';
import { AppError } from '../../shared/middlewares/error.middleware';
import { CreateMealDTO, UpdateMealDTO } from '../dto/restaurant.dto';
import mongoose from 'mongoose';

export class RestaurantUserService {
  /**
   * Create a new meal
   */
  async createMeal(
    restaurantId: string,
    mealData: CreateMealDTO,
  ): Promise<any> {
    // Verify restaurant exists and is operational
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      throw new AppError('Restaurant not found', 404);
    }

    if (restaurant.verificationStatus !== 'verified') {
      throw new AppError('Restaurant must be verified to add meals', 403);
    }

    // Map imageUrl to image field if provided
    const processedMealData = { ...mealData };
    if ((mealData as any).imageUrl) {
      processedMealData.image = (mealData as any).imageUrl;
      delete (processedMealData as any).imageUrl;
    }

    const meal = new Meal({
      ...processedMealData,
      restaurantId,
    });

    await meal.save();

    // Add meal to restaurant's menu
    if (!restaurant.menu) {
      restaurant.menu = [];
    }
    restaurant.menu.push(meal._id);
    await restaurant.save();

    return meal;
  }

  /**
   * Update meal
   */
  async updateMeal(
    restaurantId: string,
    mealId: string,
    updateData: UpdateMealDTO,
  ): Promise<any> {
    const meal = await Meal.findOne({ _id: mealId, restaurantId });
    if (!meal) {
      throw new AppError('Meal not found', 404);
    }

    // Map imageUrl to image field if provided
    const processedUpdateData = { ...updateData };
    if ((updateData as any).imageUrl) {
      processedUpdateData.image = (updateData as any).imageUrl;
      delete (processedUpdateData as any).imageUrl;
    }

    Object.assign(meal, processedUpdateData);
    await meal.save();

    return meal;
  }

  /**
   * Delete meal
   */
  async deleteMeal(restaurantId: string, mealId: string): Promise<void> {
    const meal = await Meal.findOneAndDelete({ _id: mealId, restaurantId });
    if (!meal) {
      throw new AppError('Meal not found', 404);
    }

    // Remove from restaurant's menu
    const restaurant = await Restaurant.findById(restaurantId);
    if (restaurant && restaurant.menu) {
      restaurant.menu = restaurant.menu.filter(
        (id) => id.toString() !== mealId,
      );
      await restaurant.save();
    }
  }

  /**
   * Get restaurant's meals
   */
  async getRestaurantMeals(
    restaurantId: string,
    filters: any = {},
  ): Promise<any[]> {
    return await (Meal as any).findByRestaurant(restaurantId, filters);
  }

  /**
   * Toggle meal availability
   */
  async toggleMealAvailability(
    restaurantId: string,
    mealId: string,
  ): Promise<any> {
    const meal = await Meal.findOne({ _id: mealId, restaurantId });
    if (!meal) {
      throw new AppError('Meal not found', 404);
    }

    meal.isAvailable = !meal.isAvailable;
    await meal.save();

    return meal;
  }

  /**
   * Set meal discount
   */
  async setMealDiscount(
    restaurantId: string,
    mealId: string,
    discountData: { percentage: number; validUntil: string; isActive?: boolean },
  ): Promise<any> {
    const meal = await Meal.findOne({ _id: mealId, restaurantId });
    if (!meal) {
      throw new AppError('Meal not found', 404);
    }

    meal.discount = {
      percentage: discountData.percentage,
      validUntil: new Date(discountData.validUntil),
      isActive: discountData.isActive !== false,
    };

    await meal.save();
    return meal;
  }

  /**
   * Remove meal discount
   */
  async removeMealDiscount(restaurantId: string, mealId: string): Promise<any> {
    const meal = await Meal.findOne({ _id: mealId, restaurantId });
    if (!meal) {
      throw new AppError('Meal not found', 404);
    }

    if (!meal.discount) {
      throw new AppError('No discount found for this meal', 404);
    }

    meal.discount = undefined;
    await meal.save();
    return meal;
  }

  /**
   * Get restaurant analytics
   */
  async getAnalytics(
    restaurantId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<any> {
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      throw new AppError('Restaurant not found', 404);
    }

    // Default to last 30 days if no dates provided
    const end = endDate || new Date();
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // You would implement actual analytics queries here
    // This is a simplified example
    const totalMeals = await Meal.countDocuments({ restaurantId });
    const activeMeals = await Meal.countDocuments({
      restaurantId,
      isAvailable: true,
    });

    return {
      restaurant: {
        name: restaurant.restaurantDetails.name,
        rating: restaurant.ratings.averageRating,
        totalReviews: restaurant.ratings.totalReviews,
      },
      period: {
        startDate: start,
        endDate: end,
      },
      meals: {
        total: totalMeals,
        active: activeMeals,
        inactive: totalMeals - activeMeals,
      },
      // Add more analytics as needed
    };
  }

  /**
   * Update restaurant profile
   */
  async updateProfile(restaurantId: string, updateData: any): Promise<any> {
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      throw new AppError('Restaurant not found', 404);
    }

    // Update allowed fields
    const allowedFields = [
      'restaurantDetails',
      'address',
      'phone',
      'firstName',
      'lastName',
    ];

    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        if (field === 'restaurantDetails' && restaurant.restaurantDetails) {
          Object.assign(restaurant.restaurantDetails, updateData[field]);
        } else {
          (restaurant as any)[field] = updateData[field];
        }
      }
    });

    await restaurant.save();
    return restaurant;
  }

  /**
   * Toggle restaurant operational status
   */
  async toggleOperationalStatus(restaurantId: string): Promise<any> {
    const restaurant = (await Restaurant.findById(restaurantId)) as any;
    if (!restaurant) {
      throw new AppError('Restaurant not found', 404);
    }

    await restaurant.toggleOperationalStatus();
    return restaurant;
  }

  /**
   * Get restaurant dashboard data
   */
  async getDashboard(restaurantId: string): Promise<any> {
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      throw new AppError('Restaurant not found', 404);
    }

    const totalMeals = await Meal.countDocuments({ restaurantId });
    const activeMeals = await Meal.countDocuments({
      restaurantId,
      isAvailable: true,
    });

    return {
      restaurant: {
        name: restaurant.restaurantDetails.name,
        rating: restaurant.ratings.averageRating,
        totalReviews: restaurant.ratings.totalReviews,
        isOperational: restaurant.isOperational,
        verificationStatus: restaurant.verificationStatus,
      },
      meals: {
        total: totalMeals,
        active: activeMeals,
        inactive: totalMeals - activeMeals,
      },
      // Add more dashboard data as needed
    };
  }
}
