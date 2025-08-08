import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import {
  RestaurantMealService,
  Meal,
  MealFilters,
  CreateMealRequest,
  UpdateMealRequest,
  MealCategory,
  ApiResponse,
  MealsListResponse
} from '../../shared/services/restaurant-meal.service';

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
  mealForm!: FormGroup;

  currentFilters: MealFilters = {
    page: 1,
    limit: 12,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  };

  mealStats = {
    totalMeals: 0,
    availableMeals: 0,
    unavailableMeals: 0,
    averagePrice: 0
  };

  selectedMeal: Meal | null = null;
  showMealModal = false;
  isEditMode = false;
  selectedImage: File | null = null;
  imagePreview: string | null = null;
  submittingMeal = false; // Add loading state for form submission

  constructor(
    private mealService: RestaurantMealService,
    private fb: FormBuilder
  ) {
    this.initializeForms();
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
  }

  private initializeForms() {
    this.filterForm = this.fb.group({
      category: [''],
      isAvailable: [''],
      search: [''],
      priceMin: [''],
      priceMax: [''],
      sortBy: ['createdAt'],
      sortOrder: ['desc']
    });

    this.mealForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      price: ['', [Validators.required, Validators.min(0.01)]],
      category: ['', Validators.required],
      preparationTime: ['', [Validators.required, Validators.min(1)]],
      ingredients: [''],
      allergens: [''],
      isAvailable: [true],
      calories: [''],
      protein: [''],
      carbs: [''],
      fat: ['']
    });
  }

  private setupFormSubscriptions() {
    this.filterForm.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(500),
        distinctUntilChanged()
      )
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

    this.mealService.getMeals(this.currentFilters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse<MealsListResponse>) => {
          if (response.success) {
            this.meals = response.data.meals;
            this.pagination = response.data.pagination;
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading meals:', error);
          this.loading = false;
        }
      });
  }

  loadCategories() {
    this.mealService.getCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.categories = response.data.categories;
          }
        },
        error: (error) => {
          console.error('Error loading categories:', error);
        }
      });
  }

  loadMealStats() {
    this.mealService.getMealsStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.mealStats = response.data;
          }
        },
        error: (error) => {
          console.error('Error loading meal stats:', error);
        }
      });
  }

  refreshData() {
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

  openAddMealModal() {
    this.selectedMeal = null;
    this.isEditMode = false;
    this.mealForm.reset();
    this.mealForm.patchValue({ isAvailable: true });
    this.selectedImage = null;
    this.imagePreview = null;
    this.submittingMeal = false;
    this.showMealModal = true;
  }

  openEditMealModal(meal: Meal) {
    this.selectedMeal = meal;
    this.isEditMode = true;
    this.populateMealForm(meal);
    this.submittingMeal = false;
    this.showMealModal = true;
  }

  closeMealModal() {
    this.showMealModal = false;
    this.selectedMeal = null;
    this.mealForm.reset();
    this.selectedImage = null;
    this.imagePreview = null;
    this.submittingMeal = false;
  }

  private populateMealForm(meal: Meal) {
    this.mealForm.patchValue({
      name: meal.name,
      description: meal.description,
      price: meal.price,
      category: meal.category,
      preparationTime: meal.preparationTime,
      ingredients: meal.ingredients?.join(', ') || '',
      allergens: meal.allergens?.join(', ') || '',
      isAvailable: meal.isAvailable,
      calories: meal.nutritionalInfo?.calories || '',
      protein: meal.nutritionalInfo?.protein || '',
      carbs: meal.nutritionalInfo?.carbs || '',
      fat: meal.nutritionalInfo?.fat || ''
    });

    if (meal.image) {
      this.imagePreview = meal.image;
    }
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedImage = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  saveMeal() {
    console.log('saveMeal method called');

    if (this.submittingMeal) {
      console.log('Already submitting, ignoring duplicate call');
      return;
    }

    if (this.mealForm.invalid) {
      this.markFormGroupTouched(this.mealForm);
      console.log('Form is invalid:', this.mealForm.errors);
      console.log('Form values:', this.mealForm.value);

      // Show specific validation errors
      Object.keys(this.mealForm.controls).forEach(key => {
        const control = this.mealForm.get(key);
        if (control && control.invalid) {
          console.log(`${key} is invalid:`, control.errors);
        }
      });

      alert('Please fill in all required fields correctly.');
      return;
    }

    this.submittingMeal = true;
    const formValue = this.mealForm.value;
    console.log('Saving meal with form value:', formValue);

    const mealData: CreateMealRequest | UpdateMealRequest = {
      name: formValue.name,
      description: formValue.description,
      price: parseFloat(formValue.price),
      category: formValue.category,
      preparationTime: parseInt(formValue.preparationTime),
      ingredients: formValue.ingredients ? formValue.ingredients.split(',').map((i: string) => i.trim()) : [],
      allergens: formValue.allergens ? formValue.allergens.split(',').map((a: string) => a.trim()) : [],
      isAvailable: formValue.isAvailable
    };

    // Add nutritional info if provided
    if (formValue.calories || formValue.protein || formValue.carbs || formValue.fat) {
      mealData.nutritionalInfo = {
        calories: parseFloat(formValue.calories) || 0,
        protein: parseFloat(formValue.protein) || 0,
        carbs: parseFloat(formValue.carbs) || 0,
        fat: parseFloat(formValue.fat) || 0
      };
    }

    console.log('Final meal data:', mealData);

    // Validate meal data
    const errors = this.mealService.validateMealData(mealData);
    if (errors.length > 0) {
      console.error('Validation errors:', errors);
      alert('Validation errors:\n' + errors.join('\n'));
      this.submittingMeal = false;
      return;
    }

    if (this.isEditMode && this.selectedMeal) {
      this.updateMeal(this.selectedMeal.id!, mealData as UpdateMealRequest);
    } else {
      this.createMeal(mealData as CreateMealRequest);
    }
  }

  private createMeal(mealData: CreateMealRequest) {
    console.log('Creating meal with data:', mealData);

    this.mealService.createMeal(mealData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Create meal response:', response);

          if (response.success) {
            const newMeal = response.data.meal;
            console.log('New meal created:', newMeal);

            // Upload image if selected
            if (this.selectedImage && newMeal.id) {
              console.log('Uploading image for meal:', newMeal.id);
              this.uploadMealImage(newMeal.id);
            }

            this.closeMealModal();
            this.loadMeals();
            this.loadMealStats();
            this.submittingMeal = false;
            alert('Meal created successfully!');
          } else {
            console.error('Meal creation failed:', response);
            this.submittingMeal = false;
            alert('Failed to create meal: ' + (response.message || 'Unknown error'));
          }
        },
        error: (error) => {
          console.error('Error creating meal:', error);
          this.submittingMeal = false;

          let errorMessage = 'Error creating meal. Please try again.';

          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          } else if (error.message) {
            errorMessage = error.message;
          }

          alert(errorMessage);
        }
      });
  }

  private updateMeal(mealId: string, mealData: UpdateMealRequest) {
    this.mealService.updateMeal(mealId, mealData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            // Upload image if selected
            if (this.selectedImage) {
              this.uploadMealImage(mealId);
            }

            this.closeMealModal();
            this.loadMeals();
            this.loadMealStats();
            alert('Meal updated successfully!');
          }
        },
        error: (error) => {
          console.error('Error updating meal:', error);
          alert('Error updating meal. Please try again.');
        }
      });
  }

  private uploadMealImage(mealId: string) {
    if (!this.selectedImage) return;

    this.mealService.uploadMealImage(mealId, this.selectedImage)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            console.log('Image uploaded successfully');
          }
        },
        error: (error) => {
          console.error('Error uploading image:', error);
        }
      });
  }

  deleteMeal(meal: Meal) {
    if (confirm(`Are you sure you want to delete "${meal.name}"?`)) {
      this.mealService.deleteMeal(meal.id!)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.loadMeals();
              this.loadMealStats();
              alert('Meal deleted successfully!');
            }
          },
          error: (error) => {
            console.error('Error deleting meal:', error);
            alert('Error deleting meal. Please try again.');
          }
        });
    }
  }

  toggleMealAvailability(meal: Meal) {
    const newAvailability = !meal.isAvailable;

    this.mealService.toggleMealAvailability(meal.id!, newAvailability)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            meal.isAvailable = newAvailability;
            this.loadMealStats();
          }
        },
        error: (error) => {
          console.error('Error toggling meal availability:', error);
          alert('Error updating meal availability.');
        }
      });
  }

  duplicateMeal(meal: Meal) {
    const newName = `${meal.name} (Copy)`;

    this.mealService.duplicateMeal(meal.id!, newName)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.loadMeals();
            this.loadMealStats();
            alert('Meal duplicated successfully!');
          }
        },
        error: (error) => {
          console.error('Error duplicating meal:', error);
          alert('Error duplicating meal. Please try again.');
        }
      });
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
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
