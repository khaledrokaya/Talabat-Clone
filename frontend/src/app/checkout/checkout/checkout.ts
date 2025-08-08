import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService, Cart } from '../../shared/services/cart.service';
import { OrderService, CreateOrderRequest } from '../../shared/services/order.service';
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

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private userService: UserService,
    private router: RouterModule // Inject RouterModule
  ) {
    this.cart$ = this.cartService.cart$;
  }

  ngOnInit(): void {
    this.loadAddresses();
  }

  loadAddresses(): void {
    this.userService.getProfile().subscribe({
      next: (user) => {
        this.addresses = user.addresses || [];
        if (this.addresses.length > 0) {
          this.selectedAddress = this.addresses[0]; // Select first address by default
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading addresses:', error);
        this.errorMessage = 'فشل تحميل العناوين.';
        this.loading = false;
      }
    });
  }

  placeOrder(): void {
    const currentCart = this.cartService.currentCart;
    if (!currentCart.restaurantId || currentCart.items.length === 0) {
      this.errorMessage = 'سلة التسوق فارغة أو لا تحتوي على مطعم محدد.';
      return;
    }

    if (!this.selectedAddress) {
      this.errorMessage = 'الرجاء اختيار عنوان التوصيل.';
      return;
    }

    const orderRequest: CreateOrderRequest = {
      restaurantId: currentCart.restaurantId,
      items: currentCart.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        selectedOptions: item.selectedOptions
      })),
      deliveryAddress: this.selectedAddress,
      paymentMethod: this.paymentMethod,
      notes: this.notes
    };

    this.orderService.createOrder(orderRequest).subscribe({
      next: (order) => {
        console.log('Order placed successfully:', order);
        this.cartService.clearCart();
        alert('تم تأكيد طلبك بنجاح!');
        // Redirect to order confirmation or order history page
        // (this.router as any).navigate(['/orders', order._id]); // Assuming order has _id
      },
      error: (error) => {
        console.error('Error placing order:', error);
        this.errorMessage = error.error.msg || 'فشل إتمام الطلب. الرجاء المحاولة مرة أخرى.';
      }
    });
  }
}

