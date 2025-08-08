import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./admin-layout/admin-layout').then(m => m.AdminLayout),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./admin-dashboard/admin-dashboard').then(m => m.AdminDashboard)
      },
      {
        path: 'users',
        loadComponent: () => import('./users-management/users-management-new').then(m => m.UsersManagement)
      },
      {
        path: 'restaurants',
        loadComponent: () => import('./restaurants-management/restaurants-management').then(m => m.RestaurantsManagement)
      },
      {
        path: 'delivery',
        loadComponent: () => import('./delivery-management/delivery-management').then(m => m.DeliveryManagement)
      },
      {
        path: 'orders',
        loadComponent: () => import('./orders-management/orders-management').then(m => m.OrdersManagement)
      },
      {
        path: 'approvals',
        loadComponent: () => import('./approvals-management/approvals-management').then(m => m.ApprovalsManagement)
      },
      {
        path: 'analytics',
        loadComponent: () => import('./analytics/analytics').then(m => m.Analytics)
      },
      {
        path: 'settings',
        loadComponent: () => import('./settings/settings').then(m => m.Settings)
      }
    ]
  }
];

