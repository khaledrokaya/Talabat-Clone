import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './admin-layout.html',
  styleUrls: ['./admin-layout.scss']
})
export class AdminLayout implements OnInit {
  currentAdmin: any = null;
  activeTab = 'dashboard';
  isSidebarCollapsed = false;

  adminNavItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'fas fa-tachometer-alt',
      route: '/admin/dashboard',
      description: 'Overview and analytics'
    },
    {
      id: 'users',
      label: 'Users Management',
      icon: 'fas fa-users',
      route: '/admin/users',
      description: 'Manage customers and users'
    },
    {
      id: 'restaurants',
      label: 'Restaurants',
      icon: 'fas fa-utensils',
      route: '/admin/restaurants',
      description: 'Manage restaurants and approvals'
    },
    {
      id: 'delivery',
      label: 'Delivery Partners',
      icon: 'fas fa-motorcycle',
      route: '/admin/delivery',
      description: 'Manage delivery personnel'
    },
    {
      id: 'orders',
      label: 'Orders Management',
      icon: 'fas fa-clipboard-list',
      route: '/admin/orders',
      description: 'Track and manage orders'
    },
    {
      id: 'approvals',
      label: 'Pending Approvals',
      icon: 'fas fa-check-circle',
      route: '/admin/approvals',
      description: 'Review pending requests'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: 'fas fa-chart-line',
      route: '/admin/analytics',
      description: 'Detailed reports and insights'
    },
    {
      id: 'settings',
      label: 'System Settings',
      icon: 'fas fa-cog',
      route: '/admin/settings',
      description: 'Platform configuration'
    }
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadAdminData();
    this.setActiveTabFromRoute();
  }

  loadAdminData(): void {
    // Get admin data from auth service
    this.currentAdmin = this.authService.getCurrentUser();
  }

  setActiveTabFromRoute(): void {
    const url = this.router.url;
    const foundItem = this.adminNavItems.find(item => url.includes(item.id));
    if (foundItem) {
      this.activeTab = foundItem.id;
    }
  }

  setActiveTab(tabId: string): void {
    this.activeTab = tabId;
    const navItem = this.adminNavItems.find(item => item.id === tabId);
    if (navItem) {
      this.router.navigate([navItem.route]);
    }
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/admin-login']);
  }

  goToMainSite(): void {
    this.router.navigate(['/']);
  }
}
