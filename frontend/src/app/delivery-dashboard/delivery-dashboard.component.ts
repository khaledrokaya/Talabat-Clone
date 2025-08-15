import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DeliveryService } from '../shared/services/delivery.service';
import { ToastService } from '../shared/services/toast.service';
import {
  DeliveryOrder,
  DeliveryEarnings,
  DeliveryStats,
  OrderFilters
} from '../shared/models/delivery.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-delivery-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './delivery-dashboard.component.html',
  styleUrls: ['./delivery-dashboard.component.scss']
})
export class DeliveryDashboardComponent implements OnInit, OnDestroy {
  isOnline = false;
  updatingLocation = false;
  lastLocationUpdate: Date | null = null;

  stats: DeliveryStats | null = null;
  earnings: DeliveryEarnings | null = null;
  availableOrders: DeliveryOrder[] = [];
  myOrders: DeliveryOrder[] = [];

  selectedStatus = '';
  selectedPeriod = 'week';

  periods = [
    { label: 'Today', value: 'day' },
    { label: 'Week', value: 'week' },
    { label: 'Month', value: 'month' }
  ];

  private subscriptions: Subscription[] = [];

  constructor(
    private deliveryService: DeliveryService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.loadDeliveryStatus();
    this.loadDashboardData();
  }

  private loadDeliveryStatus(): void {
    this.subscriptions.push(
      this.deliveryService.getDeliveryStatus().subscribe({
        next: (response) => {
          this.isOnline = response.data.isOnline || false;
          if (response.data.currentLocation?.lastUpdated) {
            this.lastLocationUpdate = new Date(response.data.currentLocation.lastUpdated);
          }
        },
        error: (error) => {
          // If error loading status, default to offline
          this.isOnline = false;
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadDashboardData(): void {
    // Load stats
    this.subscriptions.push(
      this.deliveryService.getStats().subscribe({
        next: (response) => {
          this.stats = response.data;
        },
      })
    );

    // Load earnings
    this.loadEarnings();

    // Load orders
    this.loadOrders();
  }

  private loadEarnings(): void {
    this.subscriptions.push(
      this.deliveryService.getEarnings(this.selectedPeriod).subscribe({
        next: (response) => {
          this.earnings = response.data;

          // If the detailed earnings shows 0, try to get simple earnings for verification
          if (this.earnings && this.earnings.totalEarnings === 0) {
            this.loadSimpleEarnings();
          }
        },
        error: (error) => {
          // Fallback to simple earnings if detailed fails
          this.loadSimpleEarnings();
        }
      })
    );
  }

  private loadSimpleEarnings(): void {
    this.subscriptions.push(
      this.deliveryService.getSimpleEarnings().subscribe({
        next: (response) => {
          if (response.data.totalEarnings > 0) {
            // Use simple earnings data to create a basic earnings object
            this.earnings = {
              totalEarnings: response.data.totalEarnings,
              deliveryCount: 0, // Will be updated when we get stats
              breakdown: []
            };
          }
        },
        error: (error) => {
          console.error('Error loading simple earnings:', error);
        }
      })
    );
  }

  loadOrders(): void {
    // Load available orders using the new endpoint
    this.subscriptions.push(
      this.deliveryService.getAvailableOrders(1, 10, 10).subscribe({
        next: (response) => {
          this.availableOrders = response.data.orders;
        },
        error: (error) => {
          // Try loading orders with different approach
          this.loadOrdersFallback();
        }
      })
    );

    // Load my orders (orders assigned to me)
    this.subscriptions.push(
      this.deliveryService.getOrders({ status: this.selectedStatus || undefined }).subscribe({
        next: (response) => {
          // Don't apply additional filtering - show all orders that are assigned to this delivery person
          // The backend should only return orders assigned to this delivery person
          this.myOrders = response.data.orders;
        },
      })
    );
  }

  private loadOrdersFallback(): void {
    // Try loading orders with 'pending' status which might show ready orders
    this.subscriptions.push(
      this.deliveryService.getOrders({ status: 'pending' }).subscribe({
        next: (response) => {
          this.availableOrders = response.data.orders.filter(order =>
            ['ready', 'confirmed'].includes(order.status)
          );
        },
        error: (error) => {
          // Try loading ALL orders to see what's available
          this.loadAllOrdersForDebugging();
        }
      })
    );
  }

  private loadAllOrdersForDebugging(): void {
    this.subscriptions.push(
      this.deliveryService.getOrders({}).subscribe({
        next: (response) => {
          // Filter manually for debugging
          const readyOrders = response.data.orders.filter(order =>
            ['ready', 'confirmed'].includes(order.status)
          );
          this.availableOrders = readyOrders;
        },
      })
    );
  }

  toggleAvailability(event: any): void {
    this.isOnline = event.target.checked;

    this.subscriptions.push(
      this.deliveryService.updateAvailability({ isOnline: this.isOnline }).subscribe({
        next: (response) => {
          // Reload status to ensure consistency
          this.loadDeliveryStatus();
          // Reload orders when going online
          if (this.isOnline) {
            this.loadOrders();
          }
        },
        error: (error) => {
          // Revert toggle on error
          this.isOnline = !this.isOnline;
          event.target.checked = this.isOnline;
        }
      })
    );
  }

  updateCurrentLocation(): void {
    if (!navigator.geolocation) {
      this.toastService.error('Geolocation is not supported by this browser');
      return;
    }

    this.updatingLocation = true;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          coordinates: [position.coords.longitude, position.coords.latitude] as [number, number]
        };

        this.subscriptions.push(
          this.deliveryService.updateLocation(location).subscribe({
            next: (response) => {
              this.lastLocationUpdate = new Date();
              this.updatingLocation = false;
              // Refresh orders after location update
              this.loadOrders();
            },
            error: (error) => {
              this.updatingLocation = false;
            }
          })
        );
      },
      (error) => {
        this.updatingLocation = false;
        this.toastService.error('Could not get your location. Please enable location services.');
      }
    );
  }

  refreshStatus(): void {
    this.loadDeliveryStatus();
    this.loadOrders();
  }

  acceptOrder(orderId: string): void {
    this.subscriptions.push(
      this.deliveryService.acceptOrder(orderId).subscribe({
        next: (response) => {
          this.loadOrders(); // Refresh orders
        },
        error: (error) => {
          this.toastService.error('Failed to accept order. Please try again.');
        }
      })
    );
  }

  updateOrderStatus(orderId: string, status: string): void {
    this.subscriptions.push(
      this.deliveryService.updateOrderStatus(orderId, { status: status as any }).subscribe({
        next: (response) => {
          // Immediately refresh orders to show updated status
          this.loadOrders();
          // Also refresh status to ensure consistency
          this.loadDeliveryStatus();
        },
        error: (error) => {
          this.toastService.error('Failed to update order status. Please try again.');
        }
      })
    );
  }

  onFilterChange(): void {
    this.loadOrders();
  }

  selectPeriod(period: string): void {
    this.selectedPeriod = period;
    this.loadEarnings();
  }

  canUpdateStatus(status: string): boolean {
    // Define allowed status transitions for delivery person
    const allowedTransitions: { [key: string]: string[] } = {
      'assigned': ['picked_up'],
      'picked_up': ['on_the_way'],
      'on_the_way': ['delivered']
    };

    return Object.keys(allowedTransitions).includes(status);
  }

  getNextStatus(currentStatus: string): string | null {
    const nextStatus: { [key: string]: string } = {
      'assigned': 'picked_up',
      'picked_up': 'on_the_way',
      'on_the_way': 'delivered'
    };

    return nextStatus[currentStatus] || null;
  }

  getStatusButtonText(status: string): string {
    const buttonTexts: { [key: string]: string } = {
      'assigned': 'Mark as Picked Up',
      'picked_up': 'Mark as On the Way',
      'on_the_way': 'Mark as Delivered'
    };

    return buttonTexts[status] || 'Update Status';
  }

  getStatusBadgeClass(status: string): string {
    const badgeClasses: { [key: string]: string } = {
      'ready': 'badge-warning',
      'assigned': 'badge-info',
      'picked_up': 'badge-primary',
      'on_the_way': 'badge-secondary',
      'delivered': 'badge-success'
    };

    return badgeClasses[status] || 'badge-secondary';
  }

  getStatusIcon(status: string): string {
    const statusIcons: { [key: string]: string } = {
      'ready': 'fa-clock',
      'assigned': 'fa-clipboard-list',
      'picked_up': 'fa-hand-holding',
      'on_the_way': 'fa-shipping-fast',
      'delivered': 'fa-check-circle'
    };

    return statusIcons[status] || 'fa-question-circle';
  }

  getNextStatusIcon(status: string): string {
    const nextStatusIcons: { [key: string]: string } = {
      'assigned': 'fa-hand-holding',
      'picked_up': 'fa-shipping-fast',
      'on_the_way': 'fa-check-circle'
    };

    return nextStatusIcons[status] || 'fa-arrow-right';
  }

  formatStatus(status: string): string {
    const statusLabels: { [key: string]: string } = {
      'ready': 'Ready for Pickup',
      'assigned': 'Assigned to You',
      'picked_up': 'Picked Up',
      'on_the_way': 'On the Way',
      'delivered': 'Delivered'
    };

    return statusLabels[status] || status;
  }

  // Helper method to get estimated earnings for an order
  getOrderEarnings(order: any): number {
    return order.deliveryFee || 0;
  }

  // Helper method to format delivery address
  formatAddress(address: any): string {
    if (!address) return 'No address provided';
    return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`;
  }

  // Helper method to get order duration
  getOrderDuration(order: any): string {
    if (!order.createdAt) return '';

    const now = new Date();
    const orderTime = new Date(order.createdAt);
    const diffInMinutes = Math.floor((now.getTime() - orderTime.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`;
    } else {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ${diffInMinutes % 60}m ago`;
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  // Helper method to call customer
  callCustomer(phone: string): void {
    if (phone) {
      window.open(`tel:${phone}`);
    }
  }

  // Helper method to call restaurant
  callRestaurant(phone: string): void {
    if (phone) {
      window.open(`tel:${phone}`);
    }
  }

  // Helper method to view order details (navigate to order details page)
  viewOrderDetails(orderId: string): void {
    // Track order and show details
    this.subscriptions.push(
      this.deliveryService.trackOrder(orderId).subscribe({
        next: (response) => {
          // You can implement a modal or navigation here
          // For now, log the details
        },
        error: (error) => {
          this.toastService.error('Could not load order details. Please try again.');
        }
      })
    );
  }

  // Helper method to calculate bar height for earnings chart
  getBarHeight(earnings: number): number {
    if (!this.earnings?.breakdown || this.earnings.breakdown.length === 0) {
      return 0;
    }

    const maxEarnings = Math.max(...this.earnings.breakdown.map(day => day.earnings));
    if (maxEarnings === 0) return 0;

    return (earnings / maxEarnings) * 100;
  }
}
