import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DeliveryService } from '../shared/services/delivery.service';
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
    private deliveryService: DeliveryService
  ) { }

  ngOnInit(): void {
    this.loadDeliveryStatus();
    this.loadDashboardData();
  }

  private loadDeliveryStatus(): void {
    console.log('Loading delivery status...');
    this.subscriptions.push(
      this.deliveryService.getDeliveryStatus().subscribe({
        next: (response) => {
          console.log('Delivery status loaded:', response.data);
          this.isOnline = response.data.isOnline || false;
          if (response.data.currentLocation?.lastUpdated) {
            this.lastLocationUpdate = new Date(response.data.currentLocation.lastUpdated);
          }
        },
        error: (error) => {
          console.error('Error loading delivery status:', error);
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
    console.log('Loading dashboard data...');
    // Load stats
    this.subscriptions.push(
      this.deliveryService.getStats().subscribe({
        next: (response) => {
          this.stats = response.data;
          console.log('Stats loaded:', this.stats);
        },
        error: (error) => console.error('Error loading stats:', error)
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
        },
        error: (error) => console.error('Error loading earnings:', error)
      })
    );
  }

  loadOrders(): void {
    console.log('Loading orders... isOnline:', this.isOnline);
    // Load available orders using the new endpoint
    this.subscriptions.push(
      this.deliveryService.getAvailableOrders(1, 10, 10).subscribe({
        next: (response) => {
          console.log('Available orders response:', response);
          this.availableOrders = response.data.orders;
          console.log('Available orders count:', this.availableOrders.length);
        },
        error: (error) => {
          console.error('Error loading available orders:', error);
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
          console.log('My orders loaded:', this.myOrders.length);
        },
        error: (error) => console.error('Error loading my orders:', error)
      })
    );
  }

  private loadOrdersFallback(): void {
    console.log('Loading orders with fallback method');
    // Try loading orders with 'pending' status which might show ready orders
    this.subscriptions.push(
      this.deliveryService.getOrders({ status: 'pending' }).subscribe({
        next: (response) => {
          console.log('Fallback orders response:', response);
          this.availableOrders = response.data.orders.filter(order =>
            ['ready', 'confirmed'].includes(order.status)
          );
          console.log('Fallback available orders count:', this.availableOrders.length);
        },
        error: (error) => {
          console.error('Error loading fallback orders:', error);
          // Try loading ALL orders to see what's available
          this.loadAllOrdersForDebugging();
        }
      })
    );
  }

  private loadAllOrdersForDebugging(): void {
    console.log('Loading ALL orders for debugging');
    this.subscriptions.push(
      this.deliveryService.getOrders({}).subscribe({
        next: (response) => {
          console.log('ALL orders response:', response);
          console.log('All orders:', response.data.orders);
          // Filter manually for debugging
          const readyOrders = response.data.orders.filter(order =>
            ['ready', 'confirmed'].includes(order.status)
          );
          console.log('Ready orders found:', readyOrders);
          this.availableOrders = readyOrders;
        },
        error: (error) => console.error('Error loading all orders:', error)
      })
    );
  }

  toggleAvailability(event: any): void {
    this.isOnline = event.target.checked;

    this.subscriptions.push(
      this.deliveryService.updateAvailability({ isOnline: this.isOnline }).subscribe({
        next: (response) => {
          console.log('Availability updated:', response.data);
          // Reload status to ensure consistency
          this.loadDeliveryStatus();
          // Reload orders when going online
          if (this.isOnline) {
            this.loadOrders();
          }
        },
        error: (error) => {
          console.error('Error updating availability:', error);
          // Revert toggle on error
          this.isOnline = !this.isOnline;
          event.target.checked = this.isOnline;
        }
      })
    );
  }

  updateCurrentLocation(): void {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser');
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
              console.log('Location updated:', response.data);
              // Refresh orders after location update
              this.loadOrders();
            },
            error: (error) => {
              console.error('Error updating location:', error);
              this.updatingLocation = false;
            }
          })
        );
      },
      (error) => {
        console.error('Error getting location:', error);
        this.updatingLocation = false;
        alert('Could not get your location. Please enable location services.');
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
          console.log('Order accepted:', response.data);
          this.loadOrders(); // Refresh orders
        },
        error: (error) => {
          console.error('Error accepting order:', error);
          alert('Failed to accept order. Please try again.');
        }
      })
    );
  }

  updateOrderStatus(orderId: string, status: string): void {
    console.log(`Updating order ${orderId} to status: ${status}`);
    this.subscriptions.push(
      this.deliveryService.updateOrderStatus(orderId, { status: status as any }).subscribe({
        next: (response) => {
          console.log('Order status updated successfully:', response.data);
          // Immediately refresh orders to show updated status
          this.loadOrders();
          // Also refresh status to ensure consistency
          this.loadDeliveryStatus();
        },
        error: (error) => {
          console.error('Error updating order status:', error);
          alert('Failed to update order status. Please try again.');
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
    console.log('Tracking order details:', orderId);
    this.subscriptions.push(
      this.deliveryService.trackOrder(orderId).subscribe({
        next: (response) => {
          console.log('Order details:', response.data);
          // You can implement a modal or navigation here
          // For now, log the details
        },
        error: (error) => {
          console.error('Error tracking order:', error);
          alert('Could not load order details. Please try again.');
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
