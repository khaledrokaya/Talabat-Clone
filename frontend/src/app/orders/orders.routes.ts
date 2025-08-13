import { Routes } from '@angular/router';
import { CustomerOrders } from './customer-orders/customer-orders';
import { OrderDetailsComponent } from './order-details/order-details';
import { OrderTrackingComponent } from './order-tracking/order-tracking.component';

export const ORDERS_ROUTES: Routes = [
  { path: 'customer', component: CustomerOrders },
  { path: 'details/:id', component: OrderDetailsComponent },
  { path: 'tracking/:id', component: OrderTrackingComponent },
  { path: '', redirectTo: 'customer', pathMatch: 'full' }
];


