import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import {
  RestaurantMealService,
  Meal,
  MealFilters,
  MealCategory,
  ApiResponse,
  MealsListResponse
} from '../../shared/services/restaurant-meal.service';
import { RateLimiterService } from '../../shared/services/rate-limiter.service';
import { ToastService } from '../../shared/services/toast.service';
import { DebounceService } from '../../shared/services/debounce.service';

@Component({
  selector: 'app-meals-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './meals-management.component.html',
  styleUrl: './meals-management.component.scss'
})
export class MealsManagementComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  meals: Meal[] = [];
  categories: MealCategory[] = [];
  loading = false;
  pagination: any = null;

  filterForm!: FormGroup;

  currentFilters: MealFilters = {
    page: 1,
    limit: 12,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    includeUnavailable: true // Include unavailable meals for restaurant management
  };

  mealStats = {
    totalMeals: 0,
    availableMeals: 0,
    unavailableMeals: 0,
    averagePrice: 0
  };

  constructor(
    private mealService: RestaurantMealService,
    private fb: FormBuilder,
    private router: Router,
    private toastService: ToastService,
    private rateLimiter: RateLimiterService,
    private debounceService: DebounceService
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    this.setupFormSubscriptions();
    this.loadMeals();
    this.loadCategories();
    this.loadMealStats();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();

    // Clean up debounce service
    this.debounceService.complete('meals-filters');
  }

  private initializeForm() {
    this.filterForm = this.fb.group({
      category: [''],
      isAvailable: [''],
      search: [''],
      priceMin: [''],
      priceMax: [''],
      sortBy: ['createdAt'],
      sortOrder: ['desc']
    });
  }

  private setupFormSubscriptions() {
    // Use debounce service for form changes
    const { input$, output$ } = this.debounceService.createDebouncedObservable<any>(
      'meals-filters',
      800, // Increased debounce time to reduce API calls
      false
    );

    // Subscribe to form changes and emit to debounce service
    this.filterForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(filters => {
        input$.next(filters);
      });

    // Subscribe to debounced output
    output$
      .pipe(takeUntil(this.destroy$))
      .subscribe(filters => {
        this.currentFilters = {
          ...this.currentFilters,
          ...filters,
          page: 1 // Reset to first page when filters change
        };
        this.loadMeals();
      });
  }

  loadMeals() {
    this.loading = true;

    // Use rate limiter with caching
    const cacheKey = `meals-${JSON.stringify(this.currentFilters)}`;

    this.rateLimiter.executeRequest(
      () => this.mealService.getMeals(this.currentFilters),
      cacheKey,
      {
        cacheDuration: 60000, // Cache for 1 minute
        rateLimit: true
      }
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            // Handle both response formats
            if (Array.isArray(response.data)) {
              // Direct array format: { success: true, data: [...] }
              this.meals = response.data;
              this.pagination = {
                page: this.currentFilters.page || 1,
                limit: this.currentFilters.limit || 12,
                total: response.data.length,
                pages: Math.ceil(response.data.length / (this.currentFilters.limit || 12))
              };
            } else if (response.data && response.data.meals) {
              // Nested format: { success: true, data: { meals: [...], pagination: {...} } }
              this.meals = response.data.meals;
              this.pagination = response.data.pagination;
            } else {
              this.meals = [];
              this.pagination = null;
            }
          } else {
            this.meals = [];
          }
          this.loading = false;
        },
        error: (error) => {
          if (error.message.includes('Rate limit exceeded')) {
            this.toastService.error('Too many requests. Please wait a moment before trying again.');
          } else {
          }
          this.meals = [];
          this.loading = false;
        }
      });
  }

  loadCategories() {
    // Use rate limiter with longer cache duration for categories (they change rarely)
    this.rateLimiter.executeRequest(
      () => this.mealService.getCategories(),
      'meal-categories',
      {
        cacheDuration: 300000, // Cache for 5 minutes
        rateLimit: true
      }
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.categories = response.data;
          }
        },
        error: (error) => {
        }
      });
  }

  loadMealStats() {
    // Use rate limiter with caching for stats
    this.rateLimiter.executeRequest(
      () => this.mealService.getMealsStats(),
      'meal-stats',
      {
        cacheDuration: 120000, // Cache for 2 minutes
        rateLimit: true
      }
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.mealStats = response.data;
          }
        },
        error: (error) => {
        }
      });
  }

  refreshData() {
    // Clear cache and reload
    this.rateLimiter.clearCache('meal-categories');
    this.rateLimiter.clearCache('meal-stats');
    this.rateLimiter.clearCache(); // Clear all meals cache

    this.loadMeals();
    this.loadCategories();
    this.loadMealStats();
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.pagination.pages) {
      this.currentFilters.page = page;
      this.loadMeals();
    }
  }

  getPageNumbers(): number[] {
    if (!this.pagination) return [];

    const pages: number[] = [];
    const maxVisible = 5;
    const current = this.pagination.page;
    const total = this.pagination.pages;

    let start = Math.max(1, current - Math.floor(maxVisible / 2));
    let end = Math.min(total, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  // Navigation methods
  navigateToAddMeal() {
    this.router.navigate(['/restaurant-dashboard/meals-management/add']);
  }

  navigateToEditMeal(meal: Meal) {
    const mealId = (meal as any)._id || meal.id;
    this.router.navigate(['/restaurant-dashboard/meals-management/edit', mealId]);
  }

  deleteMeal(meal: Meal) {
    const mealId = (meal as any)._id || meal.id;
    if (confirm(`Are you sure you want to delete "${meal.name}"?`)) {
      this.mealService.deleteMeal(mealId!)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.loadMeals();
              this.loadMealStats();
              this.toastService.error('Meal deleted successfully!');
            }
          },
          error: (error) => {
            this.toastService.error('Error deleting meal. Please try again.');
          }
        });
    }
  }

  toggleMealAvailability(meal: Meal) {
    const mealId = (meal as any)._id || meal.id;
    const newAvailability = !meal.isAvailable;

    this.mealService.toggleMealAvailability(mealId!, newAvailability)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            meal.isAvailable = newAvailability;
            this.loadMealStats();
          }
        },
        error: (error) => {
          this.toastService.error('Error updating meal availability.');
        }
      });
  }

  // Discount utility methods
  hasActiveDiscount(meal: Meal): boolean {
    return !!(meal.discount && meal.discount.percentage > 0 &&
      new Date(meal.discount.validUntil) > new Date());
  }

  getActiveDiscount(meal: Meal): any {
    if (!this.hasActiveDiscount(meal)) return null;
    return meal.discount;
  }

  getDiscountedPrice(meal: Meal): number {
    const activeDiscount = this.getActiveDiscount(meal);
    if (!activeDiscount) return meal.price;

    return meal.price * (1 - activeDiscount.percentage / 100);
  }

  // Utility methods
  formatPrice(price: number): string {
    return this.mealService.formatPrice(price);
  }

  getCategoryColor(category: string): string {
    return this.mealService.getCategoryColor(category);
  }

  getAvailabilityText(isAvailable: boolean): string {
    return this.mealService.getAvailabilityText(isAvailable);
  }

  getAvailabilityColor(isAvailable: boolean): string {
    return this.mealService.getAvailabilityColor(isAvailable);
  }

  min(a: number, b: number): number {
    return Math.min(a, b);
  }
}
