import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService, Cart as CartModel, CartItem } from '../../shared/services/cart.service';
import { ToastService } from '../../shared/services/toast.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.html',
  styleUrl: './cart.scss'
})
export class Cart implements OnInit {
  cart$: Observable<CartModel>;

  constructor(
    private cartService: CartService,
    private toastService: ToastService
  ) {
    this.cart$ = this.cartService.cart$;
  }

  ngOnInit(): void { }

  updateQuantity(itemId: string, quantity: number): void {
    this.cartService.updateQuantity(itemId, quantity);
    this.toastService.info('Item quantity updated', 'Cart Updated');
  }

  removeItem(itemId: string): void {
    this.cartService.removeFromCart(itemId);
    this.toastService.showDeleteSuccess('Item');
  }

  clearCart(): void {
    if (confirm('Are you sure you want to clear your cart?')) {
      this.cartService.clearCart();
      this.toastService.success('All items removed from cart', 'Cart Cleared');
    }
  }
}

