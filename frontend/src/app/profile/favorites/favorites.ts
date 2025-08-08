import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FavoritesService } from '../../shared/services/favorites.service';
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
  successMessage = '';
  errorMessage = '';

  constructor(
    private favoritesService: FavoritesService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadFavorites();
  }

  loadFavorites(): void {
    this.isLoading = true;
    this.clearMessages();

    this.favoritesService.getFavorites().subscribe({
      next: (response: any) => {
        console.log('Favorites API response:', response);
        this.favorites = response.data || [];
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading favorites:', error);
        this.errorMessage = 'Error loading favorite restaurants';
        this.isLoading = false;
        this.favorites = [];
        this.hideMessageAfterDelay();
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
          this.successMessage = 'Restaurant removed from favorites successfully';
          this.hideMessageAfterDelay();
        },
        error: (error: any) => {
          console.error('Error removing restaurant from favorites:', error);
          this.errorMessage = 'Error occurred while removing restaurant from favorites';
          this.showRemoveModal = false;
          this.restaurantToRemove = null;
          this.hideMessageAfterDelay();
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

  // Restaurant card interaction handlers
  onFavoriteToggle(restaurant: any): void {
    // On favorites page, toggling favorite means removing it
    console.log('Removing restaurant from favorites:', restaurant.restaurantDetails?.name || restaurant.name);
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

  private clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  private hideMessageAfterDelay(): void {
    setTimeout(() => {
      this.clearMessages();
    }, 5000);
  }
}

