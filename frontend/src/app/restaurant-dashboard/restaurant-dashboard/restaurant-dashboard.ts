import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../shared/services/auth.service';
import { RestaurantService } from '../../shared/services/restaurant.service';
import { RestaurantAnalyticsService, DashboardStats, AnalyticsData } from '../../shared/services/restaurant-analytics.service';
import { MockRestaurantAnalyticsService } from '../../shared/services/mock-restaurant-analytics.service';
import { OrderService, OrderFilters, ApiResponse, OrdersListResponse } from '../../shared/services/order.service';
import { User } from '../../shared/models/user';
import { Order } from '../../shared/models/order';
import { Product } from '../../shared/models/product';
import { Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

interface DashboardData {
  totalRevenue: number;
  totalOrders: number;
  averageRating: number;
  totalCustomers: number;
}

interface TopProduct {
  id: string;
  name: string;
  image?: string;
  soldCount: number;
  revenue: number;
}

@Component({
  selector: 'app-restaurant-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './restaurant-dashboard.html',
  styleUrls: ['./restaurant-dashboard.scss']
})
export class RestaurantDashboard implements OnInit, OnDestroy {
  currentUser: User | null = null;
  loading = false;
  selectedPeriod = '30days';
  restaurantStatus = true;
  analyticsData: AnalyticsData | null = null;

  dashboardData: DashboardData = {
    totalRevenue: 0,
    totalOrders: 0,
    averageRating: 0,
    totalCustomers: 0
  };

  recentOrders: Order[] = [];
  topProducts: TopProduct[] = [];

  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private restaurantService: RestaurantService,
    private restaurantAnalyticsService: RestaurantAnalyticsService,
    private mockAnalyticsService: MockRestaurantAnalyticsService,
    private orderService: OrderService
  ) { }

  ngOnInit() {
    this.subscribeToAuth();
    this.loadDashboardData();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private subscribeToAuth() {
    const authSub = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user && user.role === 'restaurant_owner') {
        this.loadDashboardData();
      }
    });
    this.subscriptions.push(authSub);
  }

  private loadDashboardData() {
    if (!this.currentUser || this.currentUser.role !== 'restaurant_owner') {
      return;
    }

    this.loading = true;

    // Load all dashboard data
    this.loadStats();
    this.loadAnalytics();
    this.loadRecentOrders();
    this.loadTopProducts();
  }

  private loadAnalytics() {
    // Try to load analytics from API, fallback to mock data
    const analyticsSub = this.restaurantAnalyticsService.getAnalyticsForPeriod(
      this.selectedPeriod as '7days' | '30days' | '3months'
    )
      .pipe(
        catchError((error) => {
          console.log('Analytics API not available, using mock data:', error);
          return this.mockAnalyticsService.getAnalyticsForPeriod(
            this.selectedPeriod as '7days' | '30days' | '3months'
          );
        })
      )
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.analyticsData = response.data;
            console.log('Analytics data loaded:', this.analyticsData);

            // Update dashboard with analytics data if needed
            if (this.analyticsData.restaurant) {
              this.dashboardData.averageRating = this.analyticsData.restaurant.rating || this.dashboardData.averageRating;
            }
          }
        },
        error: (error) => {
          console.error('Error loading analytics:', error);
        }
      });
    this.subscriptions.push(analyticsSub);
  }

  getPeriodDays(): number {
    switch (this.selectedPeriod) {
      case '7days': return 7;
      case '30days': return 30;
      case '3months': return 90;
      default: return 30;
    }
  }

  private loadStats() {
    // Initialize dashboard data with zeros first
    this.dashboardData = {
      totalRevenue: 0,
      totalOrders: 0,
      averageRating: 0,
      totalCustomers: 0
    };

    // Try to load dashboard statistics from API, fallback to mock data
    const dashboardSub = this.restaurantAnalyticsService.getDashboardData()
      .pipe(
        catchError((error) => {
          console.log('API not available, keeping initial zero values:', error);
          // Don't load mock data - keep zeros to show actual state
          this.loading = false;
          return of({ success: false, data: null });
        })
      )
      .subscribe({
        next: (response) => {
          if (response.success && response.data && response.data.dashboard) {
            const dashboardData = response.data.dashboard;

            // Map the API response to our dashboard format
            this.dashboardData = {
              totalRevenue: dashboardData.todayStats?.revenue || 0,
              totalOrders: dashboardData.todayStats?.orders || 0,
              averageRating: dashboardData.weeklyStats?.averageRating || 0,
              totalCustomers: dashboardData.weeklyStats?.uniqueCustomers || 0
            };

            // Update recent orders if available
            if (dashboardData.recentOrders && dashboardData.recentOrders.length > 0) {
              this.recentOrders = this.mapApiOrdersToLocal(dashboardData.recentOrders);
            } else {
              this.recentOrders = []; // Empty array if no orders
            }

            // Update popular meals/products if available
            if (dashboardData.popularMeals && dashboardData.popularMeals.length > 0) {
              this.topProducts = this.mapApiMealsToProducts(dashboardData.popularMeals);
            } else {
              this.topProducts = []; // Empty array if no popular meals
            }
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading dashboard data:', error);
          // Ensure arrays are initialized on error
          this.recentOrders = [];
          this.topProducts = [];
          this.loading = false;
        }
      });
    this.subscriptions.push(dashboardSub);
  }

  private mapApiOrdersToLocal(apiOrders: any[]): Order[] {
    if (!apiOrders || !Array.isArray(apiOrders)) {
      return [];
    }
    return apiOrders.map(order => ({
      id: order.orderId || order.id,
      orderNumber: order.orderId || order.orderNumber,
      customer: {
        id: order.customerId || '1',
        name: order.customer || 'مستخدم غير معروف',
        email: order.customerEmail || ''
      },
      total: order.total || 0,
      status: order.status || 'pending',
      createdAt: order.createdAt ? new Date(order.createdAt) : new Date(),
      items: order.items || [],
      deliveryAddress: {
        street: 'شارع الملك فهد',
        city: 'الرياض',
        area: 'العليا',
        district: 'العليا',
        building: '123',
        floor: '2',
        apartment: '5'
      },
      paymentMethod: order.paymentMethod || 'cash'
    }));
  }

  private mapApiMealsToProducts(apiMeals: any[]): TopProduct[] {
    if (!apiMeals || !Array.isArray(apiMeals)) {
      return [];
    }
    return apiMeals.map(meal => ({
      id: meal.id || meal._id,
      name: meal.name,
      image: meal.image || '',
      soldCount: meal.orders || 0,
      revenue: meal.revenue || 0
    }));
  }

  private loadRecentOrders() {
    // Load real orders from API
    const orderFilters: OrderFilters = {
      limit: 5,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };

    const ordersSub = this.orderService.getOrders(orderFilters)
      .pipe(
        catchError((error) => {
          console.log('Orders API not available, using mock data:', error);
          return of({
            success: true,
            message: 'Mock data',
            data: {
              orders: [
                {
                  id: '1',
                  orderNumber: 'ORD-001',
                  customer: { id: '1', name: 'Ahmed Mohamed', email: 'ahmed@example.com' },
                  total: 85.50,
                  status: 'pending',
                  createdAt: new Date(),
                  items: [],
                  deliveryAddress: {
                    street: 'King Fahd Street',
                    city: 'Riyadh',
                    area: 'Al Olaya',
                    district: 'Al Olaya',
                    building: '123'
                  },
                  paymentMethod: 'cash'
                } as Order,
                {
                  id: '2',
                  orderNumber: 'ORD-002',
                  customer: { id: '2', name: 'Fatima Ali', email: 'fatima@example.com' },
                  total: 120.00,
                  status: 'preparing',
                  createdAt: new Date(Date.now() - 30 * 60 * 1000),
                  items: [],
                  deliveryAddress: {
                    street: 'King Fahd Street',
                    city: 'Riyadh',
                    area: 'Al Olaya',
                    district: 'Al Olaya',
                    building: '456'
                  },
                  paymentMethod: 'card'
                } as Order,
                {
                  id: '3',
                  orderNumber: 'ORD-003',
                  customer: { id: '3', name: 'Mohammed Salem', email: 'mohammed@example.com' },
                  total: 65.75,
                  status: 'ready',
                  createdAt: new Date(Date.now() - 60 * 60 * 1000),
                  items: [],
                  deliveryAddress: {
                    street: 'King Fahd Street',
                    city: 'Riyadh',
                    area: 'Al Olaya',
                    district: 'Al Olaya',
                    building: '789'
                  },
                  paymentMethod: 'cash'
                } as Order
              ],
              pagination: {
                page: 1,
                limit: 5,
                total: 3,
                pages: 1,
                hasNext: false,
                hasPrev: false
              }
            }
          } as ApiResponse<OrdersListResponse>);
        })
      )
      .subscribe({
        next: (response: ApiResponse<OrdersListResponse>) => {
          if (response.success && response.data && response.data.orders) {
            this.recentOrders = response.data.orders;
          } else {
            this.recentOrders = [];
          }
        },
        error: (error) => {
          console.error('Error loading orders:', error);
          this.recentOrders = []; // Ensure it's always an array
        }
      });
    this.subscriptions.push(ordersSub);
  }

  private loadTopProducts() {
    // Simulate top products data
    this.topProducts = [
      {
        id: '1',
        name: 'Premium Beef Burger',
        image: '',
        soldCount: 45,
        revenue: 2250
      },
      {
        id: '2',
        name: 'Margherita Pizza',
        image: '',
        soldCount: 38,
        revenue: 1900
      },
      {
        id: '3',
        name: 'Caesar Salad',
        image: '',
        soldCount: 32,
        revenue: 960
      }
    ];
  }

  refreshDashboard() {
    this.loadDashboardData();
  }

  updateChart() {
    // Update chart based on selected period and reload analytics
    console.log('Updating chart for period:', this.selectedPeriod);
    this.loadAnalytics();
  }

  updateOrderStatus(orderId: string, newStatus: string) {
    const orderSub = this.orderService.updateOrderStatusEnhanced(orderId, {
      status: newStatus as any
    }).subscribe({
      next: () => {
        // Update local order status
        const order = this.recentOrders.find(o => o.id === orderId);
        if (order) {
          order.status = newStatus as any;
        }
      },
      error: (error: any) => {
        console.error('Error updating order status:', error);
      }
    });
    this.subscriptions.push(orderSub);
  }

  viewOrderDetails(orderId: string) {
    // Navigate to order details or open modal
    console.log('Viewing order details for:', orderId);
  }

  toggleRestaurantStatus() {
    this.restaurantStatus = !this.restaurantStatus;
    // Call API to update restaurant status
    console.log('Restaurant status:', this.restaurantStatus ? 'Open' : 'Closed');
  }

  downloadReport() {
    // Generate and download report
    console.log('Downloading report...');
  }

  getStatusText(status: string): string {
    const statusTexts: { [key: string]: string } = {
      'pending': 'Pending',
      'confirmed': 'Confirmed',
      'preparing': 'Preparing',
      'ready': 'Ready',
      'out_for_delivery': 'Out for Delivery',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled'
    };
    return statusTexts[status] || status;
  }

  getNextStatus(currentStatus: string): string {
    const statusFlow: { [key: string]: string } = {
      'pending': 'confirmed',
      'confirmed': 'preparing',
      'preparing': 'ready',
      'ready': 'out_for_delivery',
      'out_for_delivery': 'delivered'
    };
    return statusFlow[currentStatus] || currentStatus;
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) {
      return 'Not specified';
    }

    const now = new Date();
    const targetDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - targetDate.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) {
      return 'Now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hours ago`;
    } else {
      return targetDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  }

  // Analytics display methods
  getTotalMeals(): number {
    return this.analyticsData?.meals?.total || 0;
  }

  getActiveMeals(): number {
    return this.analyticsData?.meals?.active || 0;
  }

  getInactiveMeals(): number {
    return this.analyticsData?.meals?.inactive || 0;
  }

  getAnalyticsPeriod(): string {
    if (!this.analyticsData?.period) return '';

    const start = new Date(this.analyticsData.period.startDate);
    const end = new Date(this.analyticsData.period.endDate);

    return `${start.toLocaleDateString('ar-SA')} - ${end.toLocaleDateString('ar-SA')}`;
  }

  // Real-time data refresh
  startRealTimeUpdates() {
    // Refresh dashboard data every 5 minutes
    setInterval(() => {
      this.refreshDashboard();
    }, 5 * 60 * 1000);
  }
}

