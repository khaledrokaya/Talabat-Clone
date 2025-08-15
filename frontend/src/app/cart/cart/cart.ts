import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService, Cart as CartModel, CartItem } from '../../shared/services/cart.service';
import { AuthService } from '../../shared/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.html',
  styleUrl: './cart.scss'
})
export class Cart implements OnInit, OnDestroy {
  cart$: Observable<CartModel>;
  isLoggedIn = false;
  isLoading = false;
  private subscriptions: Subscription[] = [];

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private toastService: ToastService
  ) {
    this.cart$ = this.cartService.cart$;
  }

  ngOnInit(): void {
    // Check if user is logged in
    this.isLoggedIn = this.authService.isLoggedIn();

    // Subscribe to auth state changes
    this.subscriptions.push(
      this.authService.currentUser$.subscribe(user => {
        const wasLoggedOut = !this.isLoggedIn;
        this.isLoggedIn = !!user;

        if (user && wasLoggedOut) {
          // User just logged in - ensure cart is loaded
          this.refreshCart();
        }
      })
    );

    // Validate cart items if user is logged in
    if (this.isLoggedIn) {
      this.validateCartItems();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  updateQuantity(itemId: string, quantity: number): void {
    if (!this.isLoggedIn) {
      this.toastService.warning('Please log in to modify cart items', 'Login Required');
      return;
    }

    this.isLoading = true;
    this.subscriptions.push(
      this.cartService.updateQuantity(itemId, quantity).subscribe({
        next: (success) => {
          this.isLoading = false;
          if (success) {
            this.toastService.info('Item quantity updated', 'Cart Updated');
          } else {
            this.toastService.error('Failed to update item quantity', 'Update Failed');
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.toastService.error('Failed to update item quantity', 'Update Failed');
        }
      })
    );
  }

  removeItem(itemId: string): void {
    if (!this.isLoggedIn) {
      this.toastService.warning('Please log in to modify cart items', 'Login Required');
      return;
    }

    this.isLoading = true;
    this.subscriptions.push(
      this.cartService.removeFromCart(itemId).subscribe({
        next: (success) => {
          this.isLoading = false;
          if (success) {
            this.toastService.showDeleteSuccess('Item');
          } else {
            this.toastService.error('Failed to remove item from cart', 'Remove Failed');
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.toastService.error('Failed to remove item from cart', 'Remove Failed');
        }
      })
    );
  }

  clearCart(): void {
    if (!this.isLoggedIn) {
      this.toastService.warning('Please log in to clear cart', 'Login Required');
      return;
    }

    if (confirm('Are you sure you want to clear your cart?')) {
      this.isLoading = true;
      this.subscriptions.push(
        this.cartService.clearCart().subscribe({
          next: (success) => {
            this.isLoading = false;
            if (success) {
              this.toastService.success('All items removed from cart', 'Cart Cleared');
            } else {
              this.toastService.error('Failed to clear cart', 'Clear Failed');
            }
          },
          error: (error) => {
            this.isLoading = false;
            this.toastService.error('Failed to clear cart', 'Clear Failed');
          }
        })
      );
    }
  }

  refreshCart(): void {
    if (!this.isLoggedIn) {
      this.toastService.warning('Please log in to refresh cart', 'Login Required');
      return;
    }

    this.isLoading = true;
    this.subscriptions.push(
      this.cartService.refreshCart().subscribe({
        next: (cart) => {
          this.isLoading = false;
          this.toastService.info('Cart refreshed', 'Updated');
        },
        error: (error) => {
          this.isLoading = false;
          this.toastService.error('Failed to refresh cart', 'Refresh Failed');
        }
      })
    );
  }

  private validateCartItems(): void {
    this.subscriptions.push(
      this.cartService.validateCart().subscribe({
        next: (validation) => {
          if (!validation.isValid && validation.invalidItems.length > 0) {
            this.toastService.warning(
              `Some items are no longer available: ${validation.invalidItems.join(', ')}`,
              'Cart Items Updated'
            );
            // Sync cart to remove invalid items
            this.cartService.syncCart().subscribe();
          }
        },
        error: (error) => {
          console.error('Failed to validate cart', error);
        }
      })
    );
  }

  trackByItem(index: number, item: any): string {
    return item.mealId;
  }

  // Helper method to show login prompt
  promptLogin(): void {
    this.toastService.info('Please log in to manage your cart', 'Login Required');
  }
}

