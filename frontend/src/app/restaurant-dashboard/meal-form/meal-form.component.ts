import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import {
  RestaurantMealService,
  Meal,
  CreateMealRequest,
  UpdateMealRequest,
  MealCategory,
  ApiResponse
} from '../../shared/services/restaurant-meal.service';

@Component({
  selector: 'app-meal-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './meal-form.component.html',
  styleUrl: './meal-form.component.scss'
})
export class MealFormComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  mealForm!: FormGroup;
  categories: MealCategory[] = [];
  selectedMeal: Meal | null = null;
  selectedImage: File | null = null;
  imagePreview: string | null = null;
  submitting = false;
  loading = false;
  isEditMode = false;
  mealId: string | null = null;

  // Available allergen options
  readonly allergenOptions = [
    { value: 'dairy', label: 'Dairy' },
    { value: 'eggs', label: 'Eggs' },
    { value: 'fish', label: 'Fish' },
    { value: 'shellfish', label: 'Shellfish' },
    { value: 'tree_nuts', label: 'Tree Nuts' },
    { value: 'peanuts', label: 'Peanuts' },
    { value: 'wheat', label: 'Wheat' },
    { value: 'soy', label: 'Soy' }
  ];

  // Discount management
  discountForm!: FormGroup;
  showDiscountSection = false;
  settingDiscount = false;
  removingDiscount = false;

  constructor(
    private fb: FormBuilder,
    private mealService: RestaurantMealService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.initializeForm();
    this.initializeDiscountForm();
  }

  ngOnInit() {
    this.loadCategories();

    // Check if we're in edit mode
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.mealId = params['id'];
        this.isEditMode = true;
        if (this.mealId) {
          this.loadMeal(this.mealId);
        }
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm() {
    this.mealForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      price: ['', [Validators.required, Validators.min(0.01)]],
      category: ['', Validators.required],
      preparationTime: ['', [Validators.required, Validators.min(1)]],
      ingredients: [''],
      allergens: this.fb.array([]), // Changed to FormArray for multi-select
      spiceLevel: ['mild'],
      isAvailable: [true],
      calories: [''],
      protein: [''],
      carbs: [''],
      fat: ['']
    });
  }

  private initializeDiscountForm() {
    this.discountForm = this.fb.group({
      percentage: ['', [Validators.required, Validators.min(1), Validators.max(99)]],
      validUntil: ['', Validators.required]
    });
  }

  private loadCategories() {
    this.mealService.getCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.categories = response.data;
          }
        },
        error: (error) => {
          console.error('Error loading categories:', error);
          // You can add a fallback here if needed
        }
      });
  }

  private loadMeal(mealId: string) {
    this.loading = true;
    this.mealService.getMealById(mealId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            // The API returns meal data directly in response.data
            this.selectedMeal = response.data as any;
            this.populateForm();
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading meal:', error);
          this.loading = false;
          alert('Error loading meal data');
          this.router.navigate(['/restaurant-dashboard/meals-management']);
        }
      });
  }

  private populateForm() {
    if (!this.selectedMeal) return;

    // Handle ingredients - the API returns it as an array with a single string
    let ingredientsText = '';
    if (this.selectedMeal.ingredients && Array.isArray(this.selectedMeal.ingredients)) {
      ingredientsText = this.selectedMeal.ingredients.join('\n');
    }

    this.mealForm.patchValue({
      name: this.selectedMeal.name,
      description: this.selectedMeal.description,
      price: this.selectedMeal.price,
      category: this.selectedMeal.category,
      preparationTime: this.selectedMeal.preparationTime,
      ingredients: ingredientsText,
      isAvailable: this.selectedMeal.isAvailable,
      calories: this.selectedMeal.nutritionalInfo?.calories || '',
      protein: this.selectedMeal.nutritionalInfo?.protein || '',
      carbs: this.selectedMeal.nutritionalInfo?.carbs || '',
      fat: this.selectedMeal.nutritionalInfo?.fat || ''
    });

    // Handle allergens array
    const allergensArray = this.mealForm.get('allergens') as FormArray;
    allergensArray.clear();
    if (this.selectedMeal.allergens && this.selectedMeal.allergens.length > 0) {
      this.selectedMeal.allergens.forEach(allergen => {
        if (this.allergenOptions.some(option => option.value === allergen)) {
          allergensArray.push(this.fb.control(allergen));
        }
      });
    }

    // Handle image
    if (this.selectedMeal.image) {
      this.imagePreview = this.selectedMeal.image;
    }
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      this.selectedImage = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage() {
    this.selectedImage = null;
    this.imagePreview = null;
  }

  onSubmit() {
    if (this.submitting) return;

    if (this.mealForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.submitting = true;

    // Handle image conversion first if there's a selected image
    if (this.selectedImage) {
      this.mealService.convertImageToDataUrl(this.selectedImage)
        .then(imageUrl => {
          this.processFormSubmission(imageUrl);
        })
        .catch(error => {
          console.error('Error converting image:', error);
          this.processFormSubmission();
        });
    } else {
      this.processFormSubmission();
    }
  }

  private processFormSubmission(imageUrl?: string) {
    const formValue = this.mealForm.value;

    const mealData: CreateMealRequest | UpdateMealRequest = {
      name: formValue.name,
      description: formValue.description,
      price: parseFloat(formValue.price),
      category: formValue.category,
      preparationTime: parseInt(formValue.preparationTime),
      ingredients: formValue.ingredients ? formValue.ingredients.split(',').map((i: string) => i.trim()) : [],
      allergens: this.getAllergens(),
      isAvailable: formValue.isAvailable
    };

    // Add image URL if provided
    if (imageUrl) {
      mealData.imageUrl = imageUrl;
    }

    // Add nutritional info if provided
    if (formValue.calories || formValue.protein || formValue.carbs || formValue.fat) {
      mealData.nutritionalInfo = {
        calories: parseFloat(formValue.calories) || 0,
        protein: parseFloat(formValue.protein) || 0,
        carbs: parseFloat(formValue.carbs) || 0,
        fat: parseFloat(formValue.fat) || 0
      };
    }

    if (this.isEditMode && this.mealId) {
      this.updateMeal(this.mealId, mealData as UpdateMealRequest);
    } else {
      this.createMeal(mealData as CreateMealRequest);
    }
  }

  private createMeal(mealData: CreateMealRequest) {
    this.mealService.createMeal(mealData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.onSuccess('Meal created successfully!');
          }
        },
        error: (error) => {
          this.onError('Error creating meal', error);
        }
      });
  }

  private updateMeal(mealId: string, mealData: UpdateMealRequest) {
    this.mealService.updateMeal(mealId, mealData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.onSuccess('Meal updated successfully!');
          }
        },
        error: (error) => {
          this.onError('Error updating meal', error);
        }
      });
  }

  private onSuccess(message: string) {
    this.submitting = false;
    alert(message);
    this.router.navigate(['/restaurant-dashboard/meals-management']);
  }

  private onError(message: string, error: any) {
    this.submitting = false;
    console.error(message, error);

    let errorMessage = message;
    if (error.error?.message) {
      errorMessage += ': ' + error.error.message;
    }

    alert(errorMessage);
  }

  private markFormGroupTouched() {
    Object.keys(this.mealForm.controls).forEach(key => {
      const control = this.mealForm.get(key);
      control?.markAsTouched();
    });
  }

  onCancel() {
    if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      this.router.navigate(['/restaurant-dashboard/meals-management']);
    }
  }

  // Utility methods
  isFieldInvalid(fieldName: string): boolean {
    const field = this.mealForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.mealForm.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      const errors = field.errors;

      if (errors['required']) return `${fieldName} is required`;
      if (errors['minlength']) return `${fieldName} must be at least ${errors['minlength'].requiredLength} characters`;
      if (errors['min']) return `${fieldName} must be greater than ${errors['min'].min}`;
      if (errors['email']) return 'Please enter a valid email';
    }
    return '';
  }

  // Allergen management methods
  get allergensFormArray(): FormArray {
    return this.mealForm.get('allergens') as FormArray;
  }

  getAllergens(): string[] {
    return this.allergensFormArray.value;
  }

  isAllergenSelected(allergen: string): boolean {
    return this.allergensFormArray.value.includes(allergen);
  }

  onAllergenChange(allergen: string, event: any): void {
    const allergensArray = this.allergensFormArray;

    if (event.target.checked) {
      // Add allergen if not already present
      if (!this.isAllergenSelected(allergen)) {
        allergensArray.push(this.fb.control(allergen));
      }
    } else {
      // Remove allergen
      const index = allergensArray.value.indexOf(allergen);
      if (index >= 0) {
        allergensArray.removeAt(index);
      }
    }
  }

  // Discount management methods
  toggleDiscountSection(): void {
    this.showDiscountSection = !this.showDiscountSection;
    if (this.showDiscountSection) {
      // Set default date to 30 days from now
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 30);
      this.discountForm.patchValue({
        validUntil: defaultDate.toISOString().split('T')[0]
      });
    }
  }

  hasActiveDiscount(): boolean {
    if (!this.selectedMeal || !this.selectedMeal.discount) return false;
    const now = new Date();
    const validUntil = new Date(this.selectedMeal.discount.validUntil);
    return this.selectedMeal.discount.percentage > 0 && validUntil > now;
  }

  getCurrentDiscount(): any {
    if (!this.hasActiveDiscount()) return null;
    return this.selectedMeal?.discount;
  }

  setDiscount(): void {
    if (!this.discountForm.valid || !this.mealId) return;

    const formValue = this.discountForm.value;
    const discountData = {
      percentage: formValue.percentage,
      validUntil: new Date(formValue.validUntil).toISOString()
    };

    this.settingDiscount = true;
    this.mealService.setMealDiscount(this.mealId, discountData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            alert('Discount set successfully!');
            this.showDiscountSection = false;
            this.discountForm.reset();
            // Reload meal data to show updated discount
            if (this.mealId) {
              this.loadMeal(this.mealId);
            }
          }
          this.settingDiscount = false;
        },
        error: (error) => {
          console.error('Error setting discount:', error);
          alert('Error setting discount. Please try again.');
          this.settingDiscount = false;
        }
      });
  }

  removeDiscount(): void {
    if (!this.mealId) return;

    if (confirm('Are you sure you want to remove the discount from this meal?')) {
      this.removingDiscount = true;
      this.mealService.removeMealDiscount(this.mealId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.success) {
              alert('Discount removed successfully!');
              // Reload meal data to show updated state
              if (this.mealId) {
                this.loadMeal(this.mealId);
              }
            }
            this.removingDiscount = false;
          },
          error: (error) => {
            console.error('Error removing discount:', error);
            alert('Error removing discount. Please try again.');
            this.removingDiscount = false;
          }
        });
    }
  } formatPrice(price: number): string {
    return `$${price.toFixed(2)}`;
  }

  calculateDiscountedPrice(): number {
    if (!this.selectedMeal || !this.hasActiveDiscount()) return this.selectedMeal?.price || 0;
    const discount = this.getCurrentDiscount();
    return this.selectedMeal.price * (1 - discount.percentage / 100);
  }

  get minDate(): string {
    return new Date().toISOString().split('T')[0];
  }
}
