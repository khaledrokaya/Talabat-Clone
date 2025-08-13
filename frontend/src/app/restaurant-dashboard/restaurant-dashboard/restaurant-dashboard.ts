import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../shared/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import { RestaurantService } from '../../shared/services/restaurant.service';
import { RestaurantAnalyticsService, AnalyticsData } from '../../shared/services/restaurant-analytics.service';
import { MockRestaurantAnalyticsService } from '../../shared/services/mock-restaurant-analytics.service';
import { OrderService, OrderFilters } from '../../shared/services/order.service';
import { User } from '../../shared/models/user';
import { Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

interface RecentMeal {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  isActive: boolean;
}

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
  openOrderDropdownId: string | null = null;

  dashboardData: DashboardData = {
    totalRevenue: 0,
    totalOrders: 0,
    averageRating: 0,
    totalCustomers: 0
  };

  recentOrders: any[] = [];
  recentMeals: RecentMeal[] = [];
  topProducts: TopProduct[] = [];

  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private restaurantService: RestaurantService,
    private restaurantAnalyticsService: RestaurantAnalyticsService,
    private toastService: ToastService,
    private mockAnalyticsService: MockRestaurantAnalyticsService,
    private orderService: OrderService,
    private router: Router
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
    this.loadRecentMeals();
  }

  private loadAnalytics() {
    // Try to load analytics from API, fallback to mock data
    const analyticsSub = this.restaurantAnalyticsService.getAnalyticsForPeriod(
      this.selectedPeriod as '7days' | '30days' | '3months'
    )
      .pipe(
        catchError((error) => {
          return this.mockAnalyticsService.getAnalyticsForPeriod(
            this.selectedPeriod as '7days' | '30days' | '3months'
          );
        })
      )
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.analyticsData = response.data;

            // Update dashboard with analytics data if needed
            if (this.analyticsData.restaurant) {
              this.dashboardData.averageRating = this.analyticsData.restaurant.rating || this.dashboardData.averageRating;
            }
          }
        },
        error: (error) => {
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
              this.recentOrders = dashboardData.recentOrders || [];
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
          // Ensure arrays are initialized on error
          this.recentOrders = [];
          this.topProducts = [];
          this.loading = false;
        }
      });
    this.subscriptions.push(dashboardSub);
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
      .subscribe({
        next: (response: any) => {
          if (response.success && response.data) {
            // Handle both response formats: direct array or nested orders
            if (Array.isArray(response.data)) {
              this.recentOrders = response.data.slice(0, 5) || [];
            } else {
              this.recentOrders = response.data.orders?.slice(0, 5) || [];
            }
          } else {
            this.recentOrders = [];
          }
        },
        error: (error) => {
          this.recentOrders = [];
        }
      });
    this.subscriptions.push(ordersSub);
  }

  private loadRecentMeals() {
    // Mock recent meals data - you can replace this with actual API call
    this.recentMeals = [
      {
        id: '1',
        name: 'Margherita Pizza',
        description: 'Fresh tomatoes, mozzarella, basil',
        price: 150,
        image: '',
        isActive: true
      },
      {
        id: '2',
        name: 'Caesar Salad',
        description: 'Crispy lettuce, parmesan, croutons',
        price: 80,
        image: '',
        isActive: true
      },
      {
        id: '3',
        name: 'Beef Burger',
        description: 'Juicy beef patty with fresh vegetables',
        price: 120,
        image: '',
        isActive: false
      },
      {
        id: '4',
        name: 'Pasta Carbonara',
        description: 'Creamy pasta with bacon and parmesan',
        price: 95,
        image: '',
        isActive: true
      },
      {
        id: '5',
        name: 'Grilled Chicken',
        description: 'Tender grilled chicken breast',
        price: 110,
        image: '',
        isActive: true
      }
    ];
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
    this.loadAnalytics();
  }

  updateOrderStatus(orderId: string, newStatus: string) {
    if (confirm(`Are you sure you want to update this order to ${newStatus}?`)) {
      // Use the PATCH /api/orders/{id}/status endpoint
      const updateData = {
        status: newStatus as any, // Cast to OrderStatus type
        notes: `Status updated to ${newStatus} by restaurant`
      };

      // Call the order service with the correct endpoint structure
      const orderSub = this.orderService.updateOrderStatus(orderId, updateData)
        .subscribe({
          next: (response) => {
            if (response.success) {
              // Update local order status
              const order = this.recentOrders.find(o => o._id === orderId);
              if (order) {
                order.status = newStatus;
              }
              this.closeOrderDropdown();
            } else {
              this.toastService.error('Failed to update order status. Please try again.');
            }
          },
          error: (error: any) => {
            this.toastService.error('Failed to update order status. Please try again.');
          }
        });
      this.subscriptions.push(orderSub);
    }
  }

  viewOrderDetails(orderId: string) {
    // Navigate to order details page using the order-details component
    this.router.navigate(['/orders/details', orderId]);
  }

  // Order dropdown management
  toggleOrderDropdown(orderId: string) {
    if (this.openOrderDropdownId === orderId) {
      this.closeOrderDropdown();
    } else {
      this.openOrderDropdownId = orderId;
    }
  }

  closeOrderDropdown() {
    this.openOrderDropdownId = null;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown')) {
      this.closeOrderDropdown();
    }
  }

  // Order status helpers
  canUpdateStatus(status: string): boolean {
    return ['pending', 'confirmed', 'preparing', 'ready'].includes(status);
  }

  // Meal management methods
  editMeal(mealId: string) {
    // Navigate to meal edit page or open edit modal
    window.open(`/restaurant-dashboard/meals-management/edit/${mealId}`, '_blank');
  }

  toggleMealStatus(mealId: string, currentStatus: boolean) {
    if (confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this meal?`)) {
      // Update meal status in the array (you can replace with API call)
      const meal = this.recentMeals.find(m => m.id === mealId);
      if (meal) {
        meal.isActive = !currentStatus;
      }
    }
  }

  toggleRestaurantStatus() {
    this.restaurantStatus = !this.restaurantStatus;
    // Call API to update restaurant status
  }

  downloadReport() {
    // Generate and download report
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

