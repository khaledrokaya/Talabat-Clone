import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { OrderService, OrdersListResponse, OrderSummary } from '../../shared/services/order.service';
import { Subscription } from 'rxjs';

interface OrderFilters {
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

@Component({
  selector: 'app-customer-orders',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './customer-orders.html',
  styleUrl: './customer-orders.scss'
})
export class CustomerOrders implements OnInit, OnDestroy {
  orders: OrderSummary[] = [];
  loading = true;
  errorMessage = '';
  filterForm: FormGroup;
  ordersData: OrdersListResponse | null = null;
  showOrderDetails: { [key: string]: boolean } = {};
  private subscriptions: Subscription[] = [];

  constructor(
    private orderService: OrderService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.createFilterForm();
  }

  ngOnInit(): void {
    this.loadOrders();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private createFilterForm(): FormGroup {
    return this.fb.group({
      status: [''],
      startDate: [''],
      endDate: [''],
      page: [1],
      limit: [10]
    });
  }

  loadOrders(filters?: OrderFilters): void {
    this.loading = true;
    this.clearMessages();

    const params: any = {};
    if (filters?.status) params.status = filters.status;
    if (filters?.startDate) params.startDate = filters.startDate;
    if (filters?.endDate) params.endDate = filters.endDate;
    if (filters?.page) params.page = filters.page;
    if (filters?.limit) params.limit = filters.limit;

    const ordersSub = this.orderService.getUserOrders(params).subscribe({
      next: (ordersData: any) => {
        this.ordersData = ordersData;

        // Handle different response structures
        if (ordersData.data && Array.isArray(ordersData.data)) {
          // Direct array in data property
          this.orders = ordersData.data;
        } else if (ordersData.data && ordersData.data.orders) {
          // Nested under data.orders
          this.orders = ordersData.data.orders;
        } else if (Array.isArray(ordersData)) {
          // Direct array response
          this.orders = ordersData;
        } else {
          this.orders = [];
        }

        this.loading = false;
      },
      error: (error: any) => {
        this.errorMessage = 'Failed to load orders';
        this.loading = false;
        this.hideMessageAfterDelay();
      }
    });
    this.subscriptions.push(ordersSub);
  }

  onFilterChange(): void {
    const filters: OrderFilters = {
      status: this.filterForm.value.status || undefined,
      startDate: this.filterForm.value.startDate || undefined,
      endDate: this.filterForm.value.endDate || undefined,
      page: 1,
      limit: this.filterForm.value.limit
    };
    this.loadOrders(filters);
  }

  onPageChange(page: number): void {
    const filters: OrderFilters = {
      status: this.filterForm.value.status || undefined,
      startDate: this.filterForm.value.startDate || undefined,
      endDate: this.filterForm.value.endDate || undefined,
      page,
      limit: this.filterForm.value.limit
    };
    this.loadOrders(filters);
  }

  toggleOrderDetails(orderId: string): void {
    this.showOrderDetails[orderId] = !this.showOrderDetails[orderId];
  }

  getStatusText(status: string): string {
    const statusTexts: { [key: string]: string } = {
      'pending': 'Pending',
      'confirmed': 'Confirmed',
      'preparing': 'Preparing',
      'ready': 'Ready for Pickup',
      'out_for_delivery': 'Out for Delivery',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled'
    };
    return statusTexts[status] || status;
  }

  getStatusColor(status: string): string {
    const statusColors: { [key: string]: string } = {
      'pending': '#f39c12',
      'confirmed': '#3498db',
      'preparing': '#9b59b6',
      'ready': '#2ecc71',
      'out_for_delivery': '#e74c3c',
      'delivered': '#27ae60',
      'cancelled': '#95a5a6'
    };
    return statusColors[status] || '#95a5a6';
  }

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'pending': 'status-pending',
      'confirmed': 'status-confirmed',
      'preparing': 'status-preparing',
      'ready': 'status-ready',
      'out_for_delivery': 'status-delivery',
      'delivered': 'status-delivered',
      'cancelled': 'status-cancelled'
    };
    return statusClasses[status] || 'status-default';
  }

  rateOrder(orderId: string): void {
    // TODO: Implement rating functionality
  }

  trackByOrderId(index: number, order: OrderSummary): string {
    return order._id;
  }

  get pagination() {
    return this.ordersData?.data?.pagination;
  }

  trackOrder(orderId: string): void {
    // TODO: Implement tracking functionality
  }

  private clearMessages(): void {
    this.errorMessage = '';
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatCurrency(amount: number): string {
    return `${amount.toFixed(2)} EGP`;
  }

  getOrderItemsCount(order: OrderSummary): number {
    return order.items?.length || 0;
  }

  hasMoreThanThreeItems(order: OrderSummary): boolean {
    return this.getOrderItemsCount(order) > 3;
  }

  getExtraItemsCount(order: OrderSummary): number {
    const count = this.getOrderItemsCount(order);
    return count > 3 ? count - 3 : 0;
  }

  private hideMessageAfterDelay(): void {
    setTimeout(() => {
      this.clearMessages();
    }, 5000);
  }
}

