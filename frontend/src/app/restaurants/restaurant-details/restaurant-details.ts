import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { RestaurantService } from '../../shared/services/restaurant.service';
import { CartService, CartItem } from '../../shared/services/cart.service';
import { ToastService } from '../../shared/services/toast.service';
import { AuthService } from '../../shared/services/auth.service';
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
    private toastService: ToastService,
    private authService: AuthService,
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
      this.toastService.warning('This item is currently unavailable', 'Item Unavailable');
      return;
    }

    if (!this.authService.isLoggedIn()) {
      this.toastService.warning('Please log in to add items to cart', 'Login Required');
      return;
    }

    const cartItem: Omit<CartItem, 'id' | 'totalPrice'> = {
      mealId: meal._id,
      mealName: meal.name,
      quantity: 1,
      price: this.getMealPrice(meal),
      restaurantId: this.restaurant?._id || '',
      restaurantName: this.getRestaurantName()
    };

    this.cartService.addToCart(cartItem).subscribe({
      next: (success) => {
        if (success) {
          this.toastService.success(`${meal.name} added to cart`, 'Added to Cart');
        } else {
          this.toastService.error('Failed to add item to cart', 'Error');
        }
      },
      error: (error) => {
        console.error('Failed to add item to cart:', error);
        this.toastService.error('Failed to add item to cart', 'Error');
      }
    });
  }

  // Cart management methods
  getCartQuantity(mealId: string): number {
    const cartItem = this.cartService.currentCart.items.find(item => item.mealId === mealId);
    return cartItem ? cartItem.quantity : 0;
  }

  isInCart(mealId: string): boolean {
    return this.getCartQuantity(mealId) > 0;
  }

  increaseQuantity(meal: Meal): void {
    if (!meal.isAvailable || !this.isRestaurantOpen()) {
      this.toastService.warning('This item is currently unavailable', 'Item Unavailable');
      return;
    }

    if (!this.authService.isLoggedIn()) {
      this.toastService.warning('Please log in to modify cart items', 'Login Required');
      return;
    }

    const currentQuantity = this.getCartQuantity(meal._id);
    if (currentQuantity > 0) {
      this.cartService.updateQuantity(meal._id, currentQuantity + 1).subscribe({
        next: (success) => {
          if (success) {
            this.toastService.info(`${meal.name} quantity updated`, 'Cart Updated');
          } else {
            this.toastService.error('Failed to update quantity', 'Error');
          }
        },
        error: (error) => {
          console.error('Failed to update quantity:', error);
          this.toastService.error('Failed to update quantity', 'Error');
        }
      });
    } else {
      this.addToCart(meal);
    }
  }

  decreaseQuantity(meal: Meal): void {
    if (!this.authService.isLoggedIn()) {
      this.toastService.warning('Please log in to modify cart items', 'Login Required');
      return;
    }

    const currentQuantity = this.getCartQuantity(meal._id);
    if (currentQuantity > 1) {
      this.cartService.updateQuantity(meal._id, currentQuantity - 1).subscribe({
        next: (success) => {
          if (success) {
            this.toastService.info(`${meal.name} quantity updated`, 'Cart Updated');
          } else {
            this.toastService.error('Failed to update quantity', 'Error');
          }
        },
        error: (error) => {
          console.error('Failed to update quantity:', error);
          this.toastService.error('Failed to update quantity', 'Error');
        }
      });
    } else if (currentQuantity === 1) {
      this.removeFromCart(meal._id);
    }
  }

  removeFromCart(mealId: string): void {
    if (!this.authService.isLoggedIn()) {
      this.toastService.warning('Please log in to modify cart items', 'Login Required');
      return;
    }

    this.cartService.removeFromCart(mealId).subscribe({
      next: (success) => {
        if (success) {
          this.toastService.showDeleteSuccess('Item');
        } else {
          this.toastService.error('Failed to remove item from cart', 'Error');
        }
      },
      error: (error) => {
        console.error('Failed to remove item from cart:', error);
        this.toastService.error('Failed to remove item from cart', 'Error');
      }
    });
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
