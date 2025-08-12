import { Routes } from '@angular/router';
import { RestaurantOrders } from './restaurant-orders/restaurant-orders';
import { CustomerOrders } from './customer-orders/customer-orders';
import { OrderDetailsComponent } from './order-details/order-details';

export const ORDERS_ROUTES: Routes = [
  { path: 'customer', component: CustomerOrders },
  { path: 'restaurant', component: RestaurantOrders },
  { path: 'details/:id', component: OrderDetailsComponent },
  { path: '', redirectTo: 'customer', pathMatch: 'full' }
];


