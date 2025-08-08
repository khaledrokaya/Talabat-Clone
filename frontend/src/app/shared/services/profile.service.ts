import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Restaurant } from '../models/restaurant';

export interface Address {
  street: string;
  city: string;
  state?: string;
  zipCode?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface DeliveryPreferences {
  preferredDeliveryTime?: string;
  specialInstructions?: string;
}

export interface CustomerProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: Address;
  deliveryPreferences: DeliveryPreferences;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: Address;
  deliveryPreferences?: DeliveryPreferences;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface OrderItem {
  mealId: string;
  mealName: string;
  quantity: number;
  price: number;
  specialInstructions?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
  items: OrderItem[];
  restaurant: {
    id: string;
    name: string;
  };
  deliveryAddress: Address;
  paymentMethod: string;
  totalAmount: number;
  deliveryFee: number;
  estimatedDeliveryTime: Date;
  actualDeliveryTime?: Date;
  specialInstructions?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrdersResponse {
  orders: Order[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalOrders: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface OrderFilters {
  status?: string;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = environment.apiUrl;
  private profileSubject = new BehaviorSubject<CustomerProfile | null>(null);
  public profile$ = this.profileSubject.asObservable();

  constructor(private http: HttpClient) { }

  // Profile Management
  getProfile(): Observable<CustomerProfile> {
    return this.http.get<{ success: boolean, data: CustomerProfile }>(`${this.apiUrl}/customer/profile`, {
      withCredentials: true
    }).pipe(
      map(response => response.data),
      tap(profile => this.profileSubject.next(profile))
    );
  }

  updateProfile(profileData: UpdateProfileRequest): Observable<CustomerProfile> {
    return this.http.put<{ success: boolean, data: CustomerProfile }>(`${this.apiUrl}/customer/profile`, profileData, {
      withCredentials: true
    }).pipe(
      map(response => response.data),
      tap(profile => this.profileSubject.next(profile))
    );
  }

  changePassword(passwordData: ChangePasswordRequest): Observable<{ success: boolean, message: string }> {
    return this.http.put<{ success: boolean, message: string }>(`${this.apiUrl}/auth/change-password`, passwordData, {
      withCredentials: true
    });
  }

  // Favorites Management
  getFavoriteRestaurants(): Observable<Restaurant[]> {
    return this.http.get<{ success: boolean, data: Restaurant[] }>(`${this.apiUrl}/customer/favorites`, {
      withCredentials: true
    }).pipe(
      map(response => response.data)
    );
  }

  addToFavorites(restaurantId: string): Observable<{ success: boolean, message: string }> {
    return this.http.post<{ success: boolean, message: string }>(`${this.apiUrl}/customer/favorites`,
      { restaurantId },
      { withCredentials: true }
    );
  }

  removeFromFavorites(restaurantId: string): Observable<{ success: boolean, message: string }> {
    return this.http.delete<{ success: boolean, message: string }>(`${this.apiUrl}/customer/favorites/${restaurantId}`, {
      withCredentials: true
    });
  }

  // Orders Management
  getOrderHistory(filters: OrderFilters = {}): Observable<OrdersResponse> {
    const params = new URLSearchParams();

    if (filters.status) params.append('status', filters.status);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const queryString = params.toString() ? `?${params.toString()}` : '';

    return this.http.get<{ success: boolean, data: OrdersResponse }>(`${this.apiUrl}/customer/orders${queryString}`, {
      withCredentials: true
    }).pipe(
      map(response => response.data)
    );
  }

  getOrderById(orderId: string): Observable<Order> {
    return this.http.get<{ success: boolean, data: Order }>(`${this.apiUrl}/order/${orderId}`, {
      withCredentials: true
    }).pipe(
      map(response => response.data)
    );
  }

  trackOrder(orderId: string): Observable<{
    orderId: string;
    status: string;
    estimatedDeliveryTime: Date;
    currentLocation?: { lat: number; lng: number };
    deliveryPersonInfo?: { name: string; phone: string };
  }> {
    return this.http.get<{ success: boolean, data: any }>(`${this.apiUrl}/order/${orderId}/track`, {
      withCredentials: true
    }).pipe(
      map(response => response.data)
    );
  }

  cancelOrder(orderId: string, reason?: string): Observable<{ success: boolean, message: string }> {
    return this.http.patch<{ success: boolean, message: string }>(`${this.apiUrl}/order/${orderId}/cancel`,
      { reason },
      { withCredentials: true }
    );
  }

  rateOrder(orderId: string, rating: number, comment?: string): Observable<{ success: boolean, message: string }> {
    return this.http.post<{ success: boolean, message: string }>(`${this.apiUrl}/order/${orderId}/rate`,
      { rating, comment },
      { withCredentials: true }
    );
  }

  // Delivery Preferences
  updateDeliveryPreferences(preferences: DeliveryPreferences): Observable<{ success: boolean, message: string }> {
    return this.http.put<{ success: boolean, message: string }>(`${this.apiUrl}/customer/delivery-preferences`,
      preferences,
      { withCredentials: true }
    );
  }

  // Helper methods
  getOrderStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'Pending',
      'confirmed': 'Confirmed',
      'preparing': 'Preparing',
      'ready': 'Ready',
      'out_for_delivery': 'Out for Delivery',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled'
    };
    return statusMap[status] || status;
  }

  getOrderStatusColor(status: string): string {
    const colorMap: { [key: string]: string } = {
      'pending': 'warning',
      'confirmed': 'info',
      'preparing': 'primary',
      'ready': 'success',
      'out_for_delivery': 'primary',
      'delivered': 'success',
      'cancelled': 'danger'
    };
    return colorMap[status] || 'secondary';
  }

  canCancelOrder(order: Order): boolean {
    const cancelableStatuses = ['pending', 'confirmed'];
    return cancelableStatuses.includes(order.status);
  }

  canTrackOrder(order: Order): boolean {
    const trackableStatuses = ['confirmed', 'preparing', 'ready', 'out_for_delivery'];
    return trackableStatuses.includes(order.status);
  }

  canRateOrder(order: Order): boolean {
    return order.status === 'delivered';
  }
}
