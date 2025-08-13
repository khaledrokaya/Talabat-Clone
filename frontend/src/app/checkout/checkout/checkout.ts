import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CartService, Cart } from '../../shared/services/cart.service';
import { OrderService, CreateOrderRequest } from '../../shared/services/order.service';
import { ToastService } from '../../shared/services/toast.service';
import { Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { Address } from '../../shared/models/address';
import { UserService } from '../../shared/services/user.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss'
})
export class Checkout implements OnInit {
  cart$: Observable<Cart>;
  addresses: Address[] = [];
  selectedAddress: Address | null = null;
  paymentMethod: string = 'cash_on_delivery';
  notes: string = '';
  loading = true;
  errorMessage = '';
  currentUser: any = null;

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private userService: UserService,
    private router: Router,
    private toastService: ToastService
  ) {
    this.cart$ = this.cartService.cart$;
  }

  ngOnInit(): void {
    this.loadAddresses();
  }

  // Helper method to calculate total with tax
  calculateTotal(subtotal: number): number {
    const deliveryFee = 10;
    const tax = subtotal * 0.14;
    return subtotal + deliveryFee + tax;
  }

  // Helper method to calculate tax
  calculateTax(subtotal: number): number {
    return subtotal * 0.14;
  }

  loadAddresses(): void {
    this.userService.getProfile().subscribe({
      next: (response) => {
        const user = response.data?.user || response;
        this.currentUser = user; // Store user data for order creation

        // Handle address from user profile
        if (user.address) {
          const userAddress: Address = {
            id: 'user-address',
            label: 'Current Address',
            street: user.address.street,
            city: user.address.city,
            area: user.address.state || user.address.area || '',
            building: user.address.building || '',
            floor: user.address.floor || '',
            apartment: user.address.apartment || '',
            coordinates: user.address.coordinates || { latitude: 30.0444, longitude: 31.2357 }, // Default to Cairo if no coordinates
            isDefault: true
          };
          this.addresses = [userAddress];
          this.selectedAddress = userAddress;
        } else {
          this.addresses = [];
        }
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load user data.';
        this.loading = false;
      }
    });
  }

  placeOrder(): void {
    const currentCart = this.cartService.currentCart;
    if (!currentCart.restaurantId || currentCart.items.length === 0) {
      this.errorMessage = 'Shopping cart is empty or no restaurant selected.';
      this.toastService.warning(this.errorMessage, 'Cart Empty');
      return;
    }

    if (!this.selectedAddress) {
      this.errorMessage = 'Please select a delivery address.';
      this.toastService.warning(this.errorMessage, 'Address Required');
      return;
    }

    if (!this.currentUser) {
      this.errorMessage = 'User information not loaded. Please refresh the page.';
      this.toastService.error(this.errorMessage, 'User Error');
      return;
    }

    // Calculate totals
    const subtotal = currentCart.totalAmount;
    const deliveryFee = 10; // Fixed delivery fee in EGP
    const taxRate = 0.14; // 14% tax rate (common in Egypt)
    const tax = Math.round(subtotal * taxRate * 100) / 100; // Round to 2 decimal places
    const totalAmount = subtotal + deliveryFee + tax;

    // Map payment method to backend format
    const paymentMethodMap: { [key: string]: string } = {
      'cash_on_delivery': 'cash',
      'credit_card': 'card',
      'wallet': 'digital-wallet'
    };

    const orderRequest = {
      restaurantId: currentCart.restaurantId,
      customerId: this.currentUser.id || this.currentUser._id,
      items: currentCart.items.map(item => ({
        mealId: item.productId,
        name: item.productName,
        price: item.unitPrice,
        quantity: item.quantity,
        specialInstructions: item.selectedOptions?.map(opt => opt.choiceName).join(', ') || ''
      })),
      deliveryAddress: {
        street: this.selectedAddress.street,
        city: this.selectedAddress.city,
        state: this.selectedAddress.area || this.selectedAddress.city,
        zipCode: '12345', // Default zip code for Egypt if not provided
        coordinates: {
          lat: this.selectedAddress.coordinates?.latitude || 30.0444,
          lng: this.selectedAddress.coordinates?.longitude || 31.2357
        },
        additionalInfo: [
          this.selectedAddress.building && `Building: ${this.selectedAddress.building}`,
          this.selectedAddress.floor && `Floor: ${this.selectedAddress.floor}`,
          this.selectedAddress.apartment && `Apartment: ${this.selectedAddress.apartment}`
        ].filter(Boolean).join(', ')
      },
      customerInfo: {
        name: `${this.currentUser.firstName || ''} ${this.currentUser.lastName || ''}`.trim() || this.currentUser.name || 'Customer',
        phone: this.currentUser.phone || '01000000000',
        email: this.currentUser.email
      },
      paymentMethod: paymentMethodMap[this.paymentMethod] || 'cash',
      subtotal: subtotal,
      deliveryFee: deliveryFee,
      tax: tax,
      totalAmount: totalAmount,
      preparationTime: 30, // Default 30 minutes preparation time
      specialInstructions: this.notes,
      status: 'pending',
      paymentStatus: 'pending'
    };

    this.orderService.createOrder(orderRequest as any).subscribe({
      next: (order) => {
        this.cartService.clearCart();
        const orderNumber = order?.data?.order?.orderNumber;
        this.toastService.showOrderSuccess(orderNumber);
        // Redirect to order confirmation or order history page
        this.router.navigate(['/orders']);
      },
      error: (error) => {
        this.errorMessage = error.error?.data?.message || error.error?.message || 'Failed to place order. Please try again.';
        this.toastService.error(this.errorMessage, 'Order Failed');
      }
    });
  }
}

