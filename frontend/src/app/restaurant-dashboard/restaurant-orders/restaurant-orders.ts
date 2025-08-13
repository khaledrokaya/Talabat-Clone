import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService, OrderSummary, OrdersListResponse } from '../../shared/services/order.service';
import { ToastService } from '../../shared/services/toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-restaurant-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './restaurant-orders.html',
  styleUrls: ['./restaurant-orders.scss']
})
export class RestaurantOrders implements OnInit, OnDestroy {
  orders: OrderSummary[] = [];
  filteredOrders: OrderSummary[] = [];
  isLoading = true;
  activeFilter = 'all';
  searchTerm = '';
  errorMessage = '';

  showOrderModal = false;
  selectedOrder: any = null;

  private subscriptions: Subscription[] = [];

  constructor(private orderService: OrderService, private toastService: ToastService) { }

  ngOnInit(): void {
    this.loadOrders();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadOrders(): void {
    this.isLoading = true;
    this.clearMessages();

    // For restaurant orders, we'll use the same endpoint but could add restaurant-specific params
    const ordersSub = this.orderService.getUserOrders().subscribe({
      next: (response: OrdersListResponse) => {
        if (response.success) {
          this.orders = response.data.orders;
          this.filterOrders();
        } else {
          this.errorMessage = response.message || 'Failed to load orders';
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load orders';
        this.isLoading = false;
        this.hideMessageAfterDelay();
      }
    });
    this.subscriptions.push(ordersSub);
  }

  filterOrders(): void {
    let tempOrders = [...this.orders];

    // Apply status filter
    if (this.activeFilter !== 'all') {
      tempOrders = tempOrders.filter(order => order.status === this.activeFilter);
    }

    // Apply search term filter
    if (this.searchTerm) {
      const lowerCaseSearchTerm = this.searchTerm.toLowerCase();
      tempOrders = tempOrders.filter(order =>
        order.orderNumber.toLowerCase().includes(lowerCaseSearchTerm) ||
        order.restaurant?.name.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    this.filteredOrders = tempOrders;
  }

  setFilter(filter: string): void {
    this.activeFilter = filter;
    this.filterOrders();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.activeFilter = 'all';
    this.filterOrders();
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

  formatDate(dateString: string): string {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  }

  formatCurrency(amount: number): string {
    return `${amount.toFixed(2)} EGP`;
  }

  getTotalOrders(): number {
    return this.orders.length;
  }

  getPendingOrders(): number {
    return this.orders.filter(order => order.status === 'pending').length;
  }

  getConfirmedOrders(): number {
    return this.orders.filter(order => order.status === 'confirmed').length;
  }

  getPreparingOrders(): number {
    return this.orders.filter(order => order.status === 'preparing').length;
  }

  getReadyOrders(): number {
    return this.orders.filter(order => order.status === 'ready').length;
  }

  getOrdersByStatus(status: string): OrderSummary[] {
    return this.orders.filter(order => order.status === status);
  }

  updateOrderStatus(orderId: string, newStatus: string): void {
    const updateData = {
      status: newStatus as any,
      estimatedTime: this.getEstimatedTime(newStatus),
      notes: `Status updated to ${this.getStatusText(newStatus)}`
    };

    const updateSub = this.orderService.updateOrderStatus(orderId, updateData).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadOrders(); // Reload orders to reflect changes
          this.toastService.error(`Order status updated to ${this.getStatusText(newStatus)}`);
        } else {
          this.errorMessage = response.message || 'Failed to update order status';
          this.hideMessageAfterDelay();
        }
      },
      error: (error) => {
        this.errorMessage = 'Failed to update order status';
        this.hideMessageAfterDelay();
      }
    });
    this.subscriptions.push(updateSub);
  }

  private getEstimatedTime(status: string): number {
    // Return estimated time in minutes based on status
    switch (status) {
      case 'confirmed': return 5; // 5 minutes to start preparing
      case 'preparing': return 20; // 20 minutes to prepare
      case 'ready': return 30; // 30 minutes for delivery
      case 'out_for_delivery': return 15; // 15 minutes for delivery
      default: return 0;
    }
  }

  cancelOrder(orderId: string): void {
    if (confirm('Are you sure you want to cancel this order?')) {
      const cancelReason = 'Restaurant cancelled order - Order cancelled by restaurant';

      const cancelSub = this.orderService.cancelOrder(orderId, cancelReason).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadOrders();
            this.toastService.error('Order cancelled successfully');
          } else {
            this.errorMessage = response.message || 'Failed to cancel order';
            this.hideMessageAfterDelay();
          }
        },
        error: (error) => {
          this.errorMessage = 'Failed to cancel order';
          this.hideMessageAfterDelay();
        }
      });
      this.subscriptions.push(cancelSub);
    }
  }

  viewOrderDetails(orderId: string): void {
    const detailsSub = this.orderService.getOrderById(orderId).subscribe({
      next: (response) => {
        if (response.success) {
          this.selectedOrder = response.data.order;
          this.showOrderModal = true;
        } else {
          this.errorMessage = response.message || 'Failed to load order details';
          this.hideMessageAfterDelay();
        }
      },
      error: (error) => {
        this.errorMessage = 'Failed to load order details';
        this.hideMessageAfterDelay();
      }
    });
    this.subscriptions.push(detailsSub);
  }

  closeOrderModal(): void {
    this.showOrderModal = false;
    this.selectedOrder = null;
  }

  getNextStatusText(currentStatus: string): string {
    switch (currentStatus) {
      case 'pending': return 'Confirm Order';
      case 'confirmed': return 'Start Preparing';
      case 'preparing': return 'Mark Ready';
      case 'ready': return 'Out for Delivery';
      case 'out_for_delivery': return 'Mark Delivered';
      default: return '';
    }
  }

  getNextStatusIcon(currentStatus: string): string {
    switch (currentStatus) {
      case 'pending': return 'fas fa-check';
      case 'confirmed': return 'fas fa-utensils';
      case 'preparing': return 'fas fa-check-circle';
      case 'ready': return 'fas fa-truck';
      case 'out_for_delivery': return 'fas fa-check-double';
      default: return '';
    }
  }

  getNextStatusAction(order: OrderSummary): void {
    let nextStatus: string;
    switch (order.status) {
      case 'pending': nextStatus = 'confirmed'; break;
      case 'confirmed': nextStatus = 'preparing'; break;
      case 'preparing': nextStatus = 'ready'; break;
      case 'ready': nextStatus = 'out_for_delivery'; break;
      case 'out_for_delivery': nextStatus = 'delivered'; break;
      default: return;
    }
    this.updateOrderStatus(order._id, nextStatus);
  }

  canAdvanceStatus(status: string): boolean {
    return ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery'].includes(status);
  }

  canCancelOrder(status: string): boolean {
    return ['pending', 'confirmed'].includes(status);
  }

  private clearMessages(): void {
    this.errorMessage = '';
  }

  private hideMessageAfterDelay(): void {
    setTimeout(() => {
      this.clearMessages();
    }, 5000);
  }
}

