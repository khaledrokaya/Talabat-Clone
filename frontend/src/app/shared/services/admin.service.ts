import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// Dashboard Analytics Interfaces
export interface DashboardData {
  users: {
    total: number;
    customers: number;
    restaurants: number;
    delivery: number;
    activeUsers: number;
    newUsersThisMonth: number;
  };
  orders: {
    total: number;
    pending: number;
    completed: number;
    cancelled: number;
    totalRevenue: number;
    averageOrderValue: number;
  };
  restaurants: {
    total: number;
    active: number;
    pending: number;
    verified: number;
    rejected: number;
  };
  delivery: {
    total: number;
    active: number;
    pending: number;
    verified: number;
    online: number;
  };
  revenue: {
    totalPlatformRevenue: number;
    monthlyRevenue: number;
    averageCommission: number;
    topRestaurants: TopRestaurant[];
  };
}

export interface TopRestaurant {
  id: string;
  name: string;
  revenue: number;
  orders: number;
}

export interface AnalyticsData {
  userAnalytics: {
    registrationTrends: RegistrationTrend[];
    activeUsers: {
      daily: number;
      weekly: number;
      monthly: number;
    };
  };
  orderAnalytics: {
    orderTrends: OrderTrend[];
    peakHours: PeakHour[];
  };
  revenueAnalytics: {
    totalRevenue: number;
    commissionRevenue: number;
    averageOrderValue: number;
    topPerformingRestaurants: TopRestaurant[];
  };
}

export interface RegistrationTrend {
  date: string;
  customers: number;
  restaurants: number;
  delivery: number;
}

export interface OrderTrend {
  date: string;
  totalOrders: number;
  revenue: number;
}

export interface PeakHour {
  hour: number;
  orderCount: number;
}

// User Management Interfaces
export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'restaurant' | 'delivery';
  isActive: boolean;
  isEmailVerified: boolean;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  createdAt: string;
  lastLogin: string;
}

export interface UsersResponse {
  users: AdminUser[];
  totalUsers: number;
  totalPages: number;
  currentPage: number;
}

export interface UserFilters {
  role?: 'customer' | 'restaurant' | 'delivery';
  status?: 'active' | 'inactive' | 'pending' | 'verified' | 'rejected';
  page?: number;
  limit?: number;
  search?: string;
}

export interface PendingRestaurant {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  restaurantName: string;
  businessLicense: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  phone: string;
  submittedAt: string;
  verificationStatus: 'pending';
}

export interface PendingDelivery {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  driverLicense: string;
  vehicleInfo: {
    type: 'car' | 'motorcycle' | 'bicycle';
    brand: string;
    model: string;
    plateNumber: string;
  };
  submittedAt: string;
  verificationStatus: 'pending';
}

export interface ApprovalRequest {
  status: 'verified' | 'rejected';
  reason: string;
}

export interface StatusUpdateRequest {
  isActive: boolean;
  reason: string;
}

// Restaurant Management Interfaces
export interface AdminRestaurant {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  restaurantName: string;
  businessLicense: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  phone: string;
  isActive: boolean;
  isVerified: boolean;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  createdAt: string;
  totalOrders: number;
  totalRevenue: number;
  averageRating: number;
}

export interface RestaurantsResponse {
  restaurants: AdminRestaurant[];
  totalRestaurants: number;
  totalPages: number;
  currentPage: number;
}

// Delivery Management Interfaces
export interface AdminDelivery {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  driverLicense: string;
  vehicleInfo: {
    type: 'car' | 'motorcycle' | 'bicycle';
    brand: string;
    model: string;
    plateNumber: string;
  };
  isActive: boolean;
  isVerified: boolean;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  isOnline: boolean;
  createdAt: string;
  totalDeliveries: number;
  averageRating: number;
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
}

export interface DeliveryResponse {
  delivery: AdminDelivery[];
  totalDelivery: number;
  totalPages: number;
  currentPage: number;
}

// Order Management Interfaces
export interface AdminOrder {
  id: string;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  restaurant: {
    id: string;
    name: string;
    email: string;
  };
  delivery?: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
  items: {
    mealId: string;
    mealName: string;
    quantity: number;
    price: number;
  }[];
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'delivered' | 'cancelled';
  paymentMethod: 'cash' | 'card' | 'online';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  totalAmount: number;
  deliveryFee: number;
  platformFee: number;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface OrdersResponse {
  orders: AdminOrder[];
  totalOrders: number;
  totalPages: number;
  currentPage: number;
}

export interface OrderFilters {
  status?: string;
  paymentStatus?: string;
  dateFrom?: string;
  dateTo?: string;
  customerId?: string;
  restaurantId?: string;
  deliveryId?: string;
  page?: number;
  limit?: number;
  search?: string;
}

// System Settings Interfaces
export interface SystemSettings {
  platformFees: {
    orderFeePercentage: number;
    deliveryFeeFlat: number;
    minimumOrderAmount: number;
  };
  businessHours: {
    openTime: string;
    closeTime: string;
    operatingDays: string[];
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
  };
  maintenance: {
    isMaintenanceMode: boolean;
    maintenanceMessage: string;
  };
}

export interface RestaurantFilters {
  status?: 'active' | 'inactive' | 'pending' | 'verified' | 'rejected';
  verified?: boolean;
  page?: number;
  limit?: number;
  search?: string;
}

export interface DeliveryFilters {
  status?: 'active' | 'inactive' | 'pending' | 'verified' | 'rejected';
  isOnline?: boolean;
  verified?: boolean;
  page?: number;
  limit?: number;
  search?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Dashboard Analytics
  getDashboardData(): Observable<{ success: boolean; data: DashboardData }> {
    return this.http.get<{ success: boolean; data: DashboardData }>(`${this.apiUrl}/admin/dashboard`, {
      withCredentials: true
    });
  }

  getAnalyticsData(): Observable<{ success: boolean; data: AnalyticsData }> {
    return this.http.get<{ success: boolean; data: AnalyticsData }>(`${this.apiUrl}/admin/analytics`, {
      withCredentials: true
    });
  }

  // User Management
  getAllUsers(filters?: UserFilters): Observable<{ success: boolean; data: UsersResponse }> {
    let params = new HttpParams();

    if (filters) {
      if (filters.role) params = params.set('role', filters.role);
      if (filters.status) params = params.set('status', filters.status);
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
      if (filters.search) params = params.set('search', filters.search);
    }

    return this.http.get<{ success: boolean; data: UsersResponse }>(`${this.apiUrl}/admin/users`, {
      params,
      withCredentials: true
    });
  }

  getUserById(userId: string): Observable<{ success: boolean; data: AdminUser }> {
    return this.http.get<{ success: boolean; data: AdminUser }>(`${this.apiUrl}/admin/users/${userId}`, {
      withCredentials: true
    });
  }

  deleteUser(userId: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/admin/users/${userId}`, {
      withCredentials: true
    });
  }

  approveUser(userId: string, request: ApprovalRequest): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/admin/users/${userId}`, request, {
      withCredentials: true
    });
  }

  updateUserStatus(userId: string, request: StatusUpdateRequest): Observable<{ success: boolean; message: string }> {
    return this.http.patch<{ success: boolean; message: string }>(`${this.apiUrl}/admin/users/${userId}/status`, request, {
      withCredentials: true
    });
  }

  // Pending Approvals
  getPendingRestaurants(): Observable<{ success: boolean; data: PendingRestaurant[] }> {
    return this.http.get<{ success: boolean; data: PendingRestaurant[] }>(`${this.apiUrl}/admin/pending/restaurants`, {
      withCredentials: true
    });
  }

  getPendingDeliveryUsers(): Observable<{ success: boolean; data: PendingDelivery[] }> {
    return this.http.get<{ success: boolean; data: PendingDelivery[] }>(`${this.apiUrl}/admin/pending/delivery`, {
      withCredentials: true
    });
  }

  // Restaurant Management
  getAllRestaurants(filters?: RestaurantFilters): Observable<{ success: boolean; data: RestaurantsResponse }> {
    let params = new HttpParams();

    if (filters) {
      if (filters.status) params = params.set('status', filters.status);
      if (filters.verified !== undefined) params = params.set('verified', filters.verified.toString());
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
      if (filters.search) params = params.set('search', filters.search);
    }

    return this.http.get<{ success: boolean; data: RestaurantsResponse }>(`${this.apiUrl}/admin/restaurants`, {
      params,
      withCredentials: true
    });
  }

  getRestaurantById(restaurantId: string): Observable<{ success: boolean; data: AdminRestaurant }> {
    return this.http.get<{ success: boolean; data: AdminRestaurant }>(`${this.apiUrl}/admin/restaurants/${restaurantId}`, {
      withCredentials: true
    });
  }

  approveRestaurant(restaurantId: string, request: ApprovalRequest): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/admin/restaurants/${restaurantId}/approve`, request, {
      withCredentials: true
    });
  }

  updateRestaurantStatus(restaurantId: string, request: StatusUpdateRequest): Observable<{ success: boolean; message: string }> {
    return this.http.patch<{ success: boolean; message: string }>(`${this.apiUrl}/admin/restaurants/${restaurantId}/status`, request, {
      withCredentials: true
    });
  }

  deleteRestaurant(restaurantId: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/admin/restaurants/${restaurantId}`, {
      withCredentials: true
    });
  }

  // Delivery Management
  getAllDeliveryPersonnel(filters?: DeliveryFilters): Observable<{ success: boolean; data: DeliveryResponse }> {
    let params = new HttpParams();

    if (filters) {
      if (filters.status) params = params.set('status', filters.status);
      if (filters.isOnline !== undefined) params = params.set('isOnline', filters.isOnline.toString());
      if (filters.verified !== undefined) params = params.set('verified', filters.verified.toString());
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
      if (filters.search) params = params.set('search', filters.search);
    }

    return this.http.get<{ success: boolean; data: DeliveryResponse }>(`${this.apiUrl}/admin/delivery`, {
      params,
      withCredentials: true
    });
  }

  getDeliveryById(deliveryId: string): Observable<{ success: boolean; data: AdminDelivery }> {
    return this.http.get<{ success: boolean; data: AdminDelivery }>(`${this.apiUrl}/admin/delivery/${deliveryId}`, {
      withCredentials: true
    });
  }

  approveDelivery(deliveryId: string, request: ApprovalRequest): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/admin/delivery/${deliveryId}/approve`, request, {
      withCredentials: true
    });
  }

  updateDeliveryStatus(deliveryId: string, request: StatusUpdateRequest): Observable<{ success: boolean; message: string }> {
    return this.http.patch<{ success: boolean; message: string }>(`${this.apiUrl}/admin/delivery/${deliveryId}/status`, request, {
      withCredentials: true
    });
  }

  deleteDelivery(deliveryId: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/admin/delivery/${deliveryId}`, {
      withCredentials: true
    });
  }

  // Order Management
  getAllOrders(filters?: OrderFilters): Observable<{ success: boolean; data: OrdersResponse }> {
    let params = new HttpParams();

    if (filters) {
      if (filters.status) params = params.set('status', filters.status);
      if (filters.paymentStatus) params = params.set('paymentStatus', filters.paymentStatus);
      if (filters.dateFrom) params = params.set('dateFrom', filters.dateFrom);
      if (filters.dateTo) params = params.set('dateTo', filters.dateTo);
      if (filters.customerId) params = params.set('customerId', filters.customerId);
      if (filters.restaurantId) params = params.set('restaurantId', filters.restaurantId);
      if (filters.deliveryId) params = params.set('deliveryId', filters.deliveryId);
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
      if (filters.search) params = params.set('search', filters.search);
    }

    return this.http.get<{ success: boolean; data: OrdersResponse }>(`${this.apiUrl}/admin/orders`, {
      params,
      withCredentials: true
    });
  }

  getOrderById(orderId: string): Observable<{ success: boolean; data: AdminOrder }> {
    return this.http.get<{ success: boolean; data: AdminOrder }>(`${this.apiUrl}/admin/orders/${orderId}`, {
      withCredentials: true
    });
  }

  updateOrderStatus(orderId: string, status: string): Observable<{ success: boolean; message: string }> {
    return this.http.patch<{ success: boolean; message: string }>(`${this.apiUrl}/admin/orders/${orderId}/status`,
      { status },
      { withCredentials: true }
    );
  }

  cancelOrder(orderId: string, reason: string): Observable<{ success: boolean; message: string }> {
    return this.http.patch<{ success: boolean; message: string }>(`${this.apiUrl}/admin/orders/${orderId}/cancel`,
      { reason },
      { withCredentials: true }
    );
  }

  // System Settings
  getSystemSettings(): Observable<{ success: boolean; data: SystemSettings }> {
    return this.http.get<{ success: boolean; data: SystemSettings }>(`${this.apiUrl}/admin/settings`, {
      withCredentials: true
    });
  }

  updateSystemSettings(settings: Partial<SystemSettings>): Observable<{ success: boolean; message: string }> {
    return this.http.patch<{ success: boolean; message: string }>(`${this.apiUrl}/admin/settings`, settings, {
      withCredentials: true
    });
  }

  // Bulk Operations
  bulkApproveUsers(userIds: string[], status: 'verified' | 'rejected', reason: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/admin/users/bulk-approve`,
      { userIds, status, reason },
      { withCredentials: true }
    );
  }

  bulkUpdateUserStatus(userIds: string[], isActive: boolean, reason: string): Observable<{ success: boolean; message: string }> {
    return this.http.patch<{ success: boolean; message: string }>(`${this.apiUrl}/admin/users/bulk-status`,
      { userIds, isActive, reason },
      { withCredentials: true }
    );
  }

  bulkDeleteUsers(userIds: string[]): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/admin/users/bulk-delete`,
      { userIds },
      { withCredentials: true }
    );
  }
}
