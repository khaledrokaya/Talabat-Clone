import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SearchFilters {
  query?: string;
  category?: string;
  cuisine?: string;
  minPrice?: number;
  maxPrice?: number;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  spiceLevel?: 'mild' | 'medium' | 'hot' | 'very_hot';
  minRating?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface SearchResult {
  meals?: any[];
  restaurants?: any[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  };
  filters?: any;
  category?: string;
  featuredReason?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private searchHistorySubject = new BehaviorSubject<string[]>([]);
  public searchHistory$ = this.searchHistorySubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadSearchHistory();
  }

  /**
   * Search meals across all restaurants
   */
  searchMeals(filters: SearchFilters): Observable<ApiResponse<SearchResult>> {
    let params = new HttpParams();

    if (filters.query) {
      params = params.set('q', filters.query);
      this.addToSearchHistory(filters.query);
    }
    if (filters.category) params = params.set('category', filters.category);
    if (filters.minPrice !== undefined) params = params.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice !== undefined) params = params.set('maxPrice', filters.maxPrice.toString());
    if (filters.isVegetarian !== undefined) params = params.set('isVegetarian', filters.isVegetarian.toString());
    if (filters.spiceLevel) params = params.set('spiceLevel', filters.spiceLevel);
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());

    return this.http.get<ApiResponse<SearchResult>>(`${environment.apiUrl}/restaurants/meals/search`, { params });
  }

  /**
   * Get meals by category
   */
  getMealsByCategory(category: string, options?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
  }): Observable<ApiResponse<SearchResult>> {
    let params = new HttpParams();

    if (options?.page) params = params.set('page', options.page.toString());
    if (options?.limit) params = params.set('limit', options.limit.toString());
    if (options?.sortBy) params = params.set('sortBy', options.sortBy);
    if (options?.sortOrder) params = params.set('sortOrder', options.sortOrder);

    return this.http.get<ApiResponse<SearchResult>>(`${environment.apiUrl}/restaurants/meals/category/${category}`, { params });
  }

  /**
   * Get featured meals
   */
  getFeaturedMeals(options?: {
    limit?: number;
    category?: string;
  }): Observable<ApiResponse<SearchResult>> {
    let params = new HttpParams();

    if (options?.limit) params = params.set('limit', options.limit.toString());
    if (options?.category) params = params.set('category', options.category);

    return this.http.get<ApiResponse<SearchResult>>(`${environment.apiUrl}/restaurants/meals/featured`, { params });
  }

  /**
   * Search restaurants
   */
  searchRestaurants(filters: {
    cuisine?: string;
    minRating?: number;
    isOpen?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
  }): Observable<ApiResponse<SearchResult>> {
    let params = new HttpParams();

    if (filters.cuisine) params = params.set('cuisine', filters.cuisine);
    if (filters.minRating) params = params.set('minRating', filters.minRating.toString());
    if (filters.isOpen !== undefined) params = params.set('isOpen', filters.isOpen.toString());
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params = params.set('sortOrder', filters.sortOrder);

    return this.http.get<ApiResponse<SearchResult>>(`${environment.apiUrl}/restaurants`, { params });
  }

  /**
   * Get search suggestions based on query
   */
  getSearchSuggestions(query: string): Observable<string[]> {
    // This could be enhanced to call a suggestions API endpoint
    // For now, return filtered search history
    const history = this.getSearchHistory();
    const suggestions = history.filter(item =>
      item.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);

    return new Observable(observer => {
      observer.next(suggestions);
      observer.complete();
    });
  }

  /**
   * Get popular search terms
   */
  getPopularSearches(): string[] {
    return [
      'Pizza',
      'Burger',
      'Sushi',
      'Pasta',
      'Chicken',
      'Vegetarian',
      'Desserts',
      'Healthy',
      'Spicy food',
      'Seafood'
    ];
  }

  /**
   * Get available meal categories
   */
  getMealCategories(): { value: string; label: string; icon: string }[] {
    return [
      { value: 'appetizers', label: 'Appetizers', icon: '🥗' },
      { value: 'main-course', label: 'Main Course', icon: '🍖' },
      { value: 'desserts', label: 'Desserts', icon: '🍰' },
      { value: 'beverages', label: 'Beverages', icon: '🥤' },
      { value: 'salads', label: 'Salads', icon: '🥬' },
      { value: 'soups', label: 'Soups', icon: '🍲' },
      { value: 'pizza', label: 'Pizza', icon: '🍕' },
      { value: 'pasta', label: 'Pasta', icon: '🍝' },
      { value: 'burgers', label: 'Burgers', icon: '🍔' },
      { value: 'sandwiches', label: 'Sandwiches', icon: '🥪' },
      { value: 'seafood', label: 'Seafood', icon: '🐟' },
      { value: 'vegetarian', label: 'Vegetarian', icon: '🌱' },
      { value: 'kids-menu', label: 'Kids Menu', icon: '🧒' }
    ];
  }

  /**
   * Get available cuisine types for restaurants
   */
  getCuisineTypes(): { value: string; label: string; icon: string }[] {
    return [
      { value: 'Italian', label: 'Italian', icon: '🍕' },
      { value: 'Chinese', label: 'Chinese', icon: '🥢' },
      { value: 'Indian', label: 'Indian', icon: '🍛' },
      { value: 'Mexican', label: 'Mexican', icon: '🌮' },
      { value: 'American', label: 'American', icon: '🍔' },
      { value: 'Japanese', label: 'Japanese', icon: '🍣' },
      { value: 'Thai', label: 'Thai', icon: '🍤' },
      { value: 'Mediterranean', label: 'Mediterranean', icon: '🥙' },
      { value: 'French', label: 'French', icon: '🥐' },
      { value: 'Lebanese', label: 'Lebanese', icon: '🌯' },
      { value: 'Fast Food', label: 'Fast Food', icon: '🍟' },
      { value: 'Desserts', label: 'Desserts', icon: '🍰' },
      { value: 'Healthy', label: 'Healthy', icon: '🥗' },
      { value: 'Vegan', label: 'Vegan', icon: '🌱' }
    ];
  }

  /**
   * Search history management
   */
  private addToSearchHistory(query: string): void {
    if (!query.trim()) return;

    const history = this.getSearchHistory();
    const filteredHistory = history.filter(item => item !== query);
    const newHistory = [query, ...filteredHistory].slice(0, 10); // Keep only last 10 searches

    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    this.searchHistorySubject.next(newHistory);
  }

  private getSearchHistory(): string[] {
    try {
      const history = localStorage.getItem('searchHistory');
      return history ? JSON.parse(history) : [];
    } catch {
      return [];
    }
  }

  private loadSearchHistory(): void {
    const history = this.getSearchHistory();
    this.searchHistorySubject.next(history);
  }

  public clearSearchHistory(): void {
    localStorage.removeItem('searchHistory');
    this.searchHistorySubject.next([]);
  }

  /**
   * Utility methods for formatting and filtering
   */
  formatPrice(price: number): string {
    return `$${price.toFixed(2)}`;
  }

  formatDeliveryTime(time: number): string {
    return `${time} min`;
  }

  formatRating(rating: number): string {
    return rating > 0 ? rating.toFixed(1) : 'New';
  }

  /**
   * Check if item matches dietary restrictions
   */
  matchesDietaryFilter(meal: any, filters: SearchFilters): boolean {
    if (filters.isVegetarian && !meal.isVegetarian) return false;
    if (filters.isVegan && !meal.isVegan) return false;
    if (filters.isGlutenFree && !meal.isGlutenFree) return false;
    return true;
  }

  /**
   * Check if price is within range
   */
  matchesPriceFilter(price: number, filters: SearchFilters): boolean {
    if (filters.minPrice !== undefined && price < filters.minPrice) return false;
    if (filters.maxPrice !== undefined && price > filters.maxPrice) return false;
    return true;
  }
}
