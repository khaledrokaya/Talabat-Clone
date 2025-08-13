import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { OrderService, OrderDetails as OrderDetailsResponse, OrderStatus, UpdateStatusRequest } from '../../shared/services/order.service';
import { AuthService } from '../../shared/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './order-details.html',
  styleUrl: './order-details.scss'
})
export class OrderDetailsComponent implements OnInit, OnDestroy {
  order: any = null;
  loading = true;
  errorMessage = '';
  successMessage = '';
  orderId = '';
  isRestaurantOwner = false;
  private subscriptions: Subscription[] = [];

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    // Initialize role from localStorage first for immediate UI update
    this.checkUserRoleFromStorage();

    // Then try to get fresh user data from API
    const userSub = this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.isRestaurantOwner = user?.role === 'restaurant_owner';
      },
      error: (error) => {
        // Keep the role from localStorage if API fails
        this.checkUserRoleFromStorage();
      }
    });
    this.subscriptions.push(userSub);
    this.orderId = this.route.snapshot.params['id'];
    if (this.orderId) {
      this.loadOrderDetails();
    } else {
      this.router.navigate(['/orders']);
    }
  }

  private checkUserRoleFromStorage(): void {
    try {
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        const user = JSON.parse(userStr);
        this.isRestaurantOwner = user?.role === 'restaurant_owner';
      } else {
        this.isRestaurantOwner = false;
      }
    } catch (error) {
      this.isRestaurantOwner = false;
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadOrderDetails(): void {
    this.loading = true;
    this.clearMessages();

    const orderSub = this.orderService.getOrderById(this.orderId).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.order = response.data;
        } else {
          this.errorMessage = response.message || 'Failed to load order details';
          this.toastService.error(this.errorMessage, 'Error');
        }
        this.loading = false;
      },
      error: (error: any) => {
        this.errorMessage = 'Failed to load order details';
        this.toastService.error(this.errorMessage, 'Error');
        this.loading = false;
        this.hideMessageAfterDelay();
      }
    });
    this.subscriptions.push(orderSub);
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

  getPaymentStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'pending': 'payment-pending',
      'paid': 'payment-paid',
      'failed': 'payment-failed',
      'refunded': 'payment-refunded'
    };
    return statusClasses[status] || 'payment-default';
  }

  trackOrder(): void {
    // Navigate to tracking page
    this.router.navigate(['/orders/tracking', this.orderId]);
  }

  cancelOrder(): void {
    if (confirm('Are you sure you want to cancel this order?')) {
      const cancelReason = 'Customer requested cancellation - Order cancelled by customer';

      const cancelSub = this.orderService.cancelOrder(this.orderId, cancelReason).subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = 'Order has been cancelled successfully';
            this.toastService.success(this.successMessage, 'Order Cancelled');
            this.loadOrderDetails(); // Reload to get updated status
            this.hideMessageAfterDelay();
          } else {
            this.errorMessage = response.message || 'Failed to cancel order';
            this.toastService.error(this.errorMessage, 'Cancellation Failed');
            this.hideMessageAfterDelay();
          }
        },
        error: (error) => {
          this.errorMessage = 'Failed to cancel order';
          this.toastService.error(this.errorMessage, 'Error');
          this.hideMessageAfterDelay();
        }
      });
      this.subscriptions.push(cancelSub);
    }
  }

  rateOrder(): void {
    // TODO: Implement rating functionality
  }

  // Restaurant owner specific methods
  updateOrderStatus(newStatus: OrderStatus): void {
    if (!this.isRestaurantOwner) {
      this.errorMessage = 'You are not authorized to perform this action';
      this.hideMessageAfterDelay();
      return;
    }

    // Use the actual order ID from the loaded order, not the route parameter
    const actualOrderId = this.order?._id || this.order?.id || this.orderId;

    const statusData: UpdateStatusRequest = {
      status: newStatus,
      notes: `Status updated by restaurant to ${this.getStatusText(newStatus)}`
    };

    const updateSub = this.orderService.updateOrderStatus(actualOrderId, statusData).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage = `Order status updated to ${this.getStatusText(newStatus)}`;
          this.toastService.success(this.successMessage, 'Status Updated');
          this.loadOrderDetails(); // Reload to get updated status
          this.hideMessageAfterDelay();
        } else {
          this.errorMessage = response.message || 'Failed to update order status';
          this.toastService.error(this.errorMessage, 'Update Failed');
          this.hideMessageAfterDelay();
        }
      },
      error: (error) => {
        let errorMessage = 'Failed to update order status';
        if (error.status === 404) {
          errorMessage = 'Order not found. This order may not exist or you may not have permission to update it.';
        } else if (error.status === 403) {
          errorMessage = 'You are not authorized to update this order.';
        } else if (error.status === 401) {
          errorMessage = 'Authentication required. Please log in again.';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }

        this.errorMessage = errorMessage;
        this.toastService.error(errorMessage, 'Update Error');
        this.hideMessageAfterDelay();
      }
    });
    this.subscriptions.push(updateSub);
  }

  confirmOrder(): void {
    this.updateOrderStatus('confirmed');
  }

  startPreparing(): void {
    this.updateOrderStatus('preparing');
  }

  markReady(): void {
    this.updateOrderStatus('ready');
  }

  markOutForDelivery(): void {
    this.updateOrderStatus('out_for_delivery');
  }

  markDelivered(): void {
    this.updateOrderStatus('delivered');
  }

  rejectOrder(): void {
    if (confirm('Are you sure you want to reject this order? This action cannot be undone.')) {
      this.updateOrderStatus('cancelled');
    }
  }

  formatCurrency(amount: number): string {
    return `${amount.toFixed(2)} EGP`;
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

  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  private hideMessageAfterDelay(): void {
    setTimeout(() => {
      this.clearMessages();
    }, 5000);
  }
}
