import { Restaurant } from '../schemas/restaurant.schema';
import Meal from '../../meal/schemas/meal.schema';
import { AppError } from '../../shared/middlewares/error.middleware';

export class RestaurantPublicService {
  /**
   * Search meals publicly
   */
  async searchMeals(searchData: any): Promise<any> {
    const {
      q: search,
      category,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = searchData;

    const query: any = {
      isAvailable: true,
    };

    // Text search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { ingredients: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const sortDirection = sortOrder === 'desc' ? -1 : 1;
    const sortObj: any = {};
    sortObj[sortBy] = sortDirection;

    const skip = (Number(page) - 1) * Number(limit);

    const meals = await Meal.find(query)
      .populate('restaurantId', 'restaurantDetails.name address ratings')
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit));

    const total = await Meal.countDocuments(query);

    return {
      meals,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalMeals: total,
        hasNext: Number(page) < Math.ceil(total / Number(limit)),
        hasPrev: Number(page) > 1,
      },
    };
  }

  /**
   * Get featured meals
   */
  async getFeaturedMeals(): Promise<any[]> {
    return await Meal.find({
      isAvailable: true,
      isFeatured: true,
    })
      .populate('restaurantId', 'restaurantDetails.name address ratings')
      .sort({ ratings: -1, createdAt: -1 })
      .limit(20);
  }

  /**
   * Get meals by category
   */
  async getMealsByCategory(category: string): Promise<any[]> {
    const meals = await Meal.find({
      category: category,
      isAvailable: true,
    })
      .populate('restaurantId', 'restaurantDetails.name address ratings')
      .sort({ ratings: -1, createdAt: -1 });

    return meals;
  }

  /**
   * Get meal by ID
   */
  async getMealById(mealId: string): Promise<any> {
    const meal = await Meal.findById(mealId)
      .populate('restaurantId', 'restaurantDetails address ratings');

    if (!meal) {
      throw new AppError('Meal not found', 404);
    }

    return meal;
  }

  /**
   * Get restaurants list for public browsing
   */
  async getRestaurants(filters: any = {}): Promise<any> {
    const {
      cuisine,
      minRating,
      isOpen,
      page = 1,
      limit = 10,
      sortBy = 'ratings.averageRating',
      sortOrder = 'desc',
    } = filters;

    const query: any = {
      isActive: true,
      verificationStatus: 'verified',
      isOperational: true,
    };

    // Cuisine filter
    if (cuisine) {
      query['restaurantDetails.cuisineType'] = {
        $in: Array.isArray(cuisine) ? cuisine : [cuisine],
      };
    }

    // Rating filter
    if (minRating) {
      query['ratings.averageRating'] = { $gte: Number(minRating) };
    }

    const sortDirection = sortOrder === 'desc' ? -1 : 1;
    const sortObj: any = {};
    sortObj[sortBy] = sortDirection;

    const skip = (Number(page) - 1) * Number(limit);

    let restaurants = await Restaurant.find(query)
      .select('-password -businessInfo -__v')
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit));

    // Filter by opening hours if requested
    if (isOpen === 'true') {
      restaurants = restaurants.filter((restaurant: any) =>
        restaurant.isOpenNow(),
      );
    }

    const total = await Restaurant.countDocuments(query);

    return {
      restaurants,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalRestaurants: total,
        hasNext: Number(page) < Math.ceil(total / Number(limit)),
        hasPrev: Number(page) > 1,
      },
    };
  }

  /**
   * Get restaurant by ID with menu
   */
  async getRestaurantById(restaurantId: string): Promise<any> {
    const restaurant = await Restaurant.findOne({
      _id: restaurantId,
      isActive: true,
      verificationStatus: 'verified',
    })
      .select('-password -businessInfo -__v')
      .populate('menu');

    if (!restaurant) {
      throw new AppError('Restaurant not found', 404);
    }

    return restaurant;
  }

  /**
   * Get nearby restaurants
   */
  async getNearbyRestaurants(
    lat: number,
    lng: number,
    radius: number = 10000,
  ): Promise<any[]> {
    const restaurants = await (Restaurant as any).findNearby(lat, lng, radius);
    return restaurants;
  }

  /**
   * Get top-rated restaurants
   */
  async getTopRatedRestaurants(limit: number = 10): Promise<any[]> {
    const restaurants = await (Restaurant as any).findTopRated(limit);
    return restaurants;
  }
}
