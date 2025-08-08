import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService, AdminDelivery, DeliveryFilters, ApprovalRequest, StatusUpdateRequest } from '../../shared/services/admin.service';

@Component({
  selector: 'app-delivery-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './delivery-management.html',
  styleUrls: ['./delivery-management.scss']
})
export class DeliveryManagement implements OnInit {
  deliveryPersonnel: AdminDelivery[] = [];
  filteredDelivery: AdminDelivery[] = [];

  isLoading = true;
  errorMessage = '';
  successMessage = '';

  // Pagination
  currentPage = 1;
  totalPages = 0;
  totalDelivery = 0;
  pageSize = 10;

  // Filters
  filters: DeliveryFilters = {
    status: undefined,
    isOnline: undefined,
    verified: undefined,
    page: 1,
    limit: 10,
    search: ''
  };

  // Selected items for bulk actions
  selectedDelivery: string[] = [];

  // Modal states
  showDeliveryModal = false;
  showApprovalModal = false;
  showStatusModal = false;
  showDeleteModal = false;

  // Current delivery being processed
  currentDelivery: AdminDelivery | null = null;
  currentDeliveryId = '';

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

  onlineOptions = [
    { value: '', label: 'All' },
    { value: 'true', label: 'Online' },
    { value: 'false', label: 'Offline' }
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
    this.loadDeliveryPersonnel();
  }

  loadDeliveryPersonnel(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.adminService.getAllDeliveryPersonnel(this.filters).subscribe({
      next: (response) => {
        if (response.success) {
          this.deliveryPersonnel = response.data.delivery;
          this.filteredDelivery = [...this.deliveryPersonnel];
          this.totalDelivery = response.data.totalDelivery;
          this.totalPages = response.data.totalPages;
          this.currentPage = response.data.currentPage;
        } else {
          this.errorMessage = 'Failed to load delivery personnel';
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error loading delivery personnel: ' + (error.error?.message || 'Unknown error');
        this.isLoading = false;
      }
    });
  }

  onFilterChange(): void {
    this.filters.page = 1;
    this.currentPage = 1;
    this.loadDeliveryPersonnel();
  }

  onSearchChange(): void {
    if (this.filters.search && this.filters.search.length > 0) {
      this.filteredDelivery = this.deliveryPersonnel.filter(delivery =>
        delivery.firstName.toLowerCase().includes(this.filters.search!.toLowerCase()) ||
        delivery.lastName.toLowerCase().includes(this.filters.search!.toLowerCase()) ||
        delivery.email.toLowerCase().includes(this.filters.search!.toLowerCase()) ||
        delivery.phone.toLowerCase().includes(this.filters.search!.toLowerCase())
      );
    } else {
      this.filteredDelivery = [...this.deliveryPersonnel];
    }
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.filters.page = page;
      this.loadDeliveryPersonnel();
    }
  }

  // Delivery Actions
  viewDelivery(delivery: AdminDelivery): void {
    this.currentDelivery = delivery;
    this.showDeliveryModal = true;
  }

  approveDelivery(delivery: AdminDelivery): void {
    this.currentDelivery = delivery;
    this.currentDeliveryId = delivery.id;
    this.showApprovalModal = true;
  }

  changeStatus(delivery: AdminDelivery): void {
    this.currentDelivery = delivery;
    this.currentDeliveryId = delivery.id;
    this.statusForm.patchValue({
      isActive: !delivery.isActive
    });
    this.showStatusModal = true;
  }

  deleteDelivery(delivery: AdminDelivery): void {
    this.currentDelivery = delivery;
    this.currentDeliveryId = delivery.id;
    this.showDeleteModal = true;
  }

  // Modal Actions
  closeModal(): void {
    this.showDeliveryModal = false;
    this.showApprovalModal = false;
    this.showStatusModal = false;
    this.showDeleteModal = false;
    this.currentDelivery = null;
    this.currentDeliveryId = '';
    this.clearMessages();
  }

  submitApproval(): void {
    if (this.approvalForm.valid && this.currentDeliveryId) {
      const request: ApprovalRequest = this.approvalForm.value;

      this.adminService.approveDelivery(this.currentDeliveryId, request).subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = response.message;
            this.loadDeliveryPersonnel();
            this.closeModal();
          } else {
            this.errorMessage = 'Failed to update delivery approval status';
          }
        },
        error: (error) => {
          this.errorMessage = 'Error updating delivery: ' + (error.error?.message || 'Unknown error');
        }
      });
    }
  }

  submitStatusUpdate(): void {
    if (this.statusForm.valid && this.currentDeliveryId) {
      const request: StatusUpdateRequest = this.statusForm.value;

      this.adminService.updateDeliveryStatus(this.currentDeliveryId, request).subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = response.message;
            this.loadDeliveryPersonnel();
            this.closeModal();
          } else {
            this.errorMessage = 'Failed to update delivery status';
          }
        },
        error: (error) => {
          this.errorMessage = 'Error updating delivery status: ' + (error.error?.message || 'Unknown error');
        }
      });
    }
  }

  confirmDelete(): void {
    if (this.currentDeliveryId) {
      this.adminService.deleteDelivery(this.currentDeliveryId).subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = response.message;
            this.loadDeliveryPersonnel();
            this.closeModal();
          } else {
            this.errorMessage = 'Failed to delete delivery personnel';
          }
        },
        error: (error) => {
          this.errorMessage = 'Error deleting delivery personnel: ' + (error.error?.message || 'Unknown error');
        }
      });
    }
  }

  // Selection Management
  toggleSelection(deliveryId: string): void {
    const index = this.selectedDelivery.indexOf(deliveryId);
    if (index > -1) {
      this.selectedDelivery.splice(index, 1);
    } else {
      this.selectedDelivery.push(deliveryId);
    }
  }

  toggleSelectAll(): void {
    if (this.selectedDelivery.length === this.filteredDelivery.length) {
      this.selectedDelivery = [];
    } else {
      this.selectedDelivery = this.filteredDelivery.map(d => d.id);
    }
  }

  isSelected(deliveryId: string): boolean {
    return this.selectedDelivery.includes(deliveryId);
  }

  isAllSelected(): boolean {
    return this.filteredDelivery.length > 0 && this.selectedDelivery.length === this.filteredDelivery.length;
  }

  isIndeterminate(): boolean {
    return this.selectedDelivery.length > 0 && this.selectedDelivery.length < this.filteredDelivery.length;
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

  getOnlineBadgeClass(isOnline: boolean): string {
    return isOnline ? 'badge bg-success' : 'badge bg-secondary';
  }

  getVerificationBadgeClass(isVerified: boolean): string {
    return isVerified ? 'badge bg-success' : 'badge bg-warning';
  }

  getVehicleIcon(vehicleType: string): string {
    switch (vehicleType) {
      case 'car': return 'fas fa-car';
      case 'motorcycle': return 'fas fa-motorcycle';
      case 'bicycle': return 'fas fa-bicycle';
      default: return 'fas fa-question';
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
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
