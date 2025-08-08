import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService, AdminOrder, OrderFilters } from '../../shared/services/admin.service';

@Component({
  selector: 'app-orders-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './orders-management.html',
  styleUrls: ['./orders-management.scss']
})
export class OrdersManagement implements OnInit {
  orders: AdminOrder[] = [];
  filteredOrders: AdminOrder[] = [];

  isLoading = true;
  errorMessage = '';
  successMessage = '';

  // Pagination
  currentPage = 1;
  totalPages = 0;
  totalOrders = 0;
  pageSize = 10;

  // Filters
  filters: OrderFilters = {
    status: undefined,
    paymentStatus: undefined,
    dateFrom: undefined,
    dateTo: undefined,
    page: 1,
    limit: 10,
    search: ''
  };

  // Modal states
  showOrderModal = false;
  showStatusModal = false;
  showCancelModal = false;

  // Current order being processed
  currentOrder: AdminOrder | null = null;
  currentOrderId = '';

  // Forms
  statusForm: FormGroup;
  cancelForm: FormGroup;

  // Filter options
  statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'preparing', label: 'Preparing' },
    { value: 'ready', label: 'Ready' },
    { value: 'picked_up', label: 'Picked Up' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  paymentStatusOptions = [
    { value: '', label: 'All Payment Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'paid', label: 'Paid' },
    { value: 'failed', label: 'Failed' },
    { value: 'refunded', label: 'Refunded' }
  ];

  constructor(
    private adminService: AdminService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.statusForm = this.fb.group({
      status: ['']
    });

    this.cancelForm = this.fb.group({
      reason: ['']
    });
  }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.adminService.getAllOrders(this.filters).subscribe({
      next: (response) => {
        if (response.success) {
          this.orders = response.data.orders;
          this.filteredOrders = [...this.orders];
          this.totalOrders = response.data.totalOrders;
          this.totalPages = response.data.totalPages;
          this.currentPage = response.data.currentPage;
        } else {
          this.errorMessage = 'Failed to load orders';
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error loading orders: ' + (error.error?.message || 'Unknown error');
        this.isLoading = false;
      }
    });
  }

  onFilterChange(): void {
    this.filters.page = 1;
    this.currentPage = 1;
    this.loadOrders();
  }

  onSearchChange(): void {
    if (this.filters.search && this.filters.search.length > 0) {
      this.filteredOrders = this.orders.filter(order =>
        order.id.toLowerCase().includes(this.filters.search!.toLowerCase()) ||
        order.customer.firstName.toLowerCase().includes(this.filters.search!.toLowerCase()) ||
        order.customer.lastName.toLowerCase().includes(this.filters.search!.toLowerCase()) ||
        order.restaurant.name.toLowerCase().includes(this.filters.search!.toLowerCase())
      );
    } else {
      this.filteredOrders = [...this.orders];
    }
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.filters.page = page;
      this.loadOrders();
    }
  }

  // Order Actions
  viewOrder(order: AdminOrder): void {
    this.currentOrder = order;
    this.showOrderModal = true;
  }

  updateStatus(order: AdminOrder): void {
    this.currentOrder = order;
    this.currentOrderId = order.id;
    this.statusForm.patchValue({
      status: order.status
    });
    this.showStatusModal = true;
  }

  cancelOrder(order: AdminOrder): void {
    this.currentOrder = order;
    this.currentOrderId = order.id;
    this.showCancelModal = true;
  }

  // Modal Actions
  closeModal(): void {
    this.showOrderModal = false;
    this.showStatusModal = false;
    this.showCancelModal = false;
    this.currentOrder = null;
    this.currentOrderId = '';
    this.clearMessages();
  }

  submitStatusUpdate(): void {
    if (this.statusForm.valid && this.currentOrderId) {
      const status = this.statusForm.value.status;

      this.adminService.updateOrderStatus(this.currentOrderId, status).subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = response.message;
            this.loadOrders();
            this.closeModal();
          } else {
            this.errorMessage = 'Failed to update order status';
          }
        },
        error: (error) => {
          this.errorMessage = 'Error updating order: ' + (error.error?.message || 'Unknown error');
        }
      });
    }
  }

  submitCancellation(): void {
    if (this.cancelForm.valid && this.currentOrderId) {
      const reason = this.cancelForm.value.reason;

      this.adminService.cancelOrder(this.currentOrderId, reason).subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = response.message;
            this.loadOrders();
            this.closeModal();
          } else {
            this.errorMessage = 'Failed to cancel order';
          }
        },
        error: (error) => {
          this.errorMessage = 'Error cancelling order: ' + (error.error?.message || 'Unknown error');
        }
      });
    }
  }

  // Utility Methods
  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'pending': return 'badge bg-warning';
      case 'confirmed': return 'badge bg-info';
      case 'preparing': return 'badge bg-primary';
      case 'ready': return 'badge bg-success';
      case 'picked_up': return 'badge bg-dark';
      case 'delivered': return 'badge bg-success';
      case 'cancelled': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  }

  getPaymentStatusBadgeClass(status: string): string {
    switch (status) {
      case 'pending': return 'badge bg-warning';
      case 'paid': return 'badge bg-success';
      case 'failed': return 'badge bg-danger';
      case 'refunded': return 'badge bg-info';
      default: return 'badge bg-secondary';
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString();
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

  canCancelOrder(order: AdminOrder): boolean {
    return ['pending', 'confirmed', 'preparing'].includes(order.status);
  }

  canUpdateStatus(order: AdminOrder): boolean {
    return order.status !== 'delivered' && order.status !== 'cancelled';
  }
}
