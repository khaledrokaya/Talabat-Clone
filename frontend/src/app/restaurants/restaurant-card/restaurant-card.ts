import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FavoritesService } from '../../shared/services/favorites.service';
import { Subscription } from 'rxjs';

export interface Restaurant {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  image?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  menu: any[];
  orderHistory: any[];
  isOperational: boolean;
  verificationStatus: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  restaurantDetails: {
    openingHours: {
      [key: string]: {
        open: string;
        close: string;
        isOpen: boolean;
      }
    };
    name: string;
    description: string;
    cuisineType: string[];
    averageDeliveryTime: number;
    minimumOrderAmount: number;
    deliveryFee: number;
    serviceRadius: number;
  };
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  ratings: {
    ratingBreakdown: {
      [key: string]: number;
    };
    averageRating: number;
    totalReviews: number;
  };
}

@Component({
  selector: 'app-restaurant-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './restaurant-card.html',
  styleUrl: './restaurant-card.scss'
})
export class RestaurantCard implements OnInit, OnDestroy {
  @Input() restaurant!: any; // Made flexible to accept any restaurant object
  @Input() showDescription: boolean = true;
  @Input() showMinimumOrder: boolean = true;
  @Input() cardSize: 'small' | 'medium' | 'large' = 'medium';
  @Input() showPromotedBadge: boolean = true;
  @Input() showQuickActions: boolean = true;

  @Output() favoriteToggle = new EventEmitter<any>();
  @Output() quickView = new EventEmitter<any>();

  isFavorite: boolean = false;
  isProcessingFavorite: boolean = false;
  private favoritesSubscription?: Subscription;

  constructor(private favoritesService: FavoritesService) { }

  ngOnInit(): void {
    // Initialize favorite status from localStorage for instant display
    this.updateFavoriteStatus();

    // Subscribe to favorites changes for real-time updates
    this.favoritesSubscription = this.favoritesService.favorites$.subscribe(favoriteIds => {
      this.isFavorite = favoriteIds.includes(this.restaurant._id);
    });
  }

  // Helper method to update favorite status from multiple sources
  private updateFavoriteStatus(): void {
    // Check both service state and localStorage for most accurate status
    const serviceStatus = this.favoritesService.isFavorite(this.restaurant._id);
    const localStorageStatus = this.favoritesService.isFavoriteInstant(this.restaurant._id);

    // Use service status if available, otherwise fall back to localStorage
    this.isFavorite = serviceStatus || localStorageStatus;
  }

  ngOnDestroy(): void {
    if (this.favoritesSubscription) {
      this.favoritesSubscription.unsubscribe();
    }
  } get restaurantId(): string {
    return this.restaurant._id || this.restaurant.id;
  }

  get restaurantName(): string {
    return this.restaurant.restaurantDetails?.name ||
      this.restaurant.name ||
      `${this.restaurant.firstName || ''} ${this.restaurant.lastName || ''}`.trim() ||
      'Restaurant';
  }

  get restaurantImageUrl(): string {
    return this.restaurant.image ||
      this.restaurant.logoUrl ||
      '/assets/images/default-restaurant.jpg';
  }

  get cuisineTypes(): string {
    return this.restaurant.restaurantDetails?.cuisineType?.join(', ') ||
      this.restaurant.cuisine ||
      this.restaurant.cuisineType ||
      'Restaurant';
  }

  get isOpen(): boolean {
    // Handle different data structures
    if (!this.restaurant.isOperational && this.restaurant.isOperational !== undefined) return false;

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const todayHours = this.restaurant.restaurantDetails?.openingHours?.[today];

    if (!todayHours) return true; // Default to open if no hours specified

    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    const openTime = parseInt(todayHours.open?.replace(':', '') || '0');
    const closeTime = parseInt(todayHours.close?.replace(':', '') || '2359');

    return todayHours.isOpen && currentTime >= openTime && currentTime <= closeTime;
  }

  get deliveryTimeText(): string {
    const time = this.restaurant.restaurantDetails?.averageDeliveryTime ||
      this.restaurant.deliveryTime ||
      this.restaurant.estimatedDeliveryTime ||
      30;
    return `${time} min`;
  }

  get deliveryFeeText(): string {
    const fee = this.restaurant.restaurantDetails?.deliveryFee ?? this.restaurant.deliveryFee;
    return fee > 0 ? `$${fee.toFixed(2)}` : 'Free';
  }

  get ratingText(): string {
    const rating = this.restaurant.ratings?.averageRating ||
      this.restaurant.rating ||
      this.restaurant.averageRating;
    return rating > 0 ? rating.toFixed(1) : 'New';
  }

  get reviewsText(): string {
    const count = this.restaurant.ratings?.totalReviews ||
      this.restaurant.reviewsCount ||
      this.restaurant.totalReviews ||
      0;
    return count > 0 ? `(${count})` : '';
  }

  get minimumOrderText(): string {
    const amount = this.restaurant.restaurantDetails?.minimumOrderAmount ||
      this.restaurant.minimumOrder ||
      this.restaurant.minimumOrderAmount;
    return amount ? `$${amount}` : '';
  }

  get fullAddress(): string {
    const addr = this.restaurant.address;
    if (addr) {
      return `${addr.street || ''}, ${addr.city || ''}, ${addr.state || ''}`.replace(/^,\s*|,\s*$/g, '');
    }
    return this.restaurant.location || this.restaurant.fullAddress || 'Address not available';
  }

  onImageError(event: any): void {
    event.target.src = '/assets/images/default-restaurant.jpg';
    event.target.alt = 'Default restaurant image';
  }

  onFavoriteClick(event: Event): void {
    event.stopPropagation();
    event.preventDefault();

    if (this.isProcessingFavorite) {
      return; // Prevent double-clicking
    }

    this.isProcessingFavorite = true;

    // Optimistic update for immediate visual feedback
    const previousState = this.isFavorite;
    this.isFavorite = !this.isFavorite;

    // Toggle favorite status via service with restaurant name for better toast messages
    this.favoritesService.toggleFavoriteWithName(this.restaurantId, this.restaurantName).subscribe({
      next: (response) => {
        this.isProcessingFavorite = false;
        // Emit the event for parent components that need to handle it
        this.favoriteToggle.emit(this.restaurant);

        // If operation failed, revert the optimistic update
        if (!response.success) {
          this.isFavorite = !this.isFavorite;
        }
      },
      error: (error) => {
        this.isProcessingFavorite = false;
        // Revert optimistic update on error
        this.isFavorite = previousState;
        // Error handling is now done in the favorites service with toasts
      }
    });
  }

  onQuickViewClick(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.quickView.emit(this.restaurant);
  }
}
