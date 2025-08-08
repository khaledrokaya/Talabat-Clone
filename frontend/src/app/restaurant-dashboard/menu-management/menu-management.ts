import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { RestaurantService } from '../../shared/services/restaurant.service';

@Component({
  selector: 'app-menu-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './menu-management.html',
  styleUrls: ['./menu-management.scss']
})
export class MenuManagement implements OnInit {
  categories: any[] = [];
  products: any[] = [];
  filteredCategories: any[] = [];
  isLoading = true;
  
  // Modal states
  showCategoryModal = false;
  showProductModal = false;
  isEditingCategory = false;
  isEditingProduct = false;
  isSubmittingCategory = false;
  isSubmittingProduct = false;
  
  // Forms
  categoryForm!: FormGroup;
  productForm!: FormGroup;
  
  // Current editing IDs
  currentCategoryId: string | null = null;
  currentProductId: string | null = null;
  selectedCategoryId: string | null = null;
  
  // Filters
  searchTerm = '';
  activeFilter = 'all';

  constructor(
    private restaurantService: RestaurantService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initializeForms();
    this.loadMenuData();
  }

  initializeForms(): void {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required]],
      description: ['']
    });

    this.productForm = this.fb.group({
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
      price: ['', [Validators.required, Validators.min(0.01)]],
      originalPrice: [''],
      category: ['', [Validators.required]],
      image: [''],
      available: [true]
    });
  }

  loadMenuData(): void {
    this.isLoading = true;
    
    // Load categories and products
    Promise.all([
      this.restaurantService.getCategories().toPromise(),
      this.restaurantService.getProducts().toPromise()
    ]).then(([categories, products]) => {
      this.categories = categories || [];
      this.products = products || [];
      this.filterProducts();
      this.isLoading = false;
    }).catch(error => {
      console.error('خطأ في تحميل بيانات القائمة:', error);
      this.isLoading = false;
    });
  }

  // Statistics methods
  getTotalProducts(): number {
    return this.products.length;
  }

  getActiveProducts(): number {
    return this.products.filter(product => product.available).length;
  }

  getInactiveProducts(): number {
    return this.products.filter(product => !product.available).length;
  }

  getCategoryProductsCount(categoryId: string): number {
    return this.products.filter(product => product.category === categoryId).length;
  }

  getCategoryProducts(categoryId: string): any[] {
    let categoryProducts = this.products.filter(product => product.category === categoryId);
    
    // Apply search filter
    if (this.searchTerm) {
      categoryProducts = categoryProducts.filter(product =>
        product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
    
    // Apply availability filter
    if (this.activeFilter === 'available') {
      categoryProducts = categoryProducts.filter(product => product.available);
    } else if (this.activeFilter === 'unavailable') {
      categoryProducts = categoryProducts.filter(product => !product.available);
    }
    
    return categoryProducts;
  }

  // Filter methods
  filterProducts(): void {
    this.filteredCategories = this.categories.filter(category => {
      const categoryProducts = this.getCategoryProducts(category._id);
      return categoryProducts.length > 0;
    });
  }

  setFilter(filter: string): void {
    this.activeFilter = filter;
    this.filterProducts();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.activeFilter = 'all';
    this.filterProducts();
  }

  // Category methods
  openCategoryModal(): void {
    this.isEditingCategory = false;
    this.showCategoryModal = true;
    this.categoryForm.reset();
  }

  editCategory(category: any): void {
    this.isEditingCategory = true;
    this.currentCategoryId = category._id;
    this.showCategoryModal = true;
    this.categoryForm.patchValue({
      name: category.name,
      description: category.description || ''
    });
  }

  closeCategoryModal(): void {
    this.showCategoryModal = false;
    this.isEditingCategory = false;
    this.currentCategoryId = null;
    this.categoryForm.reset();
  }

  onSubmitCategory(): void {
    if (this.categoryForm.valid) {
      this.isSubmittingCategory = true;
      
      const categoryData = this.categoryForm.value;

      if (this.isEditingCategory && this.currentCategoryId) {
        this.restaurantService.updateCategory(this.currentCategoryId, categoryData).subscribe({
          next: () => {
            this.isSubmittingCategory = false;
            this.closeCategoryModal();
            this.loadMenuData();
            alert('تم تحديث الفئة بنجاح');
          },
          error: (error) => {
            this.isSubmittingCategory = false;
            console.error('خطأ في تحديث الفئة:', error);
            alert('حدث خطأ أثناء تحديث الفئة');
          }
        });
      } else {
        this.restaurantService.createCategory(categoryData).subscribe({
          next: () => {
            this.isSubmittingCategory = false;
            this.closeCategoryModal();
            this.loadMenuData();
            alert('تم إضافة الفئة بنجاح');
          },
          error: (error) => {
            this.isSubmittingCategory = false;
            console.error('خطأ في إضافة الفئة:', error);
            alert('حدث خطأ أثناء إضافة الفئة');
          }
        });
      }
    }
  }

  deleteCategory(categoryId: string): void {
    if (confirm('هل أنت متأكد من حذف هذه الفئة؟ سيتم حذف جميع الأصناف المرتبطة بها.')) {
      this.restaurantService.deleteCategory(categoryId).subscribe({
        next: () => {
          this.loadMenuData();
          alert('تم حذف الفئة بنجاح');
        },
        error: (error) => {
          console.error('خطأ في حذف الفئة:', error);
          alert('حدث خطأ أثناء حذف الفئة');
        }
      });
    }
  }

  // Product methods
  openProductModal(categoryId?: string): void {
    this.isEditingProduct = false;
    this.showProductModal = true;
    this.selectedCategoryId = categoryId || null;
    this.productForm.reset({
      available: true,
      category: categoryId || ''
    });
  }

  editProduct(product: any): void {
    this.isEditingProduct = true;
    this.currentProductId = product._id;
    this.showProductModal = true;
    this.productForm.patchValue({
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice || '',
      category: product.category,
      image: product.image || '',
      available: product.available
    });
  }

  closeProductModal(): void {
    this.showProductModal = false;
    this.isEditingProduct = false;
    this.currentProductId = null;
    this.selectedCategoryId = null;
    this.productForm.reset();
  }

  onSubmitProduct(): void {
    if (this.productForm.valid) {
      this.isSubmittingProduct = true;
      
      const productData = this.productForm.value;

      if (this.isEditingProduct && this.currentProductId) {
        this.restaurantService.updateProduct(this.currentProductId, productData).subscribe({
          next: () => {
            this.isSubmittingProduct = false;
            this.closeProductModal();
            this.loadMenuData();
            alert('تم تحديث الصنف بنجاح');
          },
          error: (error) => {
            this.isSubmittingProduct = false;
            console.error('خطأ في تحديث الصنف:', error);
            alert('حدث خطأ أثناء تحديث الصنف');
          }
        });
      } else {
        this.restaurantService.createProduct(productData).subscribe({
          next: () => {
            this.isSubmittingProduct = false;
            this.closeProductModal();
            this.loadMenuData();
            alert('تم إضافة الصنف بنجاح');
          },
          error: (error) => {
            this.isSubmittingProduct = false;
            console.error('خطأ في إضافة الصنف:', error);
            alert('حدث خطأ أثناء إضافة الصنف');
          }
        });
      }
    }
  }

  toggleProductAvailability(product: any): void {
    const updatedProduct = { ...product, available: !product.available };
    
    this.restaurantService.updateProduct(product._id, updatedProduct).subscribe({
      next: () => {
        this.loadMenuData();
        const status = updatedProduct.available ? 'متاح' : 'غير متاح';
        alert(`تم تغيير حالة الصنف إلى ${status}`);
      },
      error: (error) => {
        console.error('خطأ في تغيير حالة الصنف:', error);
        alert('حدث خطأ أثناء تغيير حالة الصنف');
      }
    });
  }

  deleteProduct(productId: string): void {
    if (confirm('هل أنت متأكد من حذف هذا الصنف؟')) {
      this.restaurantService.deleteProduct(productId).subscribe({
        next: () => {
          this.loadMenuData();
          alert('تم حذف الصنف بنجاح');
        },
        error: (error) => {
          console.error('خطأ في حذف الصنف:', error);
          alert('حدث خطأ أثناء حذف الصنف');
        }
      });
    }
  }

  // Utility methods
  onImageError(event: any): void {
    event.target.src = '/assets/images/food-placeholder.jpg';
  }
}

