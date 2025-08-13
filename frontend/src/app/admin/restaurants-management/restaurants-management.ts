import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService, AdminRestaurant, RestaurantFilters, RestaurantsResponse, ApprovalRequest, StatusUpdateRequest, PendingRestaurant } from '../../shared/services/admin.service';

@Component({
  selector: 'app-restaurants-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './restaurants-management.html',
  styleUrls: ['./restaurants-management.scss']
})
export class RestaurantsManagement implements OnInit {
  // Only pending restaurants for approval
  pendingRestaurants: any[] = [];
  filteredRestaurants: any[] = [];

  isLoading = true;
  errorMessage = '';
  successMessage = '';

  // Pagination
  currentPage = 1;
  totalPages = 0;
  totalRestaurants = 0;
  pageSize = 12;

  // Search
  searchTerm = '';

  // Modal states
  showRestaurantModal = false;
  showApprovalModal = false;
  showDeleteModal = false;

  // Current restaurant being processed
  currentRestaurant: any | null = null;
  currentRestaurantId = '';
  actionType: 'approve' | 'reject' = 'approve';

  // Forms
  approvalForm: FormGroup;

  constructor(
    private adminService: AdminService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.approvalForm = this.fb.group({
      status: ['verified'],
      reason: ['']
    });
  }

  ngOnInit(): void {
    this.loadPendingRestaurants();
  }

  loadPendingRestaurants(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.adminService.getPendingRestaurants().subscribe({
      next: (response) => {
        console.log('Pending restaurants response:', response);
        if (response.success && response.data) {
          this.pendingRestaurants = response.data;
          this.filteredRestaurants = [...this.pendingRestaurants];
          this.updatePagination();
        } else {
          console.warn('Invalid response format for pending restaurants:', response);
          this.pendingRestaurants = [];
          this.filteredRestaurants = [];
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading pending restaurants:', error);
        this.errorMessage = 'Failed to load pending restaurants';
        this.pendingRestaurants = [];
        this.filteredRestaurants = [];
        this.isLoading = false;
      }
    });
  }

  onSearchChange(): void {
    this.applySearchFilter();
    this.currentPage = 1;
  }

  private applySearchFilter(): void {
    if (this.searchTerm && this.pendingRestaurants.length > 0) {
      this.filteredRestaurants = this.pendingRestaurants.filter(restaurant => {
        const searchLower = this.searchTerm.toLowerCase();
        const restaurantName = this.getRestaurantName(restaurant);
        const ownerName = this.getOwnerName(restaurant);
        const email = restaurant.email || '';

        return (
          restaurantName.toLowerCase().includes(searchLower) ||
          ownerName.toLowerCase().includes(searchLower) ||
          email.toLowerCase().includes(searchLower)
        );
      });
    } else {
      this.filteredRestaurants = this.pendingRestaurants;
    }
    this.updatePagination();
  }

  private updatePagination(): void {
    this.totalRestaurants = this.filteredRestaurants.length;
    this.totalPages = Math.ceil(this.totalRestaurants / this.pageSize);
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // Restaurant Actions
  viewRestaurant(restaurant: any): void {
    this.currentRestaurant = restaurant;
    this.showRestaurantModal = true;
  }

  approveRestaurant(restaurant: any, reason: string): void {
    this.isLoading = true;
    this.actionType = 'approve';
    this.currentRestaurant = restaurant;
    this.currentRestaurantId = restaurant._id || restaurant.id;
    console.log(reason);
    this.approvalForm.patchValue({
      status: 'verified',
      reason: reason
    });
    this.adminService.approveRestaurant(this.currentRestaurantId, {
      status: 'verified',
      reason: reason
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage = response.message;
          this.loadPendingRestaurants();
          this.closeModal();
        } else {
          this.errorMessage = 'Failed to approve restaurant';
        }
      },
      error: (error) => {
        this.errorMessage = 'Error approving restaurant: ' + (error.error?.message || 'Unknown error');
      }
    });
    this.isLoading = false;
    this.showApprovalModal = true;
  }

  rejectRestaurant(restaurant: any, reason: string): void {
    this.isLoading = true;
    this.actionType = 'reject';
    this.currentRestaurant = restaurant;
    this.currentRestaurantId = restaurant._id || restaurant.id;
    this.approvalForm.patchValue({
      status: 'rejected',
      reason: reason
    });
    this.adminService.rejectRestaurant(this.currentRestaurantId, {
      status: 'rejected',
      reason: reason
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage = response.message;
          this.loadPendingRestaurants();
          this.closeModal();
        } else {
          this.errorMessage = 'Failed to reject restaurant';
        }
      },
      error: (error) => {
        this.errorMessage = 'Error rejecting restaurant: ' + (error.error?.message || 'Unknown error');
      }
    });
    this.isLoading = false;
    this.showApprovalModal = true;
  }

  deleteRestaurant(restaurant: any): void {
    this.currentRestaurant = restaurant;
    this.currentRestaurantId = restaurant._id || restaurant.id;
    this.showDeleteModal = true;
  }

  // Modal Actions
  closeModal(): void {
    this.showRestaurantModal = false;
    this.showApprovalModal = false;
    this.showDeleteModal = false;
    this.currentRestaurant = null;
    this.currentRestaurantId = '';
    this.clearMessages();
  }

  submitApproval(): void {
    if (this.approvalForm.valid && this.currentRestaurantId) {
      const request: ApprovalRequest = this.approvalForm.value;

      if (this.actionType === 'approve') {
        this.adminService.approveRestaurant(this.currentRestaurantId, request).subscribe({
          next: (response) => {
            if (response.success) {
              this.successMessage = response.message;
              this.loadPendingRestaurants();
              this.closeModal();
            } else {
              this.errorMessage = 'Failed to approve restaurant';
            }
          },
          error: (error) => {
            this.errorMessage = 'Error approving restaurant: ' + (error.error?.message || 'Unknown error');
          }
        });
      } else {
        this.adminService.rejectRestaurant(this.currentRestaurantId, request).subscribe({
          next: (response) => {
            if (response.success) {
              this.successMessage = response.message;
              this.loadPendingRestaurants();
              this.closeModal();
            } else {
              this.errorMessage = 'Failed to reject restaurant';
            }
          },
          error: (error) => {
            this.errorMessage = 'Error rejecting restaurant: ' + (error.error?.message || 'Unknown error');
          }
        });
      }
    }
  }

  confirmDelete(): void {
    if (this.currentRestaurantId) {
      this.adminService.deleteRestaurant(this.currentRestaurantId).subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = response.message;
            this.loadPendingRestaurants();
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

  // Utility Methods
  getRestaurantName(restaurant: any): string {
    return restaurant.name || restaurant.businessName || restaurant.restaurantName || 'Unknown Restaurant';
  }

  getOwnerName(restaurant: any): string {
    return restaurant.ownerName ||
      restaurant.owner?.name ||
      (restaurant.firstName && restaurant.lastName ?
        `${restaurant.firstName} ${restaurant.lastName}` : 'Unknown Owner');
  }

  getRestaurantAddress(restaurant: any): string {
    const addr = restaurant.address;
    if (typeof addr === 'string') {
      return addr;
    } else if (addr && typeof addr === 'object') {
      return `${addr.street || ''}, ${addr.city || ''}`.replace(/^,\s*|,\s*$/g, '') || 'No address';
    }
    return 'No address';
  }

  getBusinessLicense(restaurant: any): string {
    return restaurant.businessLicense ||
      restaurant.businessRegistrationNumber ||
      'N/A';
  }

  getCreatedDate(restaurant: any): string {
    return restaurant.createdAt ||
      restaurant.submittedAt ||
      new Date().toISOString();
  }

  getPaginatedRestaurants(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredRestaurants.slice(start, end);
  }

  getRestaurantStats() {
    return {
      total: this.pendingRestaurants.length,
      pending: this.pendingRestaurants.length,
      approved: 0,
      rejected: 0
    };
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  trackByRestaurant(index: number, restaurant: PendingRestaurant): string {
    return (restaurant as any)._id || (restaurant as any).id || index.toString();
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
