import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../shared/services/auth.service';
import { OrderService } from '../shared/services/order.service';
import { DeliveryService } from '../shared/services/delivery.service';
import { OrderTrackingService } from '../shared/services/order-tracking.service';
import { Subscription } from 'rxjs';

interface OrderWorkflow {
  _id: string;
  orderNumber: string;
  status: string;
  customer: any;
  restaurant: any;
  deliveryPerson?: any;
  createdAt: string;
  timeline: any[];
  totalAmount?: number;
  deliveryFee?: number;
  items?: any[];
}

@Component({
  selector: 'app-order-lifecycle-demo',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="order-lifecycle-demo">
      <h1>Complete Order Lifecycle Demonstration</h1>
      
      <!-- Role Selector -->
      <div class="role-selector">
        <h2>View as:</h2>
        <button 
          *ngFor="let role of roles" 
          [class]="'btn ' + (selectedRole === role.value ? 'btn-primary' : 'btn-secondary')"
          (click)="switchRole(role.value)">
          {{ role.label }}
        </button>
      </div>

      <!-- Customer View -->
      <div class="customer-view" *ngIf="selectedRole === 'customer'">
        <h2>Customer View - Order Tracking</h2>
        <div class="order-steps">
          <div class="step" *ngFor="let step of customerSteps" [class.active]="step.active" [class.completed]="step.completed">
            <div class="step-icon">{{ step.icon }}</div>
            <div class="step-content">
              <h3>{{ step.title }}</h3>
              <p>{{ step.description }}</p>
              <span class="step-time" *ngIf="step.time">{{ step.time }}</span>
            </div>
          </div>
        </div>
        
        <!-- Customer Actions -->
        <div class="customer-actions" *ngIf="demoOrder && canCustomerTakeAction()">
          <button class="btn btn-danger" (click)="cancelOrder()" *ngIf="canCancelOrder()">
            Cancel Order
          </button>
          <button class="btn btn-primary" (click)="trackOrder()" *ngIf="canTrackOrder()">
            Track Order Live
          </button>
        </div>
      </div>

      <!-- Restaurant View -->
      <div class="restaurant-view" *ngIf="selectedRole === 'restaurant'">
        <h2>Restaurant View - Order Management</h2>
        <div class="order-card" *ngIf="demoOrder">
          <div class="order-header">
            <span class="order-id">#{{ demoOrder.orderNumber || 0 }}</span>
            <span class="order-status" [class]="'status-' + (demoOrder.status || 0)">{{ formatStatus(demoOrder.status || '') }}</span>
          </div>
          <div class="order-details">
            <p><strong>Customer:</strong> {{ demoOrder.customer.name || "" }}</p>
            <p><strong>Items:</strong> {{ demoOrder.items?.length || 0 }} items</p>
            <p><strong>Total:</strong> {{ (demoOrder.totalAmount || 0) | currency }}</p>
          </div>
          
          <!-- Restaurant Actions -->
          <div class="restaurant-actions">
            <button 
              class="btn btn-success" 
              (click)="updateOrderStatus('confirmed')"
              *ngIf="demoOrder?.status === 'pending'">
              Confirm Order
            </button>
            <button 
              class="btn btn-warning" 
              (click)="updateOrderStatus('preparing')"
              *ngIf="demoOrder?.status === 'confirmed'">
              Start Preparing
            </button>
            <button 
              class="btn btn-info" 
              (click)="updateOrderStatus('ready')"
              *ngIf="demoOrder?.status === 'preparing'">
              Mark as Ready
            </button>
            <button 
              class="btn btn-danger" 
              (click)="cancelOrder()"
              *ngIf="['pending', 'confirmed'].includes(demoOrder?.status || '')">
              Cancel Order
            </button>
          </div>
        </div>
      </div>

      <!-- Delivery View -->
      <div class="delivery-view" *ngIf="selectedRole === 'delivery'">
        <h2>Delivery Person View</h2>
        
        <!-- Available Orders -->
        <div class="available-orders" *ngIf="demoOrder?.status === 'ready'">
          <h3>Available Orders</h3>
          <div class="order-card available">
            <div class="order-header">
              <span class="order-id">#{{ demoOrder?.orderNumber }}</span>
              <span class="earnings">{{ demoOrder?.deliveryFee | currency }} earnings</span>
            </div>
            <div class="order-details">
              <p><strong>Restaurant:</strong> {{ demoOrder?.restaurant?.name }}</p>
              <p><strong>Customer:</strong> {{ demoOrder?.customer?.name }}</p>
              <p><strong>Distance:</strong> 2.5 km</p>
            </div>
            <button class="btn btn-success" (click)="acceptOrder()">
              Accept Order
            </button>
          </div>
        </div>

        <!-- Active Delivery -->
        <div class="active-delivery" *ngIf="['assigned', 'picked_up', 'on_the_way'].includes(demoOrder?.status || '')">
          <h3>Active Delivery</h3>
          <div class="order-card active">
            <div class="order-header">
              <span class="order-id">#{{ demoOrder?.orderNumber }}</span>
              <span class="order-status" [class]="'status-' + demoOrder?.status">{{ formatStatus(demoOrder?.status || '') }}</span>
            </div>
            <div class="order-details">
              <p><strong>Customer:</strong> {{ demoOrder?.customer?.name }}</p>
              <p><strong>Phone:</strong> {{ demoOrder?.customer?.phone || '(555) 123-4567' }}</p>
              <p><strong>Address:</strong> {{ demoOrder?.customer?.address }}</p>
            </div>
            
            <!-- Delivery Actions -->
            <div class="delivery-actions">
              <button 
                class="btn btn-primary" 
                (click)="updateOrderStatus('picked_up')"
                *ngIf="demoOrder?.status === 'assigned'">
                Mark as Picked Up
              </button>
              <button 
                class="btn btn-warning" 
                (click)="updateOrderStatus('on_the_way')"
                *ngIf="demoOrder?.status === 'picked_up'">
                Mark as On the Way
              </button>
              <button 
                class="btn btn-success" 
                (click)="updateOrderStatus('delivered')"
                *ngIf="demoOrder?.status === 'on_the_way'">
                Mark as Delivered
              </button>
              <button class="btn btn-secondary" (click)="callCustomer()">
                📞 Call Customer
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Order Timeline (visible to all) -->
      <div class="order-timeline" *ngIf="demoOrder">
        <h2>Order Timeline</h2>
        <div class="timeline">
          <div class="timeline-item" *ngFor="let event of orderTimeline" [class.completed]="event.completed">
            <div class="timeline-dot" [class]="event.type"></div>
            <div class="timeline-content">
              <h4>{{ event.title }}</h4>
              <p>{{ event.description }}</p>
              <span class="timeline-time" *ngIf="event.time">{{ event.time }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Demo Controls -->
      <div class="demo-controls">
        <h2>Demo Controls</h2>
        <button class="btn btn-secondary" (click)="createDemoOrder()" *ngIf="!demoOrder">
          Create Demo Order
        </button>
        <button class="btn btn-warning" (click)="resetDemo()" *ngIf="demoOrder">
          Reset Demo
        </button>
      </div>
    </div>
  `,
  styles: [`
    .order-lifecycle-demo {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .role-selector {
      margin-bottom: 30px;
      text-align: center;
    }

    .role-selector button {
      margin: 0 10px;
      padding: 10px 20px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    }

    .btn-primary {
      background-color: #007bff;
      color: white;
    }

    .btn-secondary {
      background-color: #6c757d;
      color: white;
    }

    .btn-success {
      background-color: #28a745;
      color: white;
    }

    .btn-warning {
      background-color: #ffc107;
      color: black;
    }

    .btn-info {
      background-color: #17a2b8;
      color: white;
    }

    .btn-danger {
      background-color: #dc3545;
      color: white;
    }

    .order-steps {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .step {
      display: flex;
      align-items: center;
      padding: 15px;
      border: 2px solid #e9ecef;
      border-radius: 8px;
      opacity: 0.6;
    }

    .step.active {
      border-color: #007bff;
      background-color: #f8f9fa;
      opacity: 1;
    }

    .step.completed {
      border-color: #28a745;
      background-color: #d4edda;
      opacity: 1;
    }

    .step-icon {
      font-size: 24px;
      margin-right: 15px;
      width: 40px;
      text-align: center;
    }

    .order-card {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
    }

    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }

    .order-status {
      padding: 5px 10px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
    }

    .status-pending { background-color: #ffc107; color: black; }
    .status-confirmed { background-color: #17a2b8; color: white; }
    .status-preparing { background-color: #fd7e14; color: white; }
    .status-ready { background-color: #6f42c1; color: white; }
    .status-assigned { background-color: #20c997; color: white; }
    .status-picked_up { background-color: #007bff; color: white; }
    .status-on_the_way { background-color: #6c757d; color: white; }
    .status-delivered { background-color: #28a745; color: white; }
    .status-cancelled { background-color: #dc3545; color: white; }

    .timeline {
      position: relative;
      padding-left: 30px;
    }

    .timeline::before {
      content: '';
      position: absolute;
      left: 15px;
      top: 0;
      bottom: 0;
      width: 2px;
      background-color: #dee2e6;
    }

    .timeline-item {
      position: relative;
      margin-bottom: 20px;
    }

    .timeline-dot {
      position: absolute;
      left: -22px;
      top: 0;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background-color: #6c757d;
    }

    .timeline-dot.completed {
      background-color: #28a745;
    }

    .timeline-content {
      padding-left: 20px;
    }

    .demo-controls {
      margin-top: 40px;
      text-align: center;
      padding-top: 20px;
      border-top: 2px solid #e9ecef;
    }
  `]
})
export class OrderLifecycleDemoComponent implements OnInit, OnDestroy {
  selectedRole = 'customer';
  demoOrder: OrderWorkflow | null = null;
  private subscriptions: Subscription[] = [];

  roles = [
    { value: 'customer', label: '👤 Customer' },
    { value: 'restaurant', label: '🍽️ Restaurant' },
    { value: 'delivery', label: '🏍️ Delivery Person' }
  ];

  customerSteps = [
    { icon: '📝', title: 'Order Placed', description: 'Your order has been submitted', active: false, completed: false, time: '' },
    { icon: '✅', title: 'Order Confirmed', description: 'Restaurant confirmed your order', active: false, completed: false, time: '' },
    { icon: '👨‍🍳', title: 'Preparing', description: 'Your food is being prepared', active: false, completed: false, time: '' },
    { icon: '🔔', title: 'Ready for Pickup', description: 'Food is ready, waiting for delivery', active: false, completed: false, time: '' },
    { icon: '🏍️', title: 'Driver Assigned', description: 'A delivery driver has been assigned', active: false, completed: false, time: '' },
    { icon: '📦', title: 'Picked Up', description: 'Driver picked up your order', active: false, completed: false, time: '' },
    { icon: '🚚', title: 'On the Way', description: 'Your order is on the way to you', active: false, completed: false, time: '' },
    { icon: '🎉', title: 'Delivered', description: 'Order delivered successfully!', active: false, completed: false, time: '' }
  ];

  orderTimeline: any[] = [];

  constructor(
    private authService: AuthService,
    private orderService: OrderService,
    private deliveryService: DeliveryService,
    private orderTrackingService: OrderTrackingService
  ) { }

  ngOnInit(): void {
    this.createDemoOrder();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  switchRole(role: string): void {
    this.selectedRole = role;
  }

  createDemoOrder(): void {
    this.demoOrder = {
      _id: 'demo-order-' + Date.now(),
      orderNumber: 'ORD-' + Math.random().toString().substr(2, 6),
      status: 'pending',
      customer: {
        name: 'John Doe',
        phone: '(555) 123-4567',
        address: '123 Main St, City, State 12345'
      },
      restaurant: {
        name: 'Pizza Palace',
        address: '456 Restaurant Ave, City, State'
      },
      createdAt: new Date().toISOString(),
      timeline: [],
      totalAmount: 29.99,
      deliveryFee: 3.99,
      items: [
        { name: 'Margherita Pizza', quantity: 1, price: 18.99 },
        { name: 'Caesar Salad', quantity: 1, price: 8.99 }
      ]
    };

    this.updateTimeline('Order placed by customer', 'customer');
    this.updateCustomerSteps();
  }

  resetDemo(): void {
    this.demoOrder = null;
    this.orderTimeline = [];
    this.customerSteps.forEach(step => {
      step.active = false;
      step.completed = false;
      step.time = '';
    });
  }

  updateOrderStatus(newStatus: string): void {
    if (!this.demoOrder) return;

    if (!this.demoOrder) return;

    const oldStatus = this.demoOrder.status;
    this.demoOrder.status = newStatus;

    // Add to timeline
    const messages: { [key: string]: { message: string, actor: string } } = {
      'confirmed': { message: 'Order confirmed by restaurant', actor: 'restaurant' },
      'preparing': { message: 'Restaurant started preparing the order', actor: 'restaurant' },
      'ready': { message: 'Order is ready for pickup', actor: 'restaurant' },
      'assigned': { message: 'Delivery driver assigned to order', actor: 'system' },
      'picked_up': { message: 'Order picked up by delivery driver', actor: 'delivery' },
      'on_the_way': { message: 'Order is on the way to customer', actor: 'delivery' },
      'delivered': { message: 'Order delivered successfully', actor: 'delivery' },
      'cancelled': { message: 'Order cancelled', actor: this.selectedRole }
    };

    if (messages[newStatus]) {
      this.updateTimeline(messages[newStatus].message, messages[newStatus].actor);
    }

    this.updateCustomerSteps();
  }

  acceptOrder(): void {
    if (!this.demoOrder) return;

    if (this.demoOrder && this.demoOrder.status === 'ready') {
      this.demoOrder.deliveryPerson = {
        name: 'Mike Driver',
        phone: '(555) 987-6543'
      };
      this.updateOrderStatus('assigned');
    }
  }

  cancelOrder(): void {
    if (this.demoOrder) {
      this.updateOrderStatus('cancelled');
    }
  }

  callCustomer(): void {
    if (this.demoOrder?.customer?.phone) {
      alert(`Calling ${this.demoOrder.customer.phone}`);
    }
  }

  trackOrder(): void {
    if (this.demoOrder) {
      alert('Opening live tracking map...');
    }
  }

  canCustomerTakeAction(): boolean {
    return this.demoOrder?.status !== 'delivered' && this.demoOrder?.status !== 'cancelled';
  }

  canCancelOrder(): boolean {
    return ['pending', 'confirmed', 'preparing'].includes(this.demoOrder?.status || '');
  }

  canTrackOrder(): boolean {
    return ['assigned', 'picked_up', 'on_the_way'].includes(this.demoOrder?.status || '');
  }

  formatStatus(status: string): string {
    const statusLabels: { [key: string]: string } = {
      'pending': 'Pending',
      'confirmed': 'Confirmed',
      'preparing': 'Preparing',
      'ready': 'Ready for Pickup',
      'assigned': 'Driver Assigned',
      'picked_up': 'Picked Up',
      'on_the_way': 'On the Way',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled'
    };
    return statusLabels[status] || status;
  }

  private updateTimeline(message: string, actor: string): void {
    this.orderTimeline.push({
      title: message,
      description: `Action performed by: ${actor}`,
      time: new Date().toLocaleTimeString(),
      type: actor,
      completed: true
    });
  }

  private updateCustomerSteps(): void {
    const statusToStepIndex: { [key: string]: number } = {
      'pending': 0,
      'confirmed': 1,
      'preparing': 2,
      'ready': 3,
      'assigned': 4,
      'picked_up': 5,
      'on_the_way': 6,
      'delivered': 7
    };

    const currentStepIndex = statusToStepIndex[this.demoOrder?.status || 'pending'];

    this.customerSteps.forEach((step, index) => {
      step.completed = index < currentStepIndex;
      step.active = index === currentStepIndex;
      if (step.completed || step.active) {
        step.time = new Date().toLocaleTimeString();
      }
    });
  }
}
