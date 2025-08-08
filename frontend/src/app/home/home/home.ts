import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { trigger, state, style, transition, animate, stagger, query } from '@angular/animations';
import { AuthService } from '../../shared/services/auth.service';
import { RestaurantService } from '../../shared/services/restaurant.service';
import { Restaurant } from '../../shared/models/restaurant';
import { Meal } from '../../shared/models/meal';
import { User } from '../../shared/models/user';
import { RestaurantCard, Restaurant as CardRestaurant } from '../../restaurants/restaurant-card/restaurant-card';

// Animation definitions
const slideInLeft = trigger('slideInLeft', [
  transition(':enter', [
    style({ transform: 'translateX(-100%)', opacity: 0 }),
    animate('600ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
  ])
]);

const slideInRight = trigger('slideInRight', [
  transition(':enter', [
    style({ transform: 'translateX(100%)', opacity: 0 }),
    animate('600ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
  ])
]);

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

const staggeredSlideIn = trigger('staggeredSlideIn', [
  transition(':enter', [
    style({ transform: 'translateY(30px)', opacity: 0 }),
    animate('{{ delay }}ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
  ], { params: { delay: 0 } })
]);

const pulse = trigger('pulse', [
  state('in', style({ transform: 'scale(1)' })),
  transition('void => *', [
    style({ transform: 'scale(0.8)', opacity: 0 }),
    animate('400ms ease-out', style({ transform: 'scale(1)', opacity: 1 }))
  ])
]);

const scaleIn = trigger('scaleIn', [
  transition(':enter', [
    style({ transform: 'scale(0.8)', opacity: 0 }),
    animate('300ms ease-out', style({ transform: 'scale(1)', opacity: 1 }))
  ])
]);

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule, FormsModule, RestaurantCard],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  animations: [
    slideInLeft,
    slideInRight,
    fadeInUp,
    staggeredFadeIn,
    staggeredSlideIn,
    pulse,
    scaleIn
  ]
})
export class Home implements OnInit {
  restaurants: Restaurant[] = [];
  featuredRestaurants: Restaurant[] = [];
  featuredMeals: Meal[] = [];
  topRatedRestaurants: Restaurant[] = [];
  loading = true;
  mealsLoading = false;
  error: string | null = null;
  currentUser: User | null = null;
  searchQuery: string = '';
  selectedCategory: string = '';
  totalRestaurants: number = 0;

  // Category data based on API meal categories
  categories = [
    { name: 'Pizza', value: 'pizza', icon: '🍕', count: 0 },
    { name: 'Burgers', value: 'sandwich', icon: '🍔', count: 0 },
    { name: 'Asian', value: 'main_course', icon: '🍜', count: 0 },
    { name: 'Desserts', value: 'dessert', icon: '🍰', count: 0 },
    { name: 'Beverages', value: 'beverage', icon: '🥤', count: 0 },
    { name: 'Seafood', value: 'seafood', icon: '🦐', count: 0 },
    { name: 'Vegetarian', value: 'vegetarian', icon: '🥗', count: 0 },
    { name: 'Meat', value: 'meat', icon: '🥩', count: 0 }
  ];

  constructor(
    private restaurantService: RestaurantService,
    public authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadRestaurants();
    this.loadFeaturedMeals();
    this.loadTopRatedRestaurants();
    this.subscribeToAuthChanges();
  }

  private subscribeToAuthChanges(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  loadRestaurants(): void {
    this.loading = true;
    this.error = null;

    this.restaurantService.getRestaurants({ limit: 6 }).subscribe({
      next: (response) => {
        console.log('Restaurant API Response:', response);
        if (response.success && response.data) {
          this.restaurants = response.data.restaurants || [];
          this.totalRestaurants = response.data.pagination?.total || this.restaurants.length;
          this.featuredRestaurants = this.restaurants.slice(0, 6);
          this.updateCategoryCounts();
        } else {
          this.restaurants = [];
          this.totalRestaurants = 0;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading restaurants:', error);
        this.error = 'Failed to load restaurants. Please try again.';
        this.loading = false;
        this.restaurants = [];
      }
    });
  }

  loadFeaturedMeals(): void {
    this.mealsLoading = true;
    this.restaurantService.getFeaturedMeals({ limit: 8 }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.featuredMeals = response.data.meals || [];
        }
        this.mealsLoading = false;
      },
      error: (error) => {
        console.error('Error loading featured meals:', error);
        this.mealsLoading = false;
      }
    });
  }

  loadTopRatedRestaurants(): void {
    this.restaurantService.getTopRatedRestaurants({ limit: 4 }).subscribe({
      next: (response) => {
        console.log('Top-rated restaurants API response:', response);
        if (response.success && response.data) {
          // Handle both possible response structures
          this.topRatedRestaurants = Array.isArray(response.data)
            ? response.data
            : (response.data.restaurants || []);
          console.log('Top-rated restaurants loaded:', this.topRatedRestaurants);
        }
      },
      error: (error) => {
        console.error('Error loading top-rated restaurants:', error);
        this.topRatedRestaurants = [];
      }
    });
  } searchRestaurants(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/restaurants'], {
        queryParams: { search: this.searchQuery.trim() }
      });
    }
  }

  // Updated for new API structure
  onSearch(): void {
    this.searchRestaurants();
  }

  // Updated category filtering for new API
  onCategoryClick(category: any): void {
    this.router.navigate(['/restaurants'], {
      queryParams: {
        category: category.value,
        cuisine: category.name
      }
    });
  }

  filterByCategory(categoryKeyword: string): void {
    this.selectedCategory = this.selectedCategory === categoryKeyword ? '' : categoryKeyword;
    this.router.navigate(['/restaurants'], {
      queryParams: { category: categoryKeyword }
    });
  }

  onImageError(event: any): void {
    // Hide the image if it fails to load
    event.target.style.display = 'none';
  }

  private updateCategoryCounts(): void {
    this.categories.forEach(category => {
      category.count = this.restaurants.filter(restaurant =>
        restaurant.cuisine?.toLowerCase().includes(category.name.toLowerCase())
      ).length;
    });
  } getRoleDisplayName(): string {
    switch (this.currentUser?.role) {
      case 'admin': return 'System Administrator';
      case 'customer': return 'Customer';
      case 'restaurant_owner': return 'Restaurant Owner';
      case 'delivery': return 'Delivery Driver';
      default: return 'User';
    }
  }

  getRoleBadgeClass(): string {
    return this.currentUser?.role || 'customer';
  }

  // Animation delay calculation
  getAnimationDelay(index: number): any {
    return { delay: index * 100 };
  }

  // Retry loading restaurants
  retryLoadRestaurants(): void {
    this.loadRestaurants();
  }

  // Handle favorite toggle from restaurant card
  onFavoriteToggle(restaurant: CardRestaurant): void {
    console.log('Favorite toggled for restaurant:', restaurant.restaurantDetails?.name);
    // The restaurant-card component handles the actual favorite toggle logic
  }

  // Handle quick view from restaurant card
  onQuickView(restaurant: CardRestaurant): void {
    console.log('Quick view for restaurant:', restaurant.restaurantDetails?.name);
    // TODO: Implement quick view modal or navigate to restaurant details
    this.router.navigate(['/restaurants', restaurant._id]);
  }

  // Helper methods for restaurant data extraction
  getRestaurantName(restaurant: any): string {
    return restaurant.restaurantDetails?.name || `${restaurant.firstName} ${restaurant.lastName}`;
  }

  getCuisineTypes(restaurant: any): string {
    return restaurant.restaurantDetails?.cuisineType?.join(', ') || 'Restaurant';
  }

  isRestaurantOpen(restaurant: any): boolean {
    if (!restaurant.isOperational) return false;

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const todayHours = restaurant.restaurantDetails?.openingHours?.[today];

    if (!todayHours) return false;

    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    const openTime = parseInt(todayHours.open.replace(':', ''));
    const closeTime = parseInt(todayHours.close.replace(':', ''));

    return todayHours.isOpen && currentTime >= openTime && currentTime <= closeTime;
  }

  getFullAddress(restaurant: any): string {
    const addr = restaurant.address;
    return `${addr?.street}, ${addr?.city}, ${addr?.state}`;
  }

  getRatingText(restaurant: any): string {
    const rating = restaurant.ratings?.averageRating;
    return rating > 0 ? rating.toFixed(1) : 'New';
  }

  getReviewsText(restaurant: any): string {
    const count = restaurant.ratings?.totalReviews || 0;
    return count > 0 ? `(${count})` : '';
  }

  getDeliveryTime(restaurant: any): number {
    return restaurant.restaurantDetails?.averageDeliveryTime || 30;
  }

  getDeliveryFee(restaurant: any): string {
    const fee = restaurant.restaurantDetails?.deliveryFee;
    return fee ? `$${fee.toFixed(2)}` : 'Free';
  }

  onFavoriteClick(event: Event, restaurant: any): void {
    event.stopPropagation();
    event.preventDefault();
    console.log('Favorite clicked for:', this.getRestaurantName(restaurant));
    // TODO: Implement favorite functionality
  }

  onQuickViewClick(event: Event, restaurant: any): void {
    event.stopPropagation();
    event.preventDefault();
    console.log('Quick view clicked for:', this.getRestaurantName(restaurant));
    // TODO: Implement quick view modal
    this.router.navigate(['/restaurants', restaurant._id]);
  }

  isVerified(restaurant: any): boolean {
    return (restaurant as any).verificationStatus === 'verified';
  }

  hasRating(restaurant: any): boolean {
    return (restaurant as any).ratings && (restaurant as any).ratings.averageRating > 0;
  }

  getAverageRating(restaurant: any): number {
    return (restaurant as any).ratings?.averageRating || 0;
  }

  hasDescription(restaurant: any): boolean {
    return (restaurant as any).restaurantDetails?.description;
  }

  getDescription(restaurant: any): string {
    return (restaurant as any).restaurantDetails?.description || '';
  }

  getMinimumOrder(restaurant: any): number {
    return (restaurant as any).restaurantDetails?.minimumOrderAmount || 0;
  }

  isFreeDelivery(restaurant: any): boolean {
    return (restaurant as any).restaurantDetails?.deliveryFee === 0;
  }

  getReviewsCount(restaurant: any): number {
    return restaurant.ratings?.totalReviews ||
      restaurant.totalReviews ||
      restaurant.reviewsCount ||
      0;
  }

  // Calculate average delivery time from all restaurants
  getAverageDeliveryTime(): number {
    if (this.restaurants.length === 0) return 30;

    const totalTime = this.restaurants.reduce((sum, restaurant) => {
      return sum + ((restaurant as any).restaurantDetails?.averageDeliveryTime || 30);
    }, 0);

    return Math.round(totalTime / this.restaurants.length);
  }

  // Calculate overall average rating
  getOverallAverageRating(): string {
    if (this.restaurants.length === 0) return '4.8';

    const restaurants = this.restaurants.filter(r => (r as any).ratings?.averageRating > 0);
    if (restaurants.length === 0) return '4.8';

    const totalRating = restaurants.reduce((sum, restaurant) => {
      return sum + ((restaurant as any).ratings?.averageRating || 0);
    }, 0);

    return (totalRating / restaurants.length).toFixed(1);
  }
}

