import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService, AdminDelivery, ApprovalRequest } from '../../shared/services/admin.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-delivery-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './delivery-management.html',
  styleUrls: ['./delivery-management.scss']
})
export class DeliveryManagement implements OnInit {
  pendingDelivery: AdminDelivery[] = [];
  filteredDelivery: AdminDelivery[] = [];

  isLoading = true;

  // Pagination
  currentPage = 1;
  totalPages = 0;
  pageSize = 10;

  // Search
  searchTerm = '';

  // Modal states
  showDeliveryModal = false;
  showApprovalModal = false;
  showRejectionReasonModal = false;

  // Current delivery being processed
  currentDelivery: AdminDelivery | null = null;
  currentDeliveryId = '';

  // Approval form
  approvalForm: FormGroup;
  rejectionForm: FormGroup;

  constructor(
    private adminService: AdminService,
    private fb: FormBuilder,
    private toastService: ToastService
  ) {
    this.approvalForm = this.fb.group({
      status: ['verified', Validators.required],
      reason: ['', Validators.required]
    });

    this.rejectionForm = this.fb.group({
      reason: ['', Validators.required],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadPendingDelivery();
  }

  loadPendingDelivery(): void {
    this.isLoading = true;

    this.adminService.getPendingDeliveryUsers().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.pendingDelivery = response.data;
          this.filteredDelivery = [...this.pendingDelivery];
          this.calculatePagination();
        } else {
          this.pendingDelivery = [];
          this.filteredDelivery = [];
          this.toastService.error('Failed to load pending delivery applications', 'Loading Error');
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.pendingDelivery = [];
        this.filteredDelivery = [];
        this.toastService.showApiError(error, 'Error loading delivery applications');
        this.isLoading = false;
      }
    });
  }

  calculatePagination(): void {
    this.totalPages = Math.ceil(this.filteredDelivery.length / this.pageSize);
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
  }

  onSearchChange(): void {
    if (this.searchTerm && this.searchTerm.length > 0) {
      this.filteredDelivery = this.pendingDelivery.filter(delivery =>
        delivery.firstName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        delivery.lastName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        delivery.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        delivery.phone.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        delivery.vehicleInfo.type.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    } else {
      this.filteredDelivery = [...this.pendingDelivery];
    }
    this.currentPage = 1;
    this.calculatePagination();
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getPaginatedDelivery(): AdminDelivery[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredDelivery.slice(startIndex, endIndex);
  }

  // Delivery Actions
  viewDelivery(delivery: AdminDelivery): void {
    this.currentDelivery = delivery;
    this.showDeliveryModal = true;
  }

  approveDelivery(delivery: AdminDelivery, status: 'verified' | 'rejected'): void {
    this.currentDelivery = delivery;
    this.currentDeliveryId = delivery._id;
    this.approvalForm.patchValue({
      status: status,
      reason: status === 'verified' ? 'Application approved by admin' : ''
    });
    this.showApprovalModal = true;
  }

  // Modal Actions
  closeModal(): void {
    this.showDeliveryModal = false;
    this.showApprovalModal = false;
    this.currentDelivery = null;
    this.currentDeliveryId = '';
  }

  submitApproval(): void {
    if (this.approvalForm.valid && this.currentDeliveryId) {
      const request: ApprovalRequest = this.approvalForm.value;

      if (request.status === 'verified') {
        this.adminService.approveDelivery(this.currentDeliveryId, request).subscribe({
          next: (response) => {
            if (response.success) {
              this.toastService.success('Delivery partner approved successfully', 'Approval Successful');
              this.loadPendingDelivery();
              this.closeModal();
            } else {
              this.toastService.error('Failed to approve delivery partner', 'Approval Error');
            }
          },
          error: (error) => {
            this.toastService.showApiError(error, 'Error approving delivery');
          }
        });
      } else {
        this.adminService.rejectDelivery(this.currentDeliveryId, request).subscribe({
          next: (response) => {
            if (response.success) {
              this.toastService.success('Delivery partner rejected successfully', 'Rejection Successful');
              this.loadPendingDelivery();
              this.closeModal();
            } else {
              this.toastService.error('Failed to reject delivery partner', 'Rejection Error');
            }
          },
          error: (error) => {
            this.toastService.showApiError(error, 'Error rejecting delivery');
          }
        });
      }
    }
  }

  // Utility Methods
  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'pending': return 'badge bg-warning';
      case 'verified': return 'badge bg-success';
      case 'rejected': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  }

  getVehicleIcon(vehicleType: string): string {
    switch (vehicleType?.toLowerCase()) {
      case 'car': return 'fas fa-car';
      case 'motorcycle': return 'fas fa-motorcycle';
      case 'bicycle': return 'fas fa-bicycle';
      case 'scooter': return 'fas fa-motorcycle';
      default: return 'fas fa-truck';
    }
  }

  getVehicleBadgeClass(vehicleType: string): string {
    switch (vehicleType?.toLowerCase()) {
      case 'car': return 'badge bg-primary';
      case 'motorcycle': return 'badge bg-warning';
      case 'bicycle': return 'badge bg-success';
      case 'scooter': return 'badge bg-info';
      default: return 'badge bg-secondary';
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString();
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

  getDeliveryStats() {
    return {
      total: this.filteredDelivery.length,
      pending: this.filteredDelivery.filter(d => d.verificationStatus === 'pending').length,
      verified: this.filteredDelivery.filter(d => d.verificationStatus === 'verified').length
    };
  }

  refreshData(): void {
    this.loadPendingDelivery();
  }

  // Additional methods needed by the template
  viewDeliveryDetails(delivery: AdminDelivery): void {
    this.currentDelivery = delivery;
    this.showDeliveryModal = true;
  }

  openDocument(documentUrl?: string): void {
    if (documentUrl) {
      window.open(documentUrl, '_blank');
    }
  }

  handleImageError(event: any): void {
    event.target.src = 'assets/images/default-avatar.png';
  }

  showRejectionModal(delivery: AdminDelivery): void {
    this.currentDelivery = delivery;
    this.showRejectionReasonModal = true;
  }

  closeRejectionModal(): void {
    this.showRejectionReasonModal = false;
    this.rejectionForm.reset();
  }

  submitRejection(): void {
    if (this.rejectionForm.valid && this.currentDelivery) {
      const reason = this.rejectionForm.value.reason;
      const notes = this.rejectionForm.value.notes;
      const fullReason = notes ? `${reason}: ${notes}` : reason;

      const request: ApprovalRequest = {
        status: 'rejected',
        reason: fullReason
      };

      this.adminService.rejectDelivery(this.currentDelivery._id, request).subscribe({
        next: (response) => {
          if (response.success) {
            this.toastService.success('Delivery partner rejected successfully', 'Rejection Successful');
            this.loadPendingDelivery();
            this.closeRejectionModal();
            this.closeModal();
          } else {
            this.toastService.error('Failed to reject delivery partner', 'Rejection Error');
          }
        },
        error: (error) => {
          this.toastService.showApiError(error, 'Error rejecting delivery');
        }
      });
    }
  }

  toggleDeliveryStatus(delivery: AdminDelivery): void {
    // Implementation for toggling delivery status
  }

  getWeekDays(): string[] {
    return ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  }
}
