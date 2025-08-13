import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// Generic API response interface
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Updated interfaces to match the new API
export interface CreateOrderRequest {
  restaurantId: string;
  items: {
    mealId: string;
    quantity: number;
    specialInstructions?: string;
  }[];
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  paymentMethod: 'cash' | 'card' | 'digital-wallet';
  couponCode?: string;
  notes?: string;
}

export interface OrderResponse {
  success: boolean;
  message: string;
  data: {
    order: {
      _id: string;
      orderNumber: string;
      status: OrderStatus;
      pricing: {
        subtotal: number;
        deliveryFee: number;
        serviceFee: number;
        tax: number;
        total: number;
      };
    };
    estimatedDeliveryTime: string;
  };
}

export interface OrdersListResponse {
  success: boolean;
  message: string;
  data: {
    orders: OrderSummary[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export interface OrderSummary {
  _id: string;
  orderNumber: string;
  customerId?: string;
  restaurantId?: string;
  restaurant?: {
    name: string;
  };
  customerInfo?: {
    name: string;
    phone: string;
    email: string;
  };
  status: OrderStatus;
  paymentStatus?: string;
  paymentMethod?: string;
  subtotal?: number;
  deliveryFee?: number;
  tax?: number;
  totalAmount?: number;
  items?: {
    _id: string;
    mealId: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  pricing?: {
    total: number;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface OrderDetails {
  success: boolean;
  message: string;
  data: {
    order: {
      _id: string;
      orderNumber: string;
      customer: {
        name: string;
        phone: string;
        email: string;
      };
      restaurant: {
        name: string;
        address: {
          street: string;
          city: string;
        };
      };
      items: {
        meal: {
          name: string;
          price: number;
        };
        quantity: number;
        subtotal: number;
      }[];
      status: OrderStatus;
      pricing: {
        total: number;
      };
      estimatedDeliveryTime: string;
      deliveryAddress?: any;
      timeline?: TimelineEvent[];
    };
  };
}

export interface TimelineEvent {
  status: string;
  timestamp: string;
  description: string;
}

export interface TrackingResponse {
  success: boolean;
  message: string;
  data: {
    tracking: {
      orderId: string;
      status: OrderStatus;
      estimatedDeliveryTime: string;
      timeline: TimelineEvent[];
      deliveryPerson?: {
        name: string;
        phone: string;
        currentLocation?: {
          lat: number;
          lng: number;
        };
      };
      restaurant: {
        name: string;
        phone: string;
        preparationTime: number;
      };
    };
  };
}

export interface UpdateStatusRequest {
  status: OrderStatus;
  estimatedTime?: number;
  notes?: string;
}

export interface CancelOrderRequest {
  reason: string;
  details?: string;
}

export interface RateOrderRequest {
  rating: number;
  review?: string;
  deliveryRating?: number;
  foodRating?: number;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface OrderFilters {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  dateFrom?: string;
  dateTo?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly API_BASE = `${environment.apiUrl}`;

  constructor(private http: HttpClient) { }

  /**
   * Create a new order
   * POST /api/orders
   */
  createOrder(orderData: CreateOrderRequest): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(`${this.API_BASE}/orders`, orderData);
  }

  /**
   * Get user orders with pagination and filtering
   * GET /api/orders
   */
  getUserOrders(filters: OrderFilters = {}): Observable<OrdersListResponse> {
    let params = new HttpParams();

    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.status) params = params.set('status', filters.status);
    if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params = params.set('sortOrder', filters.sortOrder);

    return this.http.get<OrdersListResponse>(`${this.API_BASE}/orders`, { params });
  }

  /**
   * Get order by ID
   * GET /api/orders/{id}
   */
  getOrderById(orderId: string): Observable<OrderDetails> {
    return this.http.get<OrderDetails>(`${this.API_BASE}/orders/${orderId}`);
  }

  /**
   * Update order status
   * PATCH /api/orders/{id}/status
   */
  updateOrderStatus(orderId: string, statusData: UpdateStatusRequest): Observable<any> {
    return this.http.patch(`${this.API_BASE}/orders/${orderId}/status`, statusData);
  }

  /**
   * Get order details for tracking
   * GET /api/orders/{id} - Use the main order endpoint instead of deprecated /details
   * @deprecated Use getOrderById instead for order details
   */
  getOrderDetails(orderId: string): Observable<{ success: boolean; data: any }> {
    return this.getOrderById(orderId) as any;
  }

  /**
   * Cancel order with reason
   * PATCH /api/orders/{id}/cancel
   */
  cancelOrder(orderId: string, reason?: string): Observable<any> {
    return this.http.patch(`${this.API_BASE}/orders/${orderId}/cancel`, { reason: reason || 'Customer requested cancellation' });
  }

  /**
   * Rate and review order
   * POST /api/orders/{id}/rate
   */
  rateOrder(orderId: string, ratingData: RateOrderRequest): Observable<any> {
    return this.http.post(`${this.API_BASE}/orders/${orderId}/rate`, ratingData);
  }

  /**
   * Track order in real-time
   * GET /api/orders/{id}/track
   */
  trackOrder(orderId: string): Observable<TrackingResponse> {
    return this.http.get<TrackingResponse>(`${this.API_BASE}/orders/${orderId}/track`);
  }

  /**
   * Get restaurant orders (for restaurant dashboard)
   */
  getRestaurantOrders(filters: OrderFilters = {}): Observable<OrdersListResponse> {
    let params = new HttpParams();

    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.status) params = params.set('status', filters.status);
    if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params = params.set('sortOrder', filters.sortOrder);

    // For restaurant users, use the same /orders endpoint
    // The backend will automatically filter by restaurant based on the user's role
    return this.http.get<OrdersListResponse>(`${this.API_BASE}/orders`, { params });
  }

  /**
   * Utility methods for order management
   */
  getStatusColor(status: OrderStatus): string {
    const statusColors: Record<OrderStatus, string> = {
      'pending': '#ffc107',
      'confirmed': '#17a2b8',
      'preparing': '#fd7e14',
      'ready': '#20c997',
      'out_for_delivery': '#6f42c1',
      'delivered': '#28a745',
      'cancelled': '#dc3545'
    };
    return statusColors[status] || '#6c757d';
  }

  getStatusText(status: OrderStatus): string {
    const statusTexts: Record<OrderStatus, string> = {
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

  getStatusIcon(status: OrderStatus): string {
    const statusIcons: Record<OrderStatus, string> = {
      'pending': 'fas fa-clock',
      'confirmed': 'fas fa-check-circle',
      'preparing': 'fas fa-utensils',
      'ready': 'fas fa-box',
      'out_for_delivery': 'fas fa-shipping-fast',
      'delivered': 'fas fa-check-double',
      'cancelled': 'fas fa-times-circle'
    };
    return statusIcons[status] || 'fas fa-question-circle';
  }

  canCancelOrder(status: OrderStatus): boolean {
    return ['pending', 'confirmed'].includes(status);
  }

  canRateOrder(status: OrderStatus): boolean {
    return status === 'delivered';
  }

  // Legacy methods (kept for backward compatibility)
  getOrderHistory(): Observable<OrdersListResponse> {
    return this.getUserOrders();
  }

  getAllOrders(): Observable<OrdersListResponse> {
    return this.getUserOrders();
  }

  // Restaurant dashboard specific methods
  getOrders(filters: OrderFilters = {}): Observable<OrdersListResponse> {
    return this.getRestaurantOrders(filters);
  }

  getNextStatus(currentStatus: OrderStatus): OrderStatus | null {
    const statusFlow: OrderStatus[] = [
      'pending',
      'confirmed',
      'preparing',
      'ready',
      'out_for_delivery',
      'delivered'
    ];

    const currentIndex = statusFlow.indexOf(currentStatus);
    return currentIndex >= 0 && currentIndex < statusFlow.length - 1
      ? statusFlow[currentIndex + 1]
      : null;
  }

  updateOrderStatusEnhanced(orderId: string, statusData: UpdateStatusRequest): Observable<any> {
    return this.updateOrderStatus(orderId, statusData);
  }

  canUpdateStatus(status: OrderStatus): boolean {
    const updateableStatuses: OrderStatus[] = [
      'pending',
      'confirmed',
      'preparing',
      'ready',
      'out_for_delivery'
    ];
    return updateableStatuses.includes(status);
  }
}

