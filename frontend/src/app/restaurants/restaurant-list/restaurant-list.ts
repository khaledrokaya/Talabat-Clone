import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { RestaurantService, RestaurantFilter } from '../../shared/services/restaurant.service';
import { FavoritesService } from '../../shared/services/favorites.service';
import { Restaurant } from '../../shared/models/restaurant';
import { RestaurantCard } from '../restaurant-card/restaurant-card';

// Animation definitions
const fadeInUp = trigger('fadeInUp', [
  transition(':enter', [
    style({ transform: 'translateY(30px)', opacity: 0 }),
    animate('400ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
  ])
]);

const staggeredFadeIn = trigger('staggeredFadeIn', [
  transition(':enter', [
    style({ transform: 'translateY(20px)', opacity: 0 }),
    animate('{{ delay }}ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
  ], { params: { delay: 0 } })
]);

@Component({
  selector: 'app-restaurant-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, RestaurantCard],
  templateUrl: './restaurant-list.html',
  styleUrl: './restaurant-list.scss',
  animations: [fadeInUp, staggeredFadeIn]
})
export class RestaurantList implements OnInit {
  restaurants: Restaurant[] = [];
  loading = true;
  error: string | null = null;
  filter: RestaurantFilter = {};
  searchQuery: string = '';
  totalRestaurants = 0;
  currentPage = 1;
  showAdvancedFilters = false;

  // Enhanced categories with better cuisine mapping
  categories = [
    { name: 'All', value: '', icon: '🍽️', cuisine: '' },
    { name: 'Italian', value: 'italian', icon: '🍕', cuisine: 'Italian' },
    { name: 'American', value: 'american', icon: '🍔', cuisine: 'American' },
    { name: 'Asian', value: 'asian', icon: '🍜', cuisine: 'Asian' },
    { name: 'Mexican', value: 'mexican', icon: '🌮', cuisine: 'Mexican' },
    { name: 'Indian', value: 'indian', icon: '🍛', cuisine: 'Indian' },
    { name: 'Mediterranean', value: 'mediterranean', icon: '🥙', cuisine: 'Mediterranean' },
    { name: 'French', value: 'french', icon: '🥐', cuisine: 'French' },
    { name: 'Chinese', value: 'chinese', icon: '🥢', cuisine: 'Chinese' },
    { name: 'Japanese', value: 'japanese', icon: '🍣', cuisine: 'Japanese' },
    { name: 'Thai', value: 'thai', icon: '🍤', cuisine: 'Thai' }
  ];

  // Sort options
  sortOptions = [
    { label: 'Most Popular', value: 'rating', order: 'desc' },
    { label: 'Fastest Delivery', value: 'deliveryTime', order: 'asc' },
    { label: 'Lowest Delivery Fee', value: 'deliveryFee', order: 'asc' },
    { label: 'Name A-Z', value: 'name', order: 'asc' },
    { label: 'Name Z-A', value: 'name', order: 'desc' }
  ];

  // Rating filter options
  ratingOptions = [
    { label: 'All Ratings', value: 0 },
    { label: '4.5+ Stars', value: 4.5 },
    { label: '4.0+ Stars', value: 4.0 },
    { label: '3.5+ Stars', value: 3.5 },
    { label: '3.0+ Stars', value: 3.0 }
  ];

  constructor(
    private restaurantService: RestaurantService,
    private favoritesService: FavoritesService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Check for query parameters
    this.route.queryParams.subscribe(params => {
      if (params['search']) {
        this.searchQuery = params['search'];
        this.filter.cuisine = params['search'];
      }
      if (params['category']) {
        // Map category to cuisine for restaurant filtering
        const categoryToCuisine = this.mapCategoryToCuisine(params['category']);
        if (categoryToCuisine) {
          this.filter.cuisine = categoryToCuisine;
        }
      }
      if (params['cuisine']) {
        this.filter.cuisine = params['cuisine'];
      }
      if (params['minRating']) {
        this.filter.minRating = parseFloat(params['minRating']);
      }
      if (params['isOpen']) {
        this.filter.isOpen = params['isOpen'] === 'true';
      }
      if (params['sortBy']) {
        this.filter.sortBy = params['sortBy'];
        this.filter.sortOrder = params['sortOrder'] || 'asc';
      }
      this.loadRestaurants();
    });
  }

  loadRestaurants(): void {
    this.loading = true;
    this.error = null;

    // Apply search query to filter
    if (this.searchQuery.trim()) {
      this.filter.cuisine = this.searchQuery.trim();
    }

    this.restaurantService.getRestaurants(this.filter).subscribe({
      next: (response) => {
        console.log('Restaurant List API Response:', response);

        if (response && response.success && response.data) {
          this.restaurants = response.data.restaurants || [];
          this.totalRestaurants = response.data.pagination?.total || this.restaurants.length;
        } else {
          this.restaurants = [];
          this.totalRestaurants = 0;
        }

        this.loading = false;
        console.log('Loaded restaurants in list:', this.restaurants);
      },
      error: (error) => {
        console.error('Error loading restaurants:', error);
        this.error = 'Failed to load restaurants. Please try again.';
        this.loading = false;
        this.restaurants = [];
      }
    });
  }

  // Enhanced filter methods
  toggleAdvancedFilters(): void {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  applySorting(sortOption: any): void {
    this.filter.sortBy = sortOption.value;
    this.filter.sortOrder = sortOption.order;
    this.updateQueryParams();
    this.loadRestaurants();
  }

  applyRatingFilter(minRating: number): void {
    this.filter.minRating = minRating > 0 ? minRating : undefined;
    this.updateQueryParams();
    this.loadRestaurants();
  }

  toggleOpenStatus(): void {
    this.filter.isOpen = this.filter.isOpen === undefined ? true : undefined;
    this.updateQueryParams();
    this.loadRestaurants();
  }

  // Map category values to cuisine types for restaurant filtering
  mapCategoryToCuisine(category: string): string | null {
    const selectedCategory = this.categories.find(cat => cat.value === category);
    return selectedCategory?.cuisine || null;
  }

  applySearch(): void {
    this.updateQueryParams();
    this.loadRestaurants();
  }

  selectCategory(category: any): void {
    if (category.value === '') {
      // Clear cuisine filter for "All" category
      this.filter.cuisine = undefined;
    } else {
      // Use the cuisine mapping
      this.filter.cuisine = category.cuisine || undefined;
    }
    this.updateQueryParams();
    this.loadRestaurants();
  }

  clearFilters(): void {
    this.filter = {};
    this.searchQuery = '';
    this.showAdvancedFilters = false;
    this.router.navigate(['/restaurants']);
  }

  retryLoadRestaurants(): void {
    this.loadRestaurants();
  }

  updateQueryParams(): void {
    const queryParams: any = {};

    if (this.searchQuery.trim()) {
      queryParams.search = this.searchQuery.trim();
    }

    if (this.filter.cuisine) {
      queryParams.cuisine = this.filter.cuisine;
    }

    if (this.filter.minRating) {
      queryParams.minRating = this.filter.minRating;
    }

    if (this.filter.isOpen !== undefined) {
      queryParams.isOpen = this.filter.isOpen;
    }

    if (this.filter.sortBy) {
      queryParams.sortBy = this.filter.sortBy;
      queryParams.sortOrder = this.filter.sortOrder;
    }

    this.router.navigate(['/restaurants'], { queryParams });
  }

  // UI Helper methods
  getRestaurantImageUrl(restaurant: Restaurant): string | null {
    return restaurant.image || restaurant.logoUrl || null;
  }

  getRestaurantStatus(restaurant: Restaurant): string {
    return restaurant.isOpen ? 'Open' : 'Closed';
  }

  formatDeliveryTime(time: number | undefined): string {
    return time ? `${time} min` : 'N/A';
  }

  formatPrice(price: number | undefined): string {
    return price ? `$${price}` : 'Free';
  }

  onImageError(event: any): void {
    // Hide the image if it fails to load
    event.target.style.display = 'none';
  }

  // Animation helper
  getAnimationDelay(index: number): any {
    return { delay: index * 100 };
  }

  // Check if category is selected
  isCategorySelected(category: any): boolean {
    if (category.value === '' && !this.filter.cuisine) {
      return true;
    }
    return this.filter.cuisine === category.cuisine;
  }

  // Get current sort label
  getCurrentSortLabel(): string {
    const currentSort = this.sortOptions.find(option =>
      option.value === this.filter.sortBy && option.order === this.filter.sortOrder
    );
    return currentSort?.label || 'Sort by';
  }

  // Get current rating label
  getCurrentRatingLabel(): string {
    const currentRating = this.ratingOptions.find(option => option.value === this.filter.minRating);
    return currentRating?.label || 'All Ratings';
  }

  // Helper methods for restaurant card display (from home component)
  getRestaurantName(restaurant: any): string {
    return restaurant.restaurantDetails?.name ||
      `${restaurant.firstName || ''} ${restaurant.lastName || ''}`.trim() ||
      restaurant.name || 'Restaurant';
  }

  isRestaurantOpen(restaurant: any): boolean {
    if (!restaurant.isOperational && restaurant.isOperational !== undefined) return false;
    if (restaurant.isOpen !== undefined) return restaurant.isOpen;

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const todayHours = restaurant.restaurantDetails?.openingHours?.[today];

    if (!todayHours) return true; // Default to open if no hours specified

    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    const openTime = parseInt(todayHours.open?.replace(':', '') || '0');
    const closeTime = parseInt(todayHours.close?.replace(':', '') || '2359');

    return todayHours.isOpen && currentTime >= openTime && currentTime <= closeTime;
  }

  getCuisineTypes(restaurant: any): string {
    return restaurant.restaurantDetails?.cuisineType?.join(', ') ||
      restaurant.cuisine ||
      restaurant.cuisineType ||
      'Various Cuisines';
  }

  isVerified(restaurant: any): boolean {
    return restaurant.verificationStatus === 'verified' ||
      restaurant.isVerified === true;
  }

  hasRating(restaurant: any): boolean {
    const rating = restaurant.ratings?.averageRating || restaurant.rating || restaurant.averageRating;
    return rating && rating > 0;
  }

  getAverageRating(restaurant: any): number {
    return restaurant.ratings?.averageRating || restaurant.rating || restaurant.averageRating || 0;
  }

  hasDescription(restaurant: any): boolean {
    const description = restaurant.restaurantDetails?.description || restaurant.description;
    return description && description.trim().length > 0;
  }

  getDescription(restaurant: any): string {
    return restaurant.restaurantDetails?.description || restaurant.description || '';
  }

  getFullAddress(restaurant: any): string {
    const addr = restaurant.address;
    if (addr) {
      return `${addr.street || ''}, ${addr.city || ''}, ${addr.state || ''}`.replace(/^,\s*|,\s*$/g, '');
    }
    return restaurant.location || restaurant.fullAddress || 'Address not available';
  }

  getRatingText(restaurant: any): string {
    const rating = this.getAverageRating(restaurant);
    return rating > 0 ? rating.toFixed(1) : 'New';
  }

  getReviewsText(restaurant: any): string {
    const count = restaurant.ratings?.totalReviews || restaurant.reviewsCount || restaurant.totalReviews || 0;
    return count > 0 ? `(${count})` : '';
  }

  getDeliveryTime(restaurant: any): number {
    return restaurant.restaurantDetails?.averageDeliveryTime ||
      restaurant.deliveryTime ||
      restaurant.estimatedDeliveryTime ||
      30;
  }

  getDeliveryFee(restaurant: any): string {
    const fee = restaurant.restaurantDetails?.deliveryFee ?? restaurant.deliveryFee;
    return fee > 0 ? `$${fee.toFixed(2)}` : 'Free';
  }

  isFreeDelivery(restaurant: any): boolean {
    const fee = restaurant.restaurantDetails?.deliveryFee ?? restaurant.deliveryFee;
    return fee === 0;
  }

  getMinimumOrder(restaurant: any): number {
    return restaurant.restaurantDetails?.minimumOrderAmount ||
      restaurant.minimumOrder ||
      restaurant.minimumOrderAmount ||
      0;
  }

  // Event handlers for card interactions
  onFavoriteClick(event: Event, restaurant: any): void {
    event.stopPropagation();
    event.preventDefault();
    console.log('Toggle favorite for:', restaurant);
    // Implement favorite functionality
  }

  onQuickViewClick(event: Event, restaurant: any): void {
    event.stopPropagation();
    event.preventDefault();
    console.log('Quick view for:', restaurant);
    // Implement quick view functionality
  }

  // Track by function for ngFor performance
  trackByRestaurant(index: number, restaurant: any): string {
    return restaurant._id || restaurant.id;
  }

  // Favorites functionality
  onFavoriteToggle(restaurant: any): void {
    const restaurantId = restaurant._id || restaurant.id;
    if (!restaurantId) {
      console.error('Restaurant ID not found');
      return;
    }

    this.favoritesService.toggleFavorite(restaurantId).subscribe({
      next: (response) => {
        console.log('Favorite toggled successfully:', response.message);
        // Optionally show success message to user
      },
      error: (error) => {
        console.error('Error toggling favorite:', error);
        // Handle error - show error message to user
        if (error.status === 401) {
          console.log('User needs to login to add favorites');
          // Redirect to login or show login modal
        } else if (error.status === 403) {
          console.log('Only customers can add favorites');
        }
      }
    });
  }

  // Quick view functionality
  onQuickView(restaurant: any): void {
    console.log('Quick view for restaurant:', restaurant);
    // Implement quick view modal or navigate to restaurant details
    // For now, navigate to restaurant details page
    const restaurantId = restaurant._id || restaurant.id;
    if (restaurantId) {
      this.router.navigate(['/restaurants', restaurantId]);
    }
  }
}

