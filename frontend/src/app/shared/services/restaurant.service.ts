import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Restaurant } from '../models/restaurant';
import { Review } from '../models/review';

export interface RestaurantFilter {
  cuisine?: string;
  minRating?: number;
  isOpen?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'rating' | 'deliveryTime' | 'deliveryFee';
  sortOrder?: 'asc' | 'desc';
}

export interface MealSearchFilter {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  isVegetarian?: boolean;
  spiceLevel?: 'mild' | 'medium' | 'hot' | 'very_hot';
  page?: number;
  limit?: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface RestaurantListResponse {
  restaurants: Restaurant[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  };
}

interface TopRatedRestaurantsResponse {
  restaurants: (Restaurant & { rank: number })[];
  criteria: {
    minRating: number;
    minReviews: number;
    sortBy: string;
  };
}

interface MealSearchResponse {
  meals: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  filters?: any;
}

interface FeaturedMealsResponse {
  meals: any[];
  featuredReason: 'highly_rated' | 'popular' | 'new' | 'promotional';
}

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {

  constructor(private http: HttpClient) { }

  getRestaurants(filter?: RestaurantFilter): Observable<ApiResponse<RestaurantListResponse>> {
    let params = new HttpParams();

    if (filter) {
      if (filter.cuisine) params = params.set('cuisine', filter.cuisine);
      if (filter.minRating) params = params.set('minRating', filter.minRating.toString());
      if (filter.isOpen !== undefined) params = params.set('isOpen', filter.isOpen.toString());
      if (filter.page) params = params.set('page', filter.page.toString());
      if (filter.limit) params = params.set('limit', filter.limit.toString());
      if (filter.sortBy) params = params.set('sortBy', filter.sortBy);
      if (filter.sortOrder) params = params.set('sortOrder', filter.sortOrder);
    }

    return this.http.get<ApiResponse<RestaurantListResponse>>(`${environment.apiUrl}/restaurants`, { params });
  }

  getTopRatedRestaurants(filter?: { limit?: number; minRating?: number; cuisine?: string }): Observable<ApiResponse<TopRatedRestaurantsResponse>> {
    let params = new HttpParams();

    if (filter) {
      if (filter.limit) params = params.set('limit', filter.limit.toString());
      if (filter.minRating) params = params.set('minRating', filter.minRating.toString());
      if (filter.cuisine) params = params.set('cuisine', filter.cuisine);
    }

    return this.http.get<ApiResponse<TopRatedRestaurantsResponse>>(`${environment.apiUrl}/restaurants/featured/top-rated`, { params });
  }

  searchMeals(filter?: MealSearchFilter): Observable<ApiResponse<MealSearchResponse>> {
    let params = new HttpParams();

    if (filter) {
      if (filter.q) params = params.set('q', filter.q);
      if (filter.category) params = params.set('category', filter.category);
      if (filter.minPrice) params = params.set('minPrice', filter.minPrice.toString());
      if (filter.maxPrice) params = params.set('maxPrice', filter.maxPrice.toString());
      if (filter.isVegetarian !== undefined) params = params.set('isVegetarian', filter.isVegetarian.toString());
      if (filter.spiceLevel) params = params.set('spiceLevel', filter.spiceLevel);
      if (filter.page) params = params.set('page', filter.page.toString());
      if (filter.limit) params = params.set('limit', filter.limit.toString());
    }

    return this.http.get<ApiResponse<MealSearchResponse>>(`${environment.apiUrl}/restaurants/meals/search`, { params });
  }

  getFeaturedMeals(filter?: { limit?: number; category?: string }): Observable<ApiResponse<FeaturedMealsResponse>> {
    let params = new HttpParams();

    if (filter) {
      if (filter.limit) params = params.set('limit', filter.limit.toString());
      if (filter.category) params = params.set('category', filter.category);
    }

    return this.http.get<ApiResponse<FeaturedMealsResponse>>(`${environment.apiUrl}/restaurants/meals/featured`, { params });
  }

  getRestaurantById(id: string): Observable<Restaurant> {
    return this.http.get<Restaurant>(`${environment.apiUrl}/restaurants/${id}`);
  }

  getRestaurantProducts(restaurantId: string): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/restaurants/${restaurantId}/products`);
  }

  // Category management (using meals endpoint for now)
  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/meals/categories`);
  }

  createCategory(categoryData: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/user/restaurants/categories`, categoryData);
  }

  updateCategory(categoryId: string, categoryData: any): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/user/restaurants/categories/${categoryId}`, categoryData);
  }

  deleteCategory(categoryId: string): Observable<any> {
    return this.http.delete<any>(`${environment.apiUrl}/user/restaurants/categories/${categoryId}`);
  }

  // Product/Meal management
  getProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/user/restaurants/meals`);
  }

  createProduct(productData: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/user/restaurants/meals`, productData);
  }

  updateProduct(productId: string, productData: any): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/user/restaurants/meals/${productId}`, productData);
  }

  deleteProduct(productId: string): Observable<any> {
    return this.http.delete<any>(`${environment.apiUrl}/user/restaurants/meals/${productId}`);
  }

  // Restaurant statistics (use analytics service instead)
  getRestaurantStats(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/user/restaurants/dashboard`);
  }

  // Restaurant Dashboard Data (for restaurant owners)
  getRestaurantDashboard(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/restaurants/manage/dashboard`);
  }

  // Restaurant Analytics (for restaurant owners)
  getRestaurantAnalytics(startDate?: string, endDate?: string): Observable<any> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get<any>(`${environment.apiUrl}/user/restaurants/analytics`, { params });
  }

  // Order management for restaurant
  getRestaurantOrders(status?: string): Observable<any[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);

    return this.http.get<any[]>(`${environment.apiUrl}/orders`, { params });
  }

  updateOrderStatus(orderId: string, status: string): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/orders/${orderId}/status`, { status });
  }

  // Review management for restaurant
  getRestaurantReviewsForDashboard(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/restaurants/reviews`);
  }

  // Review functions for customers
  getRestaurantReviews(restaurantId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${environment.apiUrl}/restaurants/${restaurantId}/reviews`);
  }

  getUserReview(restaurantId: string, userId: string): Observable<Review | null> {
    return this.http.get<Review | null>(`${environment.apiUrl}/restaurants/${restaurantId}/reviews/user/${userId}`);
  }

  addReview(reviewData: any): Observable<Review> {
    return this.http.post<Review>(`${environment.apiUrl}/restaurants/${reviewData.restaurantId}/reviews`, reviewData);
  }

  updateReview(reviewId: string, reviewData: any): Observable<Review> {
    return this.http.put<Review>(`${environment.apiUrl}/reviews/${reviewId}`, reviewData);
  }

  deleteReview(reviewId: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/reviews/${reviewId}`);
  }

  // Restaurant owner reply to review
  replyToReview(reviewId: string, reply: string): Observable<Review> {
    return this.http.post<Review>(`${environment.apiUrl}/reviews/${reviewId}/reply`, { reply });
  }
}

