import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService, AdminRestaurant, RestaurantFilters, ApprovalRequest, StatusUpdateRequest } from '../../shared/services/admin.service';

@Component({
  selector: 'app-restaurants-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './restaurants-management.html',
  styleUrls: ['./restaurants-management.scss']
})
export class RestaurantsManagement implements OnInit {
  restaurants: AdminRestaurant[] = [];
  filteredRestaurants: AdminRestaurant[] = [];

  isLoading = true;
  errorMessage = '';
  successMessage = '';

  // Pagination
  currentPage = 1;
  totalPages = 0;
  totalRestaurants = 0;
  pageSize = 10;

  // Filters
  filters: RestaurantFilters = {
    status: undefined,
    verified: undefined,
    page: 1,
    limit: 10,
    search: ''
  };

  // Selected items for bulk actions
  selectedRestaurants: string[] = [];

  // Modal states
  showRestaurantModal = false;
  showApprovalModal = false;
  showStatusModal = false;
  showDeleteModal = false;

  // Current restaurant being processed
  currentRestaurant: AdminRestaurant | null = null;
  currentRestaurantId = '';

  // Forms
  approvalForm: FormGroup;
  statusForm: FormGroup;

  // Filter options
  statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending' },
    { value: 'verified', label: 'Verified' },
    { value: 'rejected', label: 'Rejected' }
  ];

  verifiedOptions = [
    { value: '', label: 'All' },
    { value: 'true', label: 'Verified' },
    { value: 'false', label: 'Not Verified' }
  ];

  constructor(
    private adminService: AdminService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.approvalForm = this.fb.group({
      status: ['verified'],
      reason: ['']
    });

    this.statusForm = this.fb.group({
      isActive: [true],
      reason: ['']
    });
  }

  ngOnInit(): void {
    this.loadRestaurants();
  }

  loadRestaurants(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.adminService.getAllRestaurants(this.filters).subscribe({
      next: (response) => {
        if (response.success) {
          this.restaurants = response.data.restaurants;
          this.filteredRestaurants = [...this.restaurants];
          this.totalRestaurants = response.data.totalRestaurants;
          this.totalPages = response.data.totalPages;
          this.currentPage = response.data.currentPage;
        } else {
          this.errorMessage = 'Failed to load restaurants';
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error loading restaurants: ' + (error.error?.message || 'Unknown error');
        this.isLoading = false;
      }
    });
  }

  onFilterChange(): void {
    this.filters.page = 1;
    this.currentPage = 1;
    this.loadRestaurants();
  }

  onSearchChange(): void {
    if (this.filters.search && this.filters.search.length > 0) {
      this.filteredRestaurants = this.restaurants.filter(restaurant =>
        restaurant.firstName.toLowerCase().includes(this.filters.search!.toLowerCase()) ||
        restaurant.lastName.toLowerCase().includes(this.filters.search!.toLowerCase()) ||
        restaurant.email.toLowerCase().includes(this.filters.search!.toLowerCase()) ||
        restaurant.restaurantName.toLowerCase().includes(this.filters.search!.toLowerCase())
      );
    } else {
      this.filteredRestaurants = [...this.restaurants];
    }
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.filters.page = page;
      this.loadRestaurants();
    }
  }

  // Restaurant Actions
  viewRestaurant(restaurant: AdminRestaurant): void {
    this.currentRestaurant = restaurant;
    this.showRestaurantModal = true;
  }

  approveRestaurant(restaurant: AdminRestaurant): void {
    this.currentRestaurant = restaurant;
    this.currentRestaurantId = restaurant.id;
    this.showApprovalModal = true;
  }

  changeStatus(restaurant: AdminRestaurant): void {
    this.currentRestaurant = restaurant;
    this.currentRestaurantId = restaurant.id;
    this.statusForm.patchValue({
      isActive: !restaurant.isActive
    });
    this.showStatusModal = true;
  }

  deleteRestaurant(restaurant: AdminRestaurant): void {
    this.currentRestaurant = restaurant;
    this.currentRestaurantId = restaurant.id;
    this.showDeleteModal = true;
  }

  // Modal Actions
  closeModal(): void {
    this.showRestaurantModal = false;
    this.showApprovalModal = false;
    this.showStatusModal = false;
    this.showDeleteModal = false;
    this.currentRestaurant = null;
    this.currentRestaurantId = '';
    this.clearMessages();
  }

  submitApproval(): void {
    if (this.approvalForm.valid && this.currentRestaurantId) {
      const request: ApprovalRequest = this.approvalForm.value;

      this.adminService.approveRestaurant(this.currentRestaurantId, request).subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = response.message;
            this.loadRestaurants();
            this.closeModal();
          } else {
            this.errorMessage = 'Failed to update restaurant approval status';
          }
        },
        error: (error) => {
          this.errorMessage = 'Error updating restaurant: ' + (error.error?.message || 'Unknown error');
        }
      });
    }
  }

  submitStatusUpdate(): void {
    if (this.statusForm.valid && this.currentRestaurantId) {
      const request: StatusUpdateRequest = this.statusForm.value;

      this.adminService.updateRestaurantStatus(this.currentRestaurantId, request).subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = response.message;
            this.loadRestaurants();
            this.closeModal();
          } else {
            this.errorMessage = 'Failed to update restaurant status';
          }
        },
        error: (error) => {
          this.errorMessage = 'Error updating restaurant status: ' + (error.error?.message || 'Unknown error');
        }
      });
    }
  }

  confirmDelete(): void {
    if (this.currentRestaurantId) {
      this.adminService.deleteRestaurant(this.currentRestaurantId).subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = response.message;
            this.loadRestaurants();
            this.closeModal();
          } else {
            this.errorMessage = 'Failed to delete restaurant';
          }
        },
        error: (error) => {
          this.errorMessage = 'Error deleting restaurant: ' + (error.error?.message || 'Unknown error');
        }
      });
    }
  }

  // Selection Management
  toggleSelection(restaurantId: string): void {
    const index = this.selectedRestaurants.indexOf(restaurantId);
    if (index > -1) {
      this.selectedRestaurants.splice(index, 1);
    } else {
      this.selectedRestaurants.push(restaurantId);
    }
  }

  toggleSelectAll(): void {
    if (this.selectedRestaurants.length === this.filteredRestaurants.length) {
      this.selectedRestaurants = [];
    } else {
      this.selectedRestaurants = this.filteredRestaurants.map(r => r.id);
    }
  }

  isSelected(restaurantId: string): boolean {
    return this.selectedRestaurants.includes(restaurantId);
  }

  isAllSelected(): boolean {
    return this.filteredRestaurants.length > 0 && this.selectedRestaurants.length === this.filteredRestaurants.length;
  }

  isIndeterminate(): boolean {
    return this.selectedRestaurants.length > 0 && this.selectedRestaurants.length < this.filteredRestaurants.length;
  }

  // Utility Methods
  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'active': return 'badge bg-success';
      case 'inactive': return 'badge bg-secondary';
      case 'pending': return 'badge bg-warning';
      case 'verified': return 'badge bg-primary';
      case 'rejected': return 'badge bg-danger';
      default: return 'badge bg-light text-dark';
    }
  }

  getVerificationBadgeClass(isVerified: boolean): string {
    return isVerified ? 'badge bg-success' : 'badge bg-warning';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  generatePageNumbers(): number[] {
    const pages: number[] = [];
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(this.totalPages, this.currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }
}
