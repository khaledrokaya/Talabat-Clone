import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RestaurantService } from '../../shared/services/restaurant.service';
import { CartService, CartItem } from '../../shared/services/cart.service';
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
export class RestaurantDetails implements OnInit {
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
    private cartService: CartService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const restaurantId = params.get('id');
      if (restaurantId) {
        console.log('Restaurant ID from route:', restaurantId);
        // Test API connectivity first
        this.testApiConnectivity();
        this.loadRestaurantDetails(restaurantId);
      } else {
        this.errorMessage = 'No restaurant ID provided';
        this.loading = false;
      }
    });
  }

  testApiConnectivity(): void {
    console.log('Testing API connectivity...');
    console.log('Base API URL:', environment.apiUrl);

    // Test if we can reach the restaurants endpoint
    this.restaurantService.getRestaurants({ limit: 1 })
      .pipe(
        timeout(10000),
        catchError(error => {
          console.error('API connectivity test failed:', error);
          return of(null);
        })
      )
      .subscribe({
        next: (response) => {
          if (response) {
            console.log('✅ API connectivity test successful');
            console.log('Available restaurants count:', response.data?.restaurants?.length || 0);
          } else {
            console.log('❌ API connectivity test failed');
          }
        },
        error: (error) => {
          console.error('❌ API connectivity test error:', error);
        }
      });
  }

  loadRestaurantDetails(id: string): void {
    console.log('Loading restaurant details for ID:', id);
    console.log('API endpoint will be:', `${environment.apiUrl}/restaurants/${id}`);
    this.loading = true;
    this.errorMessage = '';

    // Add timeout and retry logic
    this.restaurantService.getRestaurantById(id)
      .pipe(
        timeout(15000), // 15 second timeout
        catchError(error => {
          console.error('API call failed:', error);
          return of(null); // Return null on error
        })
      )
      .subscribe({
        next: (response) => {
          console.log('Restaurant API Response:', response);

          if (!response) {
            this.errorMessage = 'Failed to load restaurant details. Please try again.';
            this.loading = false;
            return;
          }

          console.log('Response type:', typeof response);
          console.log('Response structure:', Object.keys(response || {}));

          // Handle your API response format: { success: true, data: { restaurantDetails: {...}, ... } }
          if (response && response.success && response.data) {
            this.restaurant = response.data;
            this.meals = this.restaurant.menu || [];
            console.log('Restaurant loaded:', this.restaurant);
            this.groupMealsByCategory();
            this.loading = false;
          } else {
            console.error('Invalid response structure:', response);
            console.error('Expected format: { success: boolean, data: { restaurantDetails: any, ... } }');
            this.errorMessage = 'Failed to load restaurant details - Invalid response format.';
            this.loading = false;
          }
        },
        error: (error) => {
          console.error('Error loading restaurant details:', error);
          console.error('Error status:', error.status);
          console.error('Error message:', error.message);
          console.error('Error details:', error.error);

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

    console.log('Menu categories:', this.menuCategories);
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
    console.log('Added to cart:', cartItem);
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
    return !!(meal.discount && meal.discount.percentage > 0);
  }

  trackByMeal(index: number, meal: Meal): string {
    return meal._id || index.toString();
  }

  onImageError(event: any): void {
    event.target.src = 'assets/images/default-restaurant.jpg';
  }

  onMealImageError(event: any): void {
    event.target.src = 'assets/images/default-meal.jpg';
  }
}
