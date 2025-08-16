import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';

export interface FavoriteRestaurant {
  _id?: string;
  id?: string;
  restaurantDetails: {
    name: string;
    description?: string;
    cuisineType?: string[];
    averageDeliveryTime?: number;
    minimumOrderAmount?: number;
    deliveryFee?: number;
  };
  email: string;
  isActive: boolean;
  image?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  ratings?: {
    averageRating: number;
    totalReviews: number;
  };
}

export interface FavoritesResponse {
  success: boolean;
  message: string;
  data: FavoriteRestaurant[];
}

export interface FavoriteActionResponse {
  success: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private apiUrl = `${environment.apiUrl}/customer/favorites`;
  private readonly STORAGE_KEY = 'user_favorites';
  private favoritesSubject = new BehaviorSubject<string[]>([]);
  public favorites$ = this.favoritesSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private toastService: ToastService
  ) {
    // Load favorites when service is created
    this.initializeFavorites();

    // Listen to auth state changes
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        // User logged in - sync localStorage with backend
        this.syncWithBackend();
      } else {
        // User logged out - keep localStorage for guest browsing but clear sensitive data
        // We'll keep favorites for UI purposes but they won't be actionable
      }
    });
  }

  private initializeFavorites(): void {
    // Always load from localStorage first for instant availability
    const storedFavorites = this.getFavoritesFromStorage();
    this.favoritesSubject.next(storedFavorites);

    if (this.authService.isLoggedIn()) {
      // Then sync with backend in background
      this.syncWithBackend();
    }
  }

  // Get favorites from localStorage
  private getFavoritesFromStorage(): string[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      return [];
    }
  }

  // Save favorites to localStorage
  private saveFavoritesToStorage(favoriteIds: string[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(favoriteIds));
      this.favoritesSubject.next(favoriteIds);
    } catch (error) {
      console.error('Failed to save favorites to localStorage:', error);
    }
  }

  // Sync with backend (silent operation)
  private syncWithBackend(): void {
    this.getFavorites().subscribe({
      next: (response) => {
        // Favorites are updated in getFavorites method
      },
      error: (error) => {
        // Silent sync - don't show error toasts for background sync
        console.warn('Background sync with favorites failed:', error);
      }
    });
  }

  // Immediately add to localStorage and then sync with backend
  private addToFavoritesInstantly(restaurantId: string): void {
    const currentFavorites = this.favoritesSubject.value;
    if (!currentFavorites.includes(restaurantId)) {
      const updatedFavorites = [...currentFavorites, restaurantId];
      this.saveFavoritesToStorage(updatedFavorites);
    }
  }

  // Immediately remove from localStorage and then sync with backend
  private removeFromFavoritesInstantly(restaurantId: string): void {
    const currentFavorites = this.favoritesSubject.value;
    const updatedFavorites = currentFavorites.filter(id => id !== restaurantId);
    this.saveFavoritesToStorage(updatedFavorites);
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * Get all favorite restaurants for the authenticated user
   */
  getFavorites(): Observable<FavoritesResponse> {
    if (!this.authService.isLoggedIn()) {
      this.toastService.warning('Please log in to view your favorites', 'Authentication Required');
      return of({ success: false, message: 'Not authenticated', data: [] });
    }

    return this.http.get<FavoritesResponse>(this.apiUrl, { headers: this.getHeaders() })
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            const favoriteIds = response.data.map(fav => fav._id || fav.id).filter(id => id) as string[];

            // Merge with existing localStorage favorites to avoid losing instant updates
            const localFavorites = this.getFavoritesFromStorage();
            const mergedFavorites = [...new Set([...localFavorites, ...favoriteIds])];

            this.saveFavoritesToStorage(mergedFavorites);
          }
        }),
        catchError((error) => {
          console.error('Error fetching favorites:', error);
          if (error.status !== 0) { // Don't show network error toast for silent syncs
            this.toastService.showNetworkError();
          }
          // Return cached favorites on error
          return of({
            success: false,
            message: 'Failed to load favorites',
            data: []
          });
        })
      );
  }

  /**
   * Add a restaurant to favorites
   */
  addToFavorites(restaurantId: string): Observable<FavoriteActionResponse> {
    if (!this.authService.isLoggedIn()) {
      this.toastService.warning('Please log in to add restaurants to favorites', 'Authentication Required');
      return of({ success: false, message: 'Please log in to add favorites' });
    }

    // Immediately update localStorage for instant UI feedback
    this.addToFavoritesInstantly(restaurantId);

    const body = { restaurantId };
    return this.http.post<FavoriteActionResponse>(this.apiUrl, body, { headers: this.getHeaders() })
      .pipe(
        tap(response => {
          if (response.success) {
            // Backend confirmed - favorites already updated locally
          } else {
            // Revert local change if backend failed
            this.removeFromFavoritesInstantly(restaurantId);
          }
        }),
        catchError((error) => {
          console.error('Error adding to favorites:', error);
          // Revert local change on error
          this.removeFromFavoritesInstantly(restaurantId);

          if (error.status === 400 && error.error?.message?.includes('already')) {
            this.toastService.info('This restaurant is already in your favorites', 'Already Added');
          } else if (error.status === 401) {
            this.toastService.showUnauthorizedError();
          } else {
            this.toastService.error('Failed to add restaurant to favorites. Please try again.');
          }
          return of({ success: false, message: 'Failed to add to favorites' });
        })
      );
  }

  /**
   * Remove a restaurant from favorites
   */
  removeFromFavorites(restaurantId: string): Observable<FavoriteActionResponse> {
    if (!this.authService.isLoggedIn()) {
      this.toastService.warning('Please log in to manage your favorites', 'Authentication Required');
      return of({ success: false, message: 'Please log in to manage favorites' });
    }

    // Store original state for potential revert
    const originalFavorites = [...this.favoritesSubject.value];

    // Immediately update localStorage for instant UI feedback
    this.removeFromFavoritesInstantly(restaurantId);

    const url = `${this.apiUrl}/${restaurantId}`;
    return this.http.delete<FavoriteActionResponse>(url, { headers: this.getHeaders() })
      .pipe(
        tap(response => {
          if (response.success) {
            // Backend confirmed - favorites already updated locally
          } else {
            // Revert local change if backend failed
            this.saveFavoritesToStorage(originalFavorites);
          }
        }),
        catchError((error) => {
          console.error('Error removing from favorites:', error);
          // Revert local change on error
          this.saveFavoritesToStorage(originalFavorites);

          if (error.status === 404) {
            this.toastService.warning('Restaurant was not in your favorites', 'Not Found');
          } else if (error.status === 401) {
            this.toastService.showUnauthorizedError();
          } else {
            this.toastService.error('Failed to remove restaurant from favorites. Please try again.');
          }
          return of({ success: false, message: 'Failed to remove from favorites' });
        })
      );
  }

  /**
   * Toggle favorite status for a restaurant
   */
  toggleFavorite(restaurantId: string): Observable<FavoriteActionResponse> {
    const currentFavorites = this.favoritesSubject.value;
    const isFavorite = currentFavorites.includes(restaurantId);

    if (isFavorite) {
      return this.removeFromFavorites(restaurantId);
    } else {
      return this.addToFavorites(restaurantId);
    }
  }

  /**
   * Toggle favorite with custom restaurant name for better toast messages
   */
  toggleFavoriteWithName(restaurantId: string, restaurantName?: string): Observable<FavoriteActionResponse> {
    const currentFavorites = this.favoritesSubject.value;
    const isFavorite = currentFavorites.includes(restaurantId);

    if (isFavorite) {
      return this.removeFromFavorites(restaurantId).pipe(
        tap(response => {
          if (response.success && restaurantName) {
            this.toastService.showCustomToast(
              'info',
              `${restaurantName} removed from favorites`,
              '💔 Removed',
              {
                duration: 2500,
                customClass: 'toast-favorite-removed'
              }
            );
          }
        })
      );
    } else {
      return this.addToFavorites(restaurantId).pipe(
        tap(response => {
          if (response.success && restaurantName) {
            this.toastService.showCustomToast(
              'success',
              `${restaurantName} added to favorites!`,
              '❤️ Favorites',
              {
                duration: 3000,
                customClass: 'toast-favorite-added'
              }
            );
          }
        })
      );
    }
  }

  /**
   * Check if a restaurant is in favorites (instant check using localStorage)
   */
  isFavorite(restaurantId: string): boolean {
    return this.favoritesSubject.value.includes(restaurantId);
  }

  /**
   * Get instant favorite status from localStorage (synchronous)
   */
  isFavoriteInstant(restaurantId: string): boolean {
    const storedFavorites = this.getFavoritesFromStorage();
    return storedFavorites.includes(restaurantId);
  }

  /**
   * Get current favorites list (synchronous)
   */
  getCurrentFavorites(): string[] {
    return this.favoritesSubject.value;
  }

  /**
   * Get current favorites from localStorage (synchronous)
   */
  getCurrentFavoritesFromStorage(): string[] {
    return this.getFavoritesFromStorage();
  }

  /**
   * Load favorites on service initialization
   */
  private loadFavorites(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.getFavorites().subscribe({
        next: (response) => {
          // Success handled in getFavorites method
        },
        error: (error) => {
          // Error handled in getFavorites method
        }
      });
    }
  }

  /**
   * Show favorites summary toast
   */
  showFavoritesSummary(): void {
    const count = this.favoritesSubject.value.length;
    if (count === 0) {
      this.toastService.info('You haven\'t added any favorite restaurants yet', 'No Favorites');
    } else {
      this.toastService.info(
        `You have ${count} favorite restaurant${count > 1 ? 's' : ''}`,
        '❤️ Your Favorites'
      );
    }
  }

  /**
   * Force sync with backend (useful for manual refresh)
   */
  forceSyncWithBackend(): Observable<FavoritesResponse> {
    if (!this.authService.isLoggedIn()) {
      return of({ success: false, message: 'Not authenticated', data: [] });
    }

    return this.getFavorites().pipe(
      tap(() => {
        this.toastService.success('Favorites synced with server', 'Sync Complete', 2000);
      })
    );
  }

  /**
   * Get favorites count from localStorage (instant)
   */
  getFavoritesCount(): number {
    return this.getFavoritesFromStorage().length;
  }

  /**
   * Check if favorites are available offline
   */
  hasCachedFavorites(): boolean {
    return this.getFavoritesFromStorage().length > 0;
  }

  /**
   * Clear all favorites data (for logout)
   */
  clearFavorites(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.favoritesSubject.next([]);
    console.log('🧹 Favorites cleared');
  }

  /**
   * Get restaurant info from favorites cache
   */
  getCachedRestaurantInfo(restaurantId: string): any {
    const favorites = this.getFavoritesFromStorage();
    return favorites.find(fav =>
      typeof fav === 'string' ? fav === restaurantId :
        ((fav as any)._id === restaurantId || (fav as any).id === restaurantId)
    ) || null;
  }
}
