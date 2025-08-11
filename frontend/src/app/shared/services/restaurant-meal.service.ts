import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// Meal Interfaces
export interface Meal {
  id?: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
  isAvailable: boolean;
  preparationTime: number; // in minutes
  ingredients?: string[];
  allergens?: string[];
  spiceLevel?: 'mild' | 'medium' | 'hot' | 'very-hot';
  nutritionalInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  discount?: {
    percentage: number;
    validUntil: string;
    isActive: boolean;
  };
  restaurantId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMealRequest {
  name: string;
  description: string;
  price: number;
  category: string;
  preparationTime: number;
  ingredients?: string[];
  allergens?: string[];
  spiceLevel?: 'mild' | 'medium' | 'hot' | 'very-hot';
  nutritionalInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  isAvailable?: boolean;
  imageUrl?: string; // Add imageUrl field
}

export interface UpdateMealRequest extends Partial<CreateMealRequest> {
  isAvailable?: boolean;
  imageUrl?: string; // Add imageUrl field
}

export interface MealFilters {
  page?: number;
  limit?: number;
  category?: string;
  isAvailable?: boolean;
  includeUnavailable?: boolean; // Add this option
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  priceMin?: number;
  priceMax?: number;
}

export interface MealsListResponse {
  meals: Meal[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface MealCategory {
  _id: string;
  name: string;
  nameAr: string;
  count: number;
  color: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class RestaurantMealService {
  private readonly API_BASE = `${environment.apiUrl}`;

  constructor(private http: HttpClient) { }

  /**
   * Get paginated list of restaurant meals (for restaurant owners)
   * GET /api/restaurant/meals
   */
  getMeals(filters: MealFilters = {}): Observable<ApiResponse<MealsListResponse>> {
    let params = new HttpParams();

    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.category) params = params.set('category', filters.category);
    if (filters.isAvailable !== undefined) params = params.set('isAvailable', filters.isAvailable.toString());
    if (filters.includeUnavailable) params = params.set('includeUnavailable', 'true');
    if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params = params.set('sortOrder', filters.sortOrder);
    if (filters.search) params = params.set('search', filters.search);
    if (filters.priceMin) params = params.set('priceMin', filters.priceMin.toString());
    if (filters.priceMax) params = params.set('priceMax', filters.priceMax.toString());

    return this.http.get<ApiResponse<MealsListResponse>>(
      `${this.API_BASE}/restaurant/meals`,
      { params }
    );
  }

  /**
   * Get meal by ID (public endpoint)
   * GET /api/restaurants/meals/{mealId}
   */
  getMealById(mealId: string): Observable<ApiResponse<{ meal: Meal }>> {
    return this.http.get<ApiResponse<{ meal: Meal }>>(
      `${this.API_BASE}/restaurants/meals/${mealId}`
    );
  }

  /**
   * Create new meal (restaurant owner endpoint)
   * POST /api/restaurant/meals
   */
  createMeal(mealData: CreateMealRequest): Observable<ApiResponse<{ meal: Meal }>> {
    return this.http.post<ApiResponse<{ meal: Meal }>>(
      `${this.API_BASE}/restaurant/meals`,
      mealData
    );
  }

  /**
   * Update existing meal (restaurant owner endpoint)
   * PUT /api/restaurant/meals/{mealId}
   */
  updateMeal(mealId: string, mealData: UpdateMealRequest): Observable<ApiResponse<{ meal: Meal }>> {
    return this.http.put<ApiResponse<{ meal: Meal }>>(
      `${this.API_BASE}/restaurant/meals/${mealId}`,
      mealData
    );
  }

  /**
   * Delete meal (restaurant owner endpoint)
   * DELETE /api/restaurant/meals/{mealId}
   */
  deleteMeal(mealId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${this.API_BASE}/restaurant/meals/${mealId}`
    );
  }

  /**
   * Toggle meal availability (restaurant owner endpoint)
   * PATCH /api/restaurant/meals/{mealId}/availability
   */
  toggleMealAvailability(mealId: string, isAvailable: boolean): Observable<ApiResponse<{ meal: Meal }>> {
    return this.http.patch<ApiResponse<{ meal: Meal }>>(
      `${this.API_BASE}/restaurant/meals/${mealId}/availability`,
      { isAvailable }
    );
  }

  /**
   * Set Meal Discount (restaurant owner endpoint)
   * POST /api/restaurant/meals/{mealId}/discount
   */
  setMealDiscount(mealId: string, discountData: { percentage: number; validUntil: string }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.API_BASE}/restaurant/meals/${mealId}/discount`,
      discountData
    );
  }

  /**
   * Remove Meal Discount (restaurant owner endpoint)
   * DELETE /api/restaurant/meals/{mealId}/discount
   */
  removeMealDiscount(mealId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${this.API_BASE}/restaurant/meals/${mealId}/discount`
    );
  }

  /**
   * Convert image file to data URL for simple image storage
   * This is a simplified approach - in production you'd upload to a cloud service
   */
  convertImageToDataUrl(imageFile: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsDataURL(imageFile);
    });
  }

  /**
   * Get meal categories
   * GET /api/meals/categories
   */
  getCategories(): Observable<ApiResponse<MealCategory[]>> {
    return this.http.get<ApiResponse<MealCategory[]>>(
      `${this.API_BASE}/meals/categories`
    );
  }

  /**
   * Get meals by category
   */
  getMealsByCategory(category: string, filters: MealFilters = {}): Observable<ApiResponse<MealsListResponse>> {
    return this.getMeals({ ...filters, category });
  }

  /**
   * Get available meals only
   */
  getAvailableMeals(filters: MealFilters = {}): Observable<ApiResponse<MealsListResponse>> {
    return this.getMeals({ ...filters, isAvailable: true });
  }

  /**
   * Search meals
   */
  searchMeals(searchTerm: string, filters: MealFilters = {}): Observable<ApiResponse<MealsListResponse>> {
    return this.getMeals({ ...filters, search: searchTerm });
  }

  /**
   * Get meals statistics
   * GET /api/restaurants/manage/meals/stats
   */
  getMealsStats(): Observable<ApiResponse<{
    totalMeals: number;
    availableMeals: number;
    unavailableMeals: number;
    categoriesCount: number;
    averagePrice: number;
    mostPopularMeals: Meal[];
  }>> {
    return this.http.get<ApiResponse<any>>(
      `${this.API_BASE}/meals/stats`
    );
  }

  /**
   * Bulk update meal availability
   * PATCH /api/restaurants/manage/meals/bulk-availability
   */
  bulkUpdateAvailability(mealIds: string[], isAvailable: boolean): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(
      `${this.API_BASE}/meals/bulk-availability`,
      { mealIds, isAvailable }
    );
  }

  /**
   * Duplicate meal
   * POST /api/restaurants/manage/meals/:id/duplicate
   */
  duplicateMeal(mealId: string, newName?: string): Observable<ApiResponse<{ meal: Meal }>> {
    return this.http.post<ApiResponse<{ meal: Meal }>>(
      `${this.API_BASE}/meals/${mealId}/duplicate`,
      { newName }
    );
  }

  /**
   * Utility methods
   */
  formatPrice(price: number): string {
    return `${price.toFixed(2)} EGP`;
  }

  getCategoryColor(category: string): string {
    const categoryColors: Record<string, string> = {
      'Pizza': '#ff6b6b',
      'Burgers': '#4ecdc4',
      'Fried Chicken': '#45b7d1',
      'Seafood': '#96ceb4',
      'Desserts': '#ffeaa7',
      'Grilled': '#fd79a8',
      'Sandwiches': '#fdcb6e',
      'Shawarma': '#6c5ce7',
      'Fast Food': '#a29bfe',
      'Pasta': '#e17055',
      'Breakfast': '#00b894',
      'Asian': '#74b9ff',
      'Street Food': '#55a3ff',
      'Pastries': '#ffa502',
      'Waffles': '#ff7675',
      'American': '#fd79a8',
      'Ice Cream': '#fdcb6e',
      'Italian': '#00b894',
      'Arabic Sweets': '#e84393',
      'Chicken': '#fdcb6e',
      'Snacks': '#a29bfe',
      'BBQ': '#fd79a8',
      'Chocolate': '#6c5ce7',
      'Chinese': '#ff7675',
      'Arabic': '#00b894',
      'Coffee': '#795548',
      'Calzone': '#ff6b6b',
      'Kebab': '#fd79a8',
      'Crepe': '#fdcb6e',
      'Koshari': '#e17055',
      'Cake': '#ffeaa7',
      'Bakery': '#fab1a0',
      'Beverages': '#74b9ff',
      'Egyptian': '#00b894',
      'Pastry': '#fab1a0',
      'Nuts': '#e17055',
      'Manakish': '#fdcb6e',
      'Mandi': '#fd79a8',
      'Vegetarian': '#00b894',
      'Noodles': '#ff7675'
    };
    return categoryColors[category] || '#6c757d';
  }

  getAvailabilityText(isAvailable: boolean): string {
    return isAvailable ? 'Available' : 'Unavailable';
  }

  getAvailabilityColor(isAvailable: boolean): string {
    return isAvailable ? '#28a745' : '#dc3545';
  }

  validateMealData(mealData: CreateMealRequest | UpdateMealRequest): string[] {
    const errors: string[] = [];

    if ('name' in mealData && (!mealData.name || mealData.name.trim().length < 2)) {
      errors.push('Meal name must be at least 2 characters long');
    }

    if ('description' in mealData && (!mealData.description || mealData.description.trim().length < 10)) {
      errors.push('Description must be at least 10 characters long');
    }

    if ('price' in mealData && (!mealData.price || mealData.price <= 0)) {
      errors.push('Price must be greater than 0');
    }

    if ('preparationTime' in mealData && (!mealData.preparationTime || mealData.preparationTime <= 0)) {
      errors.push('Preparation time must be greater than 0 minutes');
    }

    if ('category' in mealData && (!mealData.category || mealData.category.trim().length === 0)) {
      errors.push('Category is required');
    }

    return errors;
  }
}
