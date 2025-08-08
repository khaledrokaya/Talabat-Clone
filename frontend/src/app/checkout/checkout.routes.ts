import { Routes } from '@angular/router';
import { Checkout } from './checkout/checkout';
import { AddressSelection } from './address-selection/address-selection';
import { PaymentMethod } from './payment-method/payment-method';

export const CHECKOUT_ROUTES: Routes = [
  { path: '', component: Checkout },
  { path: 'address-selection', component: AddressSelection },
  { path: 'payment-method', component: PaymentMethod }
];


