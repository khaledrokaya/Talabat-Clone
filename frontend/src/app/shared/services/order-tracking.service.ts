import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { OrderService } from './order.service';

export interface OrderUpdate {
  orderId: string;
  status: string;
  timestamp: Date;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderTrackingService {
  private readonly POLLING_INTERVAL = 10000; // 10 seconds
  private orderUpdates$ = new BehaviorSubject<OrderUpdate[]>([]);
  private trackedOrders = new Set<string>();

  constructor(private orderService: OrderService) { }

  // Get order updates stream
  getOrderUpdates(): Observable<OrderUpdate[]> {
    return this.orderUpdates$.asObservable();
  }

  // Start tracking an order
  startTracking(orderId: string): void {
    if (!this.trackedOrders.has(orderId)) {
      this.trackedOrders.add(orderId);
      this.startPolling();
    }
  }

  // Stop tracking an order
  stopTracking(orderId: string): void {
    this.trackedOrders.delete(orderId);
    if (this.trackedOrders.size === 0) {
      this.stopPolling();
    }
  }

  // Stop tracking all orders
  stopAllTracking(): void {
    this.trackedOrders.clear();
    this.stopPolling();
  }

  private startPolling(): void {
    if (this.trackedOrders.size === 0) return;

    timer(0, this.POLLING_INTERVAL)
      .pipe(
        switchMap(() => this.pollOrderUpdates()),
        catchError((error) => {
          return [];
        })
      )
      .subscribe((updates) => {
        if (updates.length > 0) {
          this.orderUpdates$.next(updates);
        }
      });
  }

  private stopPolling(): void {
    // Polling will stop automatically when trackedOrders is empty
  }

  private async pollOrderUpdates(): Promise<OrderUpdate[]> {
    const updates: OrderUpdate[] = [];

    for (const orderId of this.trackedOrders) {
      try {
        const response = await this.orderService.getOrderDetails(orderId).toPromise();
        if (response && response.data) {
          updates.push({
            orderId: orderId,
            status: response.data.status,
            timestamp: new Date(),
            message: this.getStatusMessage(response.data.status)
          });
        }
      } catch (error) {
      }
    }

    return updates;
  }

  private getStatusMessage(status: string): string {
    const messages: { [key: string]: string } = {
      'pending': 'Order placed successfully',
      'confirmed': 'Restaurant confirmed your order',
      'preparing': 'Your order is being prepared',
      'ready': 'Your order is ready for pickup',
      'assigned': 'Driver has been assigned',
      'picked_up': 'Driver picked up your order',
      'on_the_way': 'Your order is on the way',
      'delivered': 'Order delivered successfully',
      'cancelled': 'Order has been cancelled'
    };

    return messages[status] || `Order status: ${status}`;
  }
}
