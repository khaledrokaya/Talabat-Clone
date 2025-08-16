import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FavoritesService } from '../../shared/services/favorites.service';
import { ToastService } from '../../shared/services/toast.service';
import { RestaurantCard } from '../../restaurants/restaurant-card/restaurant-card';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RestaurantCard],
  templateUrl: './favorites.html',
  styleUrls: ['./favorites.scss']
})
export class Favorites implements OnInit {
  favorites: any[] = [];
  isLoading = true;
  showRemoveModal = false;
  restaurantToRemove: string | null = null;
  imageLoadingStates: { [key: string]: boolean } = {};

  constructor(
    private favoritesService: FavoritesService,
    private router: Router,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.loadFavorites();
  }

  loadFavorites(): void {
    this.isLoading = true;

    this.favoritesService.getFavorites().subscribe({
      next: (response: any) => {
        this.favorites = response.data || [];
        this.isLoading = false;

        // Show summary if no favorites
        if (this.favorites.length === 0) {
          this.favoritesService.showFavoritesSummary();
        } else {
          // Show success message when favorites loaded
          this.toastService.success(
            `Loaded ${this.favorites.length} favorite restaurant${this.favorites.length > 1 ? 's' : ''}`,
            'Favorites Updated',
            2000
          );
        }
      },
      error: (error: any) => {
        // Error toast is handled in the favorites service
        this.isLoading = false;
        this.favorites = [];
      }
    });
  }

  onImageError(event: any): void {
    event.target.src = '/assets/images/restaurant-placeholder.jpg';
  }

  removeFromFavorites(restaurantId: string): void {
    this.restaurantToRemove = restaurantId;
    this.showRemoveModal = true;
  }

  confirmRemove(): void {
    if (this.restaurantToRemove) {
      this.favoritesService.removeFromFavorites(this.restaurantToRemove).subscribe({
        next: () => {
          this.favorites = this.favorites.filter(
            restaurant => restaurant._id !== this.restaurantToRemove
          );
          this.showRemoveModal = false;
          this.restaurantToRemove = null;
          // Toast message is handled in the favorites service
        },
        error: (error: any) => {
          // Error toast is handled in the favorites service
          this.showRemoveModal = false;
          this.restaurantToRemove = null;
        }
      });
    }
  }

  cancelRemove(): void {
    this.showRemoveModal = false;
    this.restaurantToRemove = null;
  }

  viewRestaurant(restaurantId: string): void {
    this.router.navigate(['/restaurants', restaurantId]);
  }

  orderNow(restaurantId: string): void {
    this.router.navigate(['/restaurants', restaurantId]);
  }

  browseRestaurants(): void {
    this.router.navigate(['/restaurants']);
  }

  refreshFavorites(): void {
    this.loadFavorites();
  }

  // Restaurant card interaction handlers
  onFavoriteToggle(restaurant: any): void {
    // On favorites page, toggling favorite means removing it
    // The restaurant-card component handles the actual toggle logic
    // We just need to refresh the list after the action
    setTimeout(() => {
      this.loadFavorites();
    }, 500);
  }

  onQuickView(restaurant: any): void {
    this.viewRestaurant(restaurant._id);
  }

  // Track by function for ngFor performance
  trackByRestaurant(index: number, restaurant: any): string {
    return restaurant._id || index.toString();
  }

  // Get restaurant image with fallback
  getRestaurantImage(restaurant: any): string {
    return restaurant.image ||
      restaurant.logoUrl ||
      '/assets/images/default-restaurant.jpg';
  }

  // Get restaurant name
  getRestaurantName(restaurant: any): string {
    return restaurant.restaurantDetails?.name ||
      restaurant.name ||
      `${restaurant.firstName || ''} ${restaurant.lastName || ''}`.trim() ||
      'Restaurant';
  }

  // Handle image loading states
  onImageLoad(restaurantId: string): void {
    this.imageLoadingStates[restaurantId] = false;
  }

  onImageLoadStart(restaurantId: string): void {
    this.imageLoadingStates[restaurantId] = true;
  }

  isImageLoading(restaurantId: string): boolean {
    return this.imageLoadingStates[restaurantId] || false;
  }
}

