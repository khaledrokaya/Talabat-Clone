import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AdminService, PendingRestaurant, PendingDelivery, ApprovalRequest } from '../../shared/services/admin.service';

@Component({
  selector: 'app-approvals-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './approvals-management.html',
  styleUrls: ['./approvals-management.scss']
})
export class ApprovalsManagement implements OnInit {
  pendingRestaurants: PendingRestaurant[] = [];
  pendingDelivery: PendingDelivery[] = [];

  isLoading = true;
  errorMessage = '';
  successMessage = '';

  activeTab = 'restaurants';

  // Modal states
  showApprovalModal = false;
  showDetailsModal = false;

  // Current item being processed
  currentItem: PendingRestaurant | PendingDelivery | null = null;
  currentItemId = '';
  currentItemType: 'restaurant' | 'delivery' = 'restaurant';

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
    this.loadPendingApprovals();
  }

  loadPendingApprovals(): void {
    this.isLoading = true;
    this.errorMessage = '';

    forkJoin({
      restaurants: this.adminService.getPendingRestaurants(),
      delivery: this.adminService.getPendingDeliveryUsers()
    }).subscribe({
      next: (response) => {
        if (response.restaurants.success && response.delivery.success) {
          this.pendingRestaurants = response.restaurants.data;
          this.pendingDelivery = response.delivery.data;
        } else {
          this.errorMessage = 'Failed to load pending approvals';
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error loading pending approvals: ' + (error.error?.message || 'Unknown error');
        this.isLoading = false;
      }
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  // Approval Actions
  viewDetails(item: PendingRestaurant | PendingDelivery, type: 'restaurant' | 'delivery'): void {
    this.currentItem = item;
    this.currentItemType = type;
    this.showDetailsModal = true;
  }

  approveItem(item: PendingRestaurant | PendingDelivery, type: 'restaurant' | 'delivery'): void {
    this.currentItem = item;
    this.currentItemId = item.id;
    this.currentItemType = type;
    this.approvalForm.patchValue({
      status: 'verified',
      reason: ''
    });
    this.showApprovalModal = true;
  }

  rejectItem(item: PendingRestaurant | PendingDelivery, type: 'restaurant' | 'delivery'): void {
    this.currentItem = item;
    this.currentItemId = item.id;
    this.currentItemType = type;
    this.approvalForm.patchValue({
      status: 'rejected',
      reason: ''
    });
    this.showApprovalModal = true;
  }

  // Modal Actions
  closeModal(): void {
    this.showApprovalModal = false;
    this.showDetailsModal = false;
    this.currentItem = null;
    this.currentItemId = '';
    this.clearMessages();
  }

  submitApproval(): void {
    if (this.approvalForm.valid && this.currentItemId) {
      const request: ApprovalRequest = this.approvalForm.value;

      const approvalObservable = this.currentItemType === 'restaurant'
        ? this.adminService.approveRestaurant(this.currentItemId, request)
        : this.adminService.approveDelivery(this.currentItemId, request);

      approvalObservable.subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = response.message;
            this.loadPendingApprovals();
            this.closeModal();
          } else {
            this.errorMessage = 'Failed to process approval';
          }
        },
        error: (error) => {
          this.errorMessage = 'Error processing approval: ' + (error.error?.message || 'Unknown error');
        }
      });
    }
  }

  // Utility Methods
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  getTotalPendingCount(): number {
    return this.pendingRestaurants.length + this.pendingDelivery.length;
  }

  getVehicleIcon(vehicleType: string): string {
    switch (vehicleType) {
      case 'car': return 'fas fa-car';
      case 'motorcycle': return 'fas fa-motorcycle';
      case 'bicycle': return 'fas fa-bicycle';
      default: return 'fas fa-question';
    }
  }

  isRestaurant(item: any): item is PendingRestaurant {
    return 'restaurantName' in item;
  }

  isDelivery(item: any): item is PendingDelivery {
    return 'vehicleInfo' in item;
  }
}
