import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { ProfileService, Order, OrdersResponse, OrderFilters } from '../../shared/services/profile.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-customer-orders',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './customer-orders.html',
  styleUrl: './customer-orders.scss'
})
export class CustomerOrders implements OnInit, OnDestroy {
  orders: Order[] = [];
  loading = true;
  errorMessage = '';
  filterForm: FormGroup;
  ordersData: OrdersResponse | null = null;
  showOrderDetails: { [key: string]: boolean } = {};
  private subscriptions: Subscription[] = [];

  constructor(
    private profileService: ProfileService,
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

    const ordersSub = this.profileService.getOrderHistory(filters).subscribe({
      next: (ordersData) => {
        this.ordersData = ordersData;
        this.orders = ordersData.orders;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
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
    return this.profileService.getOrderStatusText(status);
  }

  getStatusColor(status: string): string {
    return this.profileService.getOrderStatusColor(status);
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
    return `$${amount.toFixed(2)}`;
  }

  private hideMessageAfterDelay(): void {
    setTimeout(() => {
      this.clearMessages();
    }, 5000);
  }
}

