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
  nutritionalInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
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
  nutritionalInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  isAvailable?: boolean;
}

export interface UpdateMealRequest extends Partial<CreateMealRequest> {
  isAvailable?: boolean;
}

export interface MealFilters {
  page?: number;
  limit?: number;
  category?: string;
  isAvailable?: boolean;
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
  id: string;
  name: string;
  description?: string;
  image?: string;
  sortOrder: number;
  isActive: boolean;
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
  private readonly API_BASE = `${environment.apiUrl}/api/restaurants/manage`;

  constructor(private http: HttpClient) { }

  /**
   * Get paginated list of restaurant meals
   * GET /api/restaurants/manage/meals
   */
  getMeals(filters: MealFilters = {}): Observable<ApiResponse<MealsListResponse>> {
    let params = new HttpParams();

    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.category) params = params.set('category', filters.category);
    if (filters.isAvailable !== undefined) params = params.set('isAvailable', filters.isAvailable.toString());
    if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params = params.set('sortOrder', filters.sortOrder);
    if (filters.search) params = params.set('search', filters.search);
    if (filters.priceMin) params = params.set('priceMin', filters.priceMin.toString());
    if (filters.priceMax) params = params.set('priceMax', filters.priceMax.toString());

    return this.http.get<ApiResponse<MealsListResponse>>(
      `${this.API_BASE}/meals`,
      { params }
    );
  }

  /**
   * Get meal by ID
   * GET /api/restaurants/manage/meals/:id
   */
  getMealById(mealId: string): Observable<ApiResponse<{ meal: Meal }>> {
    return this.http.get<ApiResponse<{ meal: Meal }>>(
      `${this.API_BASE}/meals/${mealId}`
    );
  }

  /**
   * Create new meal
   * POST /api/restaurants/manage/meals
   */
  createMeal(mealData: CreateMealRequest): Observable<ApiResponse<{ meal: Meal }>> {
    return this.http.post<ApiResponse<{ meal: Meal }>>(
      `${this.API_BASE}/meals`,
      mealData
    );
  }

  /**
   * Update existing meal
   * PUT /api/restaurants/manage/meals/:id
   */
  updateMeal(mealId: string, mealData: UpdateMealRequest): Observable<ApiResponse<{ meal: Meal }>> {
    return this.http.put<ApiResponse<{ meal: Meal }>>(
      `${this.API_BASE}/meals/${mealId}`,
      mealData
    );
  }

  /**
   * Delete meal
   * DELETE /api/restaurants/manage/meals/:id
   */
  deleteMeal(mealId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${this.API_BASE}/meals/${mealId}`
    );
  }

  /**
   * Toggle meal availability
   * PATCH /api/restaurants/manage/meals/:id/availability
   */
  toggleMealAvailability(mealId: string, isAvailable: boolean): Observable<ApiResponse<{ meal: Meal }>> {
    return this.http.patch<ApiResponse<{ meal: Meal }>>(
      `${this.API_BASE}/meals/${mealId}/availability`,
      { isAvailable }
    );
  }

  /**
   * Upload meal image
   * POST /api/restaurants/manage/meals/:id/image
   */
  uploadMealImage(mealId: string, imageFile: File): Observable<ApiResponse<{ imageUrl: string }>> {
    const formData = new FormData();
    formData.append('image', imageFile);

    return this.http.post<ApiResponse<{ imageUrl: string }>>(
      `${this.API_BASE}/meals/${mealId}/image`,
      formData
    );
  }

  /**
   * Get meal categories
   * GET /api/restaurants/manage/categories
   */
  getCategories(): Observable<ApiResponse<{ categories: MealCategory[] }>> {
    return this.http.get<ApiResponse<{ categories: MealCategory[] }>>(
      `${this.API_BASE}/categories`
    );
  }

  /**
   * Create new category
   * POST /api/restaurants/manage/categories
   */
  createCategory(categoryData: Omit<MealCategory, 'id'>): Observable<ApiResponse<{ category: MealCategory }>> {
    return this.http.post<ApiResponse<{ category: MealCategory }>>(
      `${this.API_BASE}/categories`,
      categoryData
    );
  }

  /**
   * Update category
   * PUT /api/restaurants/manage/categories/:id
   */
  updateCategory(categoryId: string, categoryData: Partial<MealCategory>): Observable<ApiResponse<{ category: MealCategory }>> {
    return this.http.put<ApiResponse<{ category: MealCategory }>>(
      `${this.API_BASE}/categories/${categoryId}`,
      categoryData
    );
  }

  /**
   * Delete category
   * DELETE /api/restaurants/manage/categories/:id
   */
  deleteCategory(categoryId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${this.API_BASE}/categories/${categoryId}`
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
      'appetizers': '#ff6b6b',
      'main-courses': '#4ecdc4',
      'desserts': '#45b7d1',
      'beverages': '#96ceb4',
      'salads': '#feca57',
      'soups': '#ff9ff3',
      'seafood': '#54a0ff',
      'grilled': '#5f27cd',
      'pasta': '#00d2d3',
      'pizza': '#ff6348'
    };
    return categoryColors[category.toLowerCase()] || '#6c757d';
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
