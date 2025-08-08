import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface FavoriteRestaurant {
  _id?: string;
  id?: string;
  restaurantDetails: {
    name: string;
  };
  email: string;
  isActive: boolean;
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
  private favoritesSubject = new BehaviorSubject<string[]>(this.getFavoritesFromStorage());
  public favorites$ = this.favoritesSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadFavorites();
  }

  // Get favorites from localStorage
  private getFavoritesFromStorage(): string[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading favorites from localStorage:', error);
      return [];
    }
  }

  // Save favorites to localStorage
  private saveFavoritesToStorage(favoriteIds: string[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(favoriteIds));
      this.favoritesSubject.next(favoriteIds);
    } catch (error) {
      console.error('Error saving favorites to localStorage:', error);
    }
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * Get all favorite restaurants for the authenticated user
   */
  getFavorites(): Observable<FavoritesResponse> {
    return this.http.get<FavoritesResponse>(this.apiUrl, { headers: this.getHeaders() })
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            const favoriteIds = response.data.map(fav => fav._id || fav.id).filter(id => id) as string[];
            this.saveFavoritesToStorage(favoriteIds);
          }
        })
      );
  }

  /**
   * Add a restaurant to favorites
   */
  addToFavorites(restaurantId: string): Observable<FavoriteActionResponse> {
    const body = { restaurantId };
    return this.http.post<FavoriteActionResponse>(this.apiUrl, body, { headers: this.getHeaders() })
      .pipe(
        tap(response => {
          if (response.success) {
            const currentFavorites = this.favoritesSubject.value;
            if (!currentFavorites.includes(restaurantId)) {
              const updatedFavorites = [...currentFavorites, restaurantId];
              this.saveFavoritesToStorage(updatedFavorites);
            }
          }
        })
      );
  }

  /**
   * Remove a restaurant from favorites
   */
  removeFromFavorites(restaurantId: string): Observable<FavoriteActionResponse> {
    const url = `${this.apiUrl}/${restaurantId}`;
    return this.http.delete<FavoriteActionResponse>(url, { headers: this.getHeaders() })
      .pipe(
        tap(response => {
          if (response.success) {
            const currentFavorites = this.favoritesSubject.value;
            const updatedFavorites = currentFavorites.filter(id => id !== restaurantId);
            this.saveFavoritesToStorage(updatedFavorites);
          }
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
   * Check if a restaurant is in favorites
   */
  isFavorite(restaurantId: string): boolean {
    return this.favoritesSubject.value.includes(restaurantId);
  }

  /**
   * Get current favorites list (synchronous)
   */
  getCurrentFavorites(): string[] {
    return this.favoritesSubject.value;
  }

  /**
   * Load favorites on service initialization
   */
  private loadFavorites(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.getFavorites().subscribe({
        next: (response) => {
          console.log('Favorites loaded successfully');
        },
        error: (error) => {
          console.error('Error loading favorites:', error);
        }
      });
    }
  }

  /**
   * Clear favorites (useful for logout)
   */
  clearFavorites(): void {
    this.favoritesSubject.next([]);
  }
}
