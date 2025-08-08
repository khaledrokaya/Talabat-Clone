import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { OrderService, OrderFilters, OrderStatus, ApiResponse, OrdersListResponse } from '../../shared/services/order.service';
import { Order } from '../../shared/models/order';
import { WebSocketService } from '../../shared/services/websocket.service';

@Component({
  selector: 'app-orders-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './orders-management.component.html',
  styleUrl: './orders-management.component.scss'
})
export class OrdersManagementComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  orders: Order[] = [];
  loading = false;
  pagination: any = null;

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

  selectedOrder: Order | null = null;
  showOrderModal = false;

  constructor(
    public orderService: OrderService,
    private fb: FormBuilder,
    private wsService: WebSocketService
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
    this.setupFormSubscriptions();
    this.setupWebSocketConnection();
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

  private setupWebSocketConnection() {
    // Listen for real-time order updates
    this.wsService.connect('orders');

    this.wsService.onMessage('order_status_updated')
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        this.updateOrderInList(data.orderId, data.status);
        this.loadOrderStats(); // Refresh stats
      });

    this.wsService.onMessage('new_order')
      .pipe(takeUntil(this.destroy$))
      .subscribe((orderData: any) => {
        this.loadOrders(); // Refresh orders list
        this.loadOrderStats(); // Refresh stats
      });
  }

  loadOrders() {
    this.loading = true;

    this.orderService.getOrders(this.currentFilters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse<OrdersListResponse>) => {
          if (response.success) {
            this.orders = response.data.orders;
            this.pagination = response.data.pagination;
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading orders:', error);
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
        next: (response: ApiResponse<OrdersListResponse>) => {
          if (response.success) {
            const orders = response.data.orders;
            this.orderStats = {
              pending: orders.filter(o => o.status === 'pending').length,
              preparing: orders.filter(o => o.status === 'preparing').length,
              ready: orders.filter(o => o.status === 'ready').length,
              total: orders.length
            };
          }
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

  viewOrderDetails(order: Order) {
    this.selectedOrder = order;
    this.showOrderModal = true;
  }

  closeOrderModal() {
    this.showOrderModal = false;
    this.selectedOrder = null;
  }

  updateOrderStatus(order: Order) {
    const nextStatus = this.orderService.getNextStatus(order.status);
    if (nextStatus) {
      this.orderService.updateOrderStatusEnhanced(order.id!, {
        status: nextStatus
      }).subscribe({
        next: () => {
          this.updateOrderInList(order.id!, nextStatus);
          this.loadOrderStats();
        }
      });
    }
  }

  cancelOrder(order: Order) {
    if (confirm('Are you sure you want to cancel this order?')) {
      this.orderService.cancelOrder(order.id!, {
        reason: 'Cancelled by restaurant'
      }).subscribe({
        next: () => {
          this.updateOrderInList(order.id!, 'cancelled');
          this.loadOrderStats();
        }
      });
    }
  }

  private updateOrderInList(orderId: string, newStatus: OrderStatus) {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      order.status = newStatus;
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
