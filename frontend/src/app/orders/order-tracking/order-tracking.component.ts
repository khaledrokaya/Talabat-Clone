import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { ToastService } from '../../shared/services/toast.service';
import { OrderTrackingService, OrderUpdate } from '../../shared/services/order-tracking.service';
import { Subscription, interval } from 'rxjs';
import { OrderService } from '../../shared/services/order.service';

interface OrderStatus {
  status: string;
  timestamp: Date | null;
  completed: boolean;
  label?: string;
  description?: string;
  icon?: string;
}

interface OrderDetails {
  _id: string;
  orderNumber: string;
  status: string;
  customer: any;
  restaurant: any;
  deliveryPerson?: any;
  deliveryPersonId?: string;
  items: any[];
  totalAmount: number;
  deliveryFee?: number;
  tax?: number;
  discount?: number;
  deliveryAddress: any;
  estimatedDeliveryTime?: Date;
  statusHistory: any[];
  timeline?: any[];
  currentLocation?: {
    lat: number;
    lng: number;
  };
}

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './order-tracking.component.html',
  styleUrls: ['./order-tracking.component.scss']
})
export class OrderTrackingComponent implements OnInit, OnDestroy {
  order: OrderDetails | null = null;
  loading = true;
  error: string | null = null;
  deliveryLocation: { lat: number; lng: number } | null = null;

  orderSteps: OrderStatus[] = [
    {
      status: 'pending',
      timestamp: null,
      completed: false
    },
    {
      status: 'confirmed',
      timestamp: null,
      completed: false
    },
    {
      status: 'preparing',
      timestamp: null,
      completed: false
    },
    {
      status: 'ready',
      timestamp: null,
      completed: false
    },
    {
      status: 'assigned',
      timestamp: null,
      completed: false
    },
    {
      status: 'picked_up',
      timestamp: null,
      completed: false
    },
    {
      status: 'on_the_way',
      timestamp: null,
      completed: false
    },
    {
      status: 'delivered',
      timestamp: null,
      completed: false
    }
  ];

  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private orderTrackingService: OrderTrackingService,
    private toastService: ToastService,
    private OrderService: OrderService
  ) { }

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.loadOrderDetails(orderId);
      this.startRealTimeTracking(orderId);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.orderTrackingService.stopAllTracking();
  }

  private loadOrderDetails(orderId: string): void {
    this.subscriptions.push(
      this.OrderService.trackOrder(orderId).subscribe({
        next: (response: any) => {
          this.order = response.data;
          this.updateOrderSteps();
          this.loading = false;
        },
        error: (error: any) => {
          this.error = 'Order not found or you do not have permission to view it.';
          this.loading = false;
        }
      })
    );
  }

  private startRealTimeTracking(orderId: string): void {
    // Start tracking this order for real-time updates
    this.orderTrackingService.startTracking(orderId);

    // Subscribe to order updates
    this.subscriptions.push(
      this.orderTrackingService.getOrderUpdates().subscribe({
        next: (updates: OrderUpdate[]) => {
          const currentOrderUpdate = updates.find(update => update.orderId === orderId);
          if (currentOrderUpdate && this.order && currentOrderUpdate.status !== this.order.status) {
            // Update order status and refresh data
            this.order.status = currentOrderUpdate.status;
            this.updateOrderSteps();

            // Show notification
            this.showStatusNotification(currentOrderUpdate.message || '');
          }
        },
        error: (error) => {
        }
      })
    );

    // Also poll manually every 30 seconds for backup
    this.subscriptions.push(
      interval(30000).subscribe(() => {
        if (this.order && !this.isOrderCompleted()) {
          this.refreshOrderData(orderId);
        }
      })
    );
  }

  private refreshOrderData(orderId: string): void {
    this.OrderService.trackOrder(orderId).subscribe({
      next: (response: any) => {
        if (response.data && response.data.status !== this.order?.status) {
          this.order = response.data;
          this.updateOrderSteps();
        }
      },
      error: (error: any) => {
      }
    });
  }

  private showStatusNotification(message: string): void {
    // Simple notification - can be enhanced with a proper notification service
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Order Update', {
        body: message,
        icon: '/favicon.ico'
      });
    }
  }

  private isOrderCompleted(): boolean {
    return this.order?.status === 'delivered' || this.order?.status === 'cancelled';
  }

  private updateOrderSteps(): void {
    if (!this.order) return;

    const statusOrder = ['pending', 'confirmed', 'preparing', 'ready', 'assigned', 'picked_up', 'on_the_way', 'delivered'];
    const currentIndex = statusOrder.indexOf(this.order.status);

    this.orderSteps = this.orderSteps.map((step, index) => {
      const stepIndex = statusOrder.indexOf(step.status);
      return {
        ...step,
        completed: stepIndex <= currentIndex,
        label: this.getStepLabel(step.status),
        description: this.getStepDescription(step.status),
        icon: this.getStepIcon(step.status),
        timestamp: this.getStepTimestamp(step.status)
      };
    });
  }

  private getStepLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'pending': 'Order Placed',
      'confirmed': 'Order Confirmed',
      'preparing': 'Preparing Food',
      'ready': 'Ready for Pickup',
      'assigned': 'Driver Assigned',
      'picked_up': 'Order Picked Up',
      'on_the_way': 'On the Way',
      'delivered': 'Delivered'
    };
    return labels[status] || status;
  }

  private getStepDescription(status: string): string {
    const descriptions: { [key: string]: string } = {
      'pending': 'Your order has been received',
      'confirmed': 'Restaurant confirmed your order',
      'preparing': 'Your food is being prepared',
      'ready': 'Your order is ready for pickup',
      'assigned': 'A delivery driver has been assigned',
      'picked_up': 'Driver has picked up your order',
      'on_the_way': 'Your order is on the way',
      'delivered': 'Your order has been delivered'
    };
    return descriptions[status] || '';
  }

  getStepIcon(status: string): string {
    const icons: { [key: string]: string } = {
      'pending': 'fas fa-clock',
      'confirmed': 'fas fa-check',
      'preparing': 'fas fa-utensils',
      'ready': 'fas fa-bell',
      'assigned': 'fas fa-user',
      'picked_up': 'fas fa-box',
      'on_the_way': 'fas fa-truck',
      'delivered': 'fas fa-check-circle'
    };
    return icons[status] || 'fas fa-circle';
  }

  private getStepTimestamp(status: string): Date | null {
    if (!this.order) return null;

    // First check timeline array
    const timeline = this.order.timeline || [];
    const timelineEntry = timeline.find(entry => entry.status === status);
    if (timelineEntry) {
      return new Date(timelineEntry.timestamp);
    }

    // Fallback to statusHistory
    const statusHistory = this.order.statusHistory || [];
    const statusEntry = statusHistory.find(entry => entry.status === status);
    return statusEntry ? new Date(statusEntry.timestamp) : null;
  }

  showLiveTracking(): boolean {
    return this.order?.status === 'on_the_way' || this.order?.status === 'picked_up';
  }

  isCurrentStep(status: string): boolean {
    return this.order?.status === status;
  }

  getStatusLabel(status: string): string {
    return this.getStepLabel(status);
  }

  getSubtotal(): number {
    if (!this.order) return 0;
    return this.order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  canCancelOrder(): boolean {
    if (!this.order) return false;
    return ['pending', 'confirmed'].includes(this.order.status);
  }

  cancelOrder(): void {
    if (!this.order || !this.canCancelOrder()) return;

    if (confirm('Are you sure you want to cancel this order?')) {
      // For now, we'll just show a message since cancel endpoint might not be available
      this.toastService.error('Please contact customer service to cancel your order.');
      // this.subscriptions.push(
      //   this.deliveryService.cancelOrder(this.order._id).subscribe({
      //     next: (response: any) => {
      //       if (this.order) {
      //         this.order.status = 'cancelled';
      //         this.updateOrderSteps();
      //       }
      //     },
      //     error: (error: any) => {
      //       this.toastService.error('Failed to cancel order. Please try again.');
      //     }
      //   })
      // );
    }
  }

  callDeliveryPerson(): void {
    if (this.order?.deliveryPerson?.phone) {
      window.open(`tel:${this.order.deliveryPerson.phone}`);
    }
  }
}
