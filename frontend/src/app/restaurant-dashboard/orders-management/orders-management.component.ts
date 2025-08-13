import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { OrderService, OrderFilters, OrderStatus, ApiResponse, OrdersListResponse, OrderSummary } from '../../shared/services/order.service';
import { ToastService } from '../../shared/services/toast.service';
import { Order } from '../../shared/models/order';

@Component({
  selector: 'app-orders-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './orders-management.component.html',
  styleUrl: './orders-management.component.scss'
})
export class OrdersManagementComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  orders: OrderSummary[] = [];
  loading = false;
  pagination: any = null;
  openDropdownId: string | null = null;

  filterForm: FormGroup;
  currentFilters: OrderFilters = {
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  };

  orderStats = {
    pending: 0,
    preparing: 0,
    ready: 0,
    total: 0
  };

  selectedOrder: any | null = null;
  showOrderModal = false;

  constructor(
    public orderService: OrderService,
    private fb: FormBuilder,
    private toastService: ToastService
  ) {
    this.filterForm = this.fb.group({
      status: [''],
      dateFrom: [''],
      dateTo: [''],
      sortBy: ['createdAt'],
      sortOrder: ['desc']
    });
  }

  ngOnInit() {
    // Initialize orders array to prevent undefined errors
    this.orders = [];

    this.setupFormSubscriptions();
    this.loadOrders();
    this.loadOrderStats();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupFormSubscriptions() {
    this.filterForm.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(filters => {
        this.currentFilters = {
          ...this.currentFilters,
          ...filters,
          page: 1 // Reset to first page when filters change
        };
        this.loadOrders();
      });
  }

  loadOrders() {
    this.loading = true;

    this.orderService.getOrders(this.currentFilters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.success && response.data) {
            // Handle both response formats: direct array or nested orders
            if (Array.isArray(response.data)) {
              this.orders = response.data || [];
              this.pagination = response.meta || null;
            } else {
              this.orders = response.data.orders || [];
              this.pagination = response.data.pagination || response.meta || null;
            }
          } else {
            this.orders = [];
            this.pagination = null;
          }
          this.loading = false;
        },
        error: (error) => {
          this.orders = [];
          this.pagination = null;
          this.loading = false;
        }
      });
  }

  loadOrderStats() {
    const today = new Date().toISOString().split('T')[0];
    const statsFilters: OrderFilters = {
      dateFrom: today,
      dateTo: today,
      limit: 1000 // Get all orders for today
    };

    this.orderService.getOrders(statsFilters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.success && response.data) {
            // Handle both response formats: direct array or nested orders
            let orders: any[] = [];
            if (Array.isArray(response.data)) {
              orders = response.data;
            } else if (response.data.orders) {
              orders = response.data.orders;
            }

            this.orderStats = {
              pending: orders.filter(o => o.status === 'pending').length,
              preparing: orders.filter(o => o.status === 'preparing').length,
              ready: orders.filter(o => o.status === 'ready').length,
              total: orders.length
            };
          } else {
            this.orderStats = {
              pending: 0,
              preparing: 0,
              ready: 0,
              total: 0
            };
          }
        },
        error: (error) => {
          this.orderStats = {
            pending: 0,
            preparing: 0,
            ready: 0,
            total: 0
          };
        }
      });
  }

  refreshOrders() {
    this.loadOrders();
    this.loadOrderStats();
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.pagination.pages) {
      this.currentFilters.page = page;
      this.loadOrders();
    }
  }

  getPageNumbers(): number[] {
    if (!this.pagination) return [];

    const pages: number[] = [];
    const maxVisible = 5;
    const current = this.pagination.page;
    const total = this.pagination.pages;

    let start = Math.max(1, current - Math.floor(maxVisible / 2));
    let end = Math.min(total, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  viewOrderDetails(order: OrderSummary) {
    // Navigate to order details page
    window.open(`/orders/details/${order._id}`, "_self");
  }

  closeOrderModal() {
    this.showOrderModal = false;
    this.selectedOrder = null;
  }

  updateOrderStatus(order: OrderSummary) {
    const nextStatus = this.orderService.getNextStatus(order.status);
    if (nextStatus) {
      this.orderService.updateOrderStatusEnhanced(order._id!, {
        status: nextStatus
      }).subscribe({
        next: () => {
          this.updateOrderInList(order._id!, nextStatus);
          this.loadOrderStats();
        }
      });
    }
  }

  updateOrderToStatus(order: OrderSummary, newStatus: OrderStatus) {
    if (confirm(`Are you sure you want to update this order to ${newStatus}?`)) {
      this.orderService.updateOrderStatusEnhanced(order._id!, {
        status: newStatus
      }).subscribe({
        next: () => {
          this.updateOrderInList(order._id!, newStatus);
          this.loadOrderStats();
          this.closeDropdown(); // Close dropdown after successful update
        },
        error: (error) => {
          this.toastService.error('Failed to update order status. Please try again.');
        }
      });
    }
  }

  toggleDropdown(orderId: string) {
    if (this.openDropdownId === orderId) {
      this.closeDropdown();
    } else {
      this.openDropdownId = orderId;
    }
  }

  closeDropdown() {
    this.openDropdownId = null;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown')) {
      this.closeDropdown();
    }
  }

  cancelOrder(order: OrderSummary) {
    if (confirm('Are you sure you want to cancel this order?')) {
      this.orderService.cancelOrder(order._id!, 'Cancelled by restaurant').subscribe({
        next: () => {
          this.updateOrderInList(order._id!, 'cancelled');
          this.loadOrderStats();
        }
      });
    }
  }

  private updateOrderInList(orderId: string, newStatus: OrderStatus) {
    if (this.orders && this.orders.length > 0) {
      const order = this.orders.find(o => o._id === orderId);
      if (order) {
        order.status = newStatus;
      }
    }
  }

  onOrderStatusUpdated(event: { orderId: string, status: OrderStatus }) {
    this.updateOrderInList(event.orderId, event.status);
    this.loadOrderStats();
  }

  onOrderCancelled(orderId: string) {
    this.updateOrderInList(orderId, 'cancelled');
    this.closeOrderModal();
    this.loadOrderStats();
  }

  formatTime(dateString: string | Date): string {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDate(dateString: string | Date): string {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('en-US');
  }

  min(a: number, b: number): number {
    return Math.min(a, b);
  }

  getStatusColor(status: OrderStatus): string {
    return this.orderService.getStatusColor(status);
  }

  getStatusText(status: OrderStatus): string {
    return this.orderService.getStatusText(status);
  }

  canUpdateStatus(status: OrderStatus): boolean {
    return this.orderService.canUpdateStatus(status);
  }

  canCancelOrder(status: OrderStatus): boolean {
    return this.orderService.canCancelOrder(status);
  }
}
