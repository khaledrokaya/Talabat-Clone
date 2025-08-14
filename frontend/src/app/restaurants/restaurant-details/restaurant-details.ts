import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { RestaurantService } from '../../shared/services/restaurant.service';
import { CartService, CartItem } from '../../shared/services/cart.service';
import { RateLimiterService } from '../../shared/services/rate-limiter.service';
import { Restaurant, Meal } from '../../shared/models/restaurant';
import { environment } from '../../../environments/environment';
import { timeout, catchError, of } from 'rxjs';

@Component({
  selector: 'app-restaurant-details',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './restaurant-details.html',
  styleUrl: './restaurant-details.scss'
})
export class RestaurantDetails implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  restaurant: any | null = null;
  meals: Meal[] = [];
  menuCategories: any[] = [];
  selectedCategory: string = '';
  loading = true;
  errorMessage = '';

  // Available meal categories (matching API enum)
  availableCategories = [
    { value: '', label: 'All Items', icon: '🍽️' },
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

  constructor(
    private route: ActivatedRoute,
    private restaurantService: RestaurantService,
    private cartService: CartService,
    private rateLimiter: RateLimiterService
  ) { }

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const restaurantId = params.get('id');
        if (restaurantId) {
          // Test API connectivity first
          this.testApiConnectivity();
          this.loadRestaurantDetails(restaurantId);
        } else {
          this.errorMessage = 'No restaurant ID provided';
          this.loading = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  testApiConnectivity(): void {

    // Test if we can reach the restaurants endpoint with rate limiting
    this.rateLimiter.executeRequest(
      () => this.restaurantService.getRestaurants({ limit: 1 }).pipe(
        timeout(10000),
        catchError(error => {
          return of(null);
        })
      ),
      'api-connectivity-test',
      {
        cacheDuration: 60000, // Cache for 1 minute
        rateLimit: true
      }
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response) {
          } else {
          }
        },
        error: (error) => {
        }
      });
  }

  loadRestaurantDetails(id: string): void {
    this.loading = true;
    this.errorMessage = '';

    // Use rate limiter with caching
    const cacheKey = `restaurant-details-${id}`;

    // Fetch restaurant details with rate limiting and caching
    this.rateLimiter.executeRequest(
      () => this.restaurantService.getRestaurantById(id).pipe(
        timeout(15000), // 15 second timeout
        catchError(error => {
          return of(null); // Return null on error
        })
      ),
      cacheKey,
      {
        cacheDuration: 300000, // Cache for 5 minutes (restaurant details change rarely)
        rateLimit: true
      }
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {

          if (!response) {
            this.errorMessage = 'Failed to load restaurant details. Please try again.';
            this.loading = false;
            return;
          }


          // Handle your API response format: { success: true, data: { restaurantDetails: {...}, ... } }
          if (response && response.success && response.data) {
            this.restaurant = response.data;
            this.meals = this.restaurant.menu || [];
            this.groupMealsByCategory();
            this.loading = false;
          } else {
            this.errorMessage = 'Failed to load restaurant details - Invalid response format.';
            this.loading = false;
          }
        },
        error: (error) => {

          if (error.name === 'TimeoutError') {
            this.errorMessage = 'Request timed out. Please check your connection and try again.';
          } else if (error.status === 0) {
            this.errorMessage = 'Network error - Unable to connect to server. Please check your internet connection.';
          } else if (error.status === 404) {
            this.errorMessage = 'Restaurant not found.';
          } else if (error.status >= 500) {
            this.errorMessage = 'Server error. Please try again later.';
          } else {
            this.errorMessage = `Failed to load restaurant details. Error: ${error.status || 'Unknown error'}`;
          }
          this.loading = false;
        }
      });
  }

  groupMealsByCategory(): void {
    const categories = new Set<string>();
    this.meals.forEach(meal => {
      if (meal.category) {
        categories.add(meal.category);
      }
    });

    this.menuCategories = Array.from(categories).map(category => {
      const categoryInfo = this.availableCategories.find(cat => cat.value === category);
      return {
        value: category,
        label: categoryInfo?.label || category,
        icon: categoryInfo?.icon || '🍽️',
        meals: this.meals.filter(meal => meal.category === category)
      };
    });

  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
  }

  getFilteredMeals(): Meal[] {
    if (!this.selectedCategory) {
      return this.meals;
    }
    return this.meals.filter(meal => meal.category === this.selectedCategory);
  }

  retryLoad(): void {
    const restaurantId = this.route.snapshot.paramMap.get('id');
    if (restaurantId) {
      this.loadRestaurantDetails(restaurantId);
    }
  }

  addToCart(meal: Meal): void {
    if (!meal.isAvailable || !this.isRestaurantOpen()) {
      return;
    }

    const cartItem: CartItem = {
      id: meal._id,
      productId: meal._id,
      productName: meal.name,
      quantity: 1,
      unitPrice: this.getMealPrice(meal),
      totalPrice: this.getMealPrice(meal),
      restaurantId: this.restaurant?._id || '',
      restaurantName: this.getRestaurantName()
    };

    this.cartService.addToCart(cartItem);
  }

  // Cart management methods
  getCartQuantity(mealId: string): number {
    const cartItem = this.cartService.currentCart.items.find(item => item.productId === mealId);
    return cartItem ? cartItem.quantity : 0;
  }

  isInCart(mealId: string): boolean {
    return this.getCartQuantity(mealId) > 0;
  }

  increaseQuantity(meal: Meal): void {
    if (!meal.isAvailable || !this.isRestaurantOpen()) {
      return;
    }

    const currentQuantity = this.getCartQuantity(meal._id);
    if (currentQuantity > 0) {
      this.cartService.updateQuantity(meal._id, currentQuantity + 1);
    } else {
      this.addToCart(meal);
    }
  }

  decreaseQuantity(meal: Meal): void {
    const currentQuantity = this.getCartQuantity(meal._id);
    if (currentQuantity > 0) {
      this.cartService.updateQuantity(meal._id, currentQuantity - 1);
    }
  }

  removeFromCart(mealId: string): void {
    this.cartService.removeFromCart(mealId);
  }

  // Helper methods for template
  getRestaurantName(): string {
    return this.restaurant?.restaurantDetails?.name || this.restaurant?.name || 'Unknown Restaurant';
  }

  getRestaurantDescription(): string {
    return this.restaurant?.restaurantDetails?.description || this.restaurant?.description || '';
  }

  getCuisineTypes(): string[] {
    return this.restaurant?.restaurantDetails?.cuisineType || this.restaurant?.cuisineType || [];
  }

  getAverageRating(): number {
    return this.restaurant?.ratings?.averageRating || this.restaurant?.averageRating || 0;
  }

  getTotalReviews(): number {
    return this.restaurant?.ratings?.totalReviews || this.restaurant?.totalReviews || 0;
  }

  getDeliveryTime(): number {
    return this.restaurant?.restaurantDetails?.averageDeliveryTime || this.restaurant?.deliveryTime || 30;
  }

  getDeliveryFee(): number {
    return this.restaurant?.restaurantDetails?.deliveryFee || this.restaurant?.deliveryFee || 0;
  }

  getMinimumOrder(): number {
    return this.restaurant?.restaurantDetails?.minimumOrderAmount || this.restaurant?.minimumOrder || 0;
  }

  isRestaurantOpen(): boolean {
    return this.restaurant?.isOperational !== false && this.restaurant?.isOpen !== false;
  }

  getMealImage(meal: Meal): string {
    return meal.image || 'assets/images/default-meal.jpg';
  }

  getMealPrice(meal: Meal): number {
    if (this.hasMealDiscount(meal)) {
      const originalPrice = meal.price;
      const discountPercentage = meal.discount?.percentage || 0;
      return originalPrice * (1 - discountPercentage / 100);
    }
    return meal.price;
  }

  getMealOriginalPrice(meal: Meal): number {
    return meal.price;
  }

  hasMealDiscount(meal: Meal): boolean {
    return !!(meal.discount && meal.discount.percentage > 0 &&
      new Date(meal.discount.validUntil) > new Date());
  } trackByMeal(index: number, meal: Meal): string {
    return meal._id || index.toString();
  }

  onImageError(event: any): void {
    event.target.src = 'assets/images/default-restaurant.jpg';
  }

  onMealImageError(event: any): void {
    event.target.src = 'assets/images/default-meal.jpg';
  }
}
