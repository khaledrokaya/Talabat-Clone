import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { AdminService, DashboardData } from '../../shared/services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.scss']
})
export class AdminDashboard implements OnInit {
  isLoading = true;
  dashboardData: DashboardData | null = null;
  errorMessage = '';
  currentAdmin: any = null;
  chartPeriod = '7d';

  constructor(
    private adminService: AdminService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadDashboardData();
    this.loadCurrentAdmin();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.adminService.getDashboardData().subscribe({
      next: (response) => {
        if (response.success) {
          this.dashboardData = response.data;
        } else {
          this.errorMessage = 'Failed to load dashboard data';
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to load dashboard data. Please try again.';
        this.isLoading = false;
      }
    });
  }

  loadCurrentAdmin(): void {
    // Load current admin data from localStorage or service
    const adminData = localStorage.getItem('adminData');
    if (adminData) {
      this.currentAdmin = JSON.parse(adminData);
    }
  }

  refreshData(): void {
    this.loadDashboardData();
  }

  exportDashboardReport(): void {
    // Implement export functionality
    // This would typically generate a PDF or Excel report
  }

  setChartPeriod(period: string): void {
    this.chartPeriod = period;
    // Update chart data based on period
  }

  getCurrentTime(): string {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getCompletionRate(): number {
    if (!this.dashboardData) return 0;
    const total = this.dashboardData.orders.total;
    const completed = this.dashboardData.orders.completed;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }

  getRestaurantRank(restaurant: any): string {
    // This would be calculated based on the restaurant's position in the top restaurants list
    const topRestaurants = this.dashboardData?.revenue.topRestaurants || [];
    const index = topRestaurants.findIndex(r => r.id === restaurant.id);
    return index >= 0 ? `#${index + 1}` : '#N/A';
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  formatNumber(num: number): string {
    if (!num) return '0';
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  }

  formatCurrency(amount: number): string {
    if (!amount) return '0.00 EGP';
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 2
    }).format(amount);
  }

  formatPercentage(percentage: number): string {
    if (!percentage) return '0.0%';
    return percentage.toFixed(1) + '%';
  }
}
