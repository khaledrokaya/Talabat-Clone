import { Routes } from '@angular/router';
import { authGuard, customerGuard, restaurantGuard, adminGuard } from './shared/guards/auth.guard';
import { UnauthorizedComponent } from './shared/components/unauthorized.component';

export const routes: Routes = [
  { path: 'auth', loadChildren: () => import('./auth/auth.routes').then(m => m.AUTH_ROUTES) },
  { path: 'home', loadChildren: () => import('./home/home.routes').then(m => m.HOME_ROUTES) },
  { path: 'restaurants', loadChildren: () => import('./restaurants/restaurants.routes').then(m => m.RESTAURANTS_ROUTES) },
  { path: 'cart', loadChildren: () => import('./cart/cart.routes').then(m => m.CART_ROUTES), canActivate: [authGuard] },
  { path: 'checkout', loadChildren: () => import('./checkout/checkout.routes').then(m => m.CHECKOUT_ROUTES), canActivate: [customerGuard] },
  { path: 'orders', loadChildren: () => import('./orders/orders.routes').then(m => m.ORDERS_ROUTES), canActivate: [authGuard] },
  { path: 'profile', loadChildren: () => import('./profile/profile.routes').then(m => m.PROFILE_ROUTES), canActivate: [authGuard] },
  { path: 'admin', loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES), canActivate: [adminGuard] },
  { path: 'restaurant-dashboard', loadChildren: () => import('./restaurant-dashboard/restaurant-dashboard.routes').then(m => m.RESTAURANT_DASHBOARD_ROUTES), canActivate: [restaurantGuard] },
  { path: 'delivery-dashboard', redirectTo: '/orders', pathMatch: 'full' }, // Delivery users use orders section
  { path: 'unauthorized', component: UnauthorizedComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' }
];


