import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CartService } from '../services/cart.service';
import { User } from '../models/user';
import { Subscription } from 'rxjs';
import { TalabatLogo } from '../components/talabat-logo/talabat-logo';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, TalabatLogo],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss']
})
export class Navbar implements OnInit, OnDestroy {
  currentUser: User | null = null;
  showUserMenu = false;
  showMobileMenu = false;
  private subscriptions: Subscription[] = [];

  constructor(
    public authService: AuthService,
    public cartService: CartService,
    private router: Router
  ) { }

  ngOnInit() {
    // Subscribe to auth state changes
    const authSub = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    this.subscriptions.push(authSub);

    // Initialize auth state properly
    if (this.authService.isAuthenticated()) {
      this.initializeAuthState();
    }
  }

  private initializeAuthState() {
    // Check if we already have user data
    if (this.authService.currentUserValue) {
      this.currentUser = this.authService.currentUserValue;
    } else {
      // We have valid token but no user data, sync from backend
      const syncSub = this.authService.checkAuthState().subscribe({
        next: (user) => {
          this.currentUser = user;
          if (user) {
          }
        },
        error: (error) => {
        }
      });
      this.subscriptions.push(syncSub);
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-dropdown')) {
      this.showUserMenu = false;
    }
    if (!target.closest('.mobile-nav') && !target.closest('.mobile-menu-toggle')) {
      this.showMobileMenu = false;
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (event.target.innerWidth > 768) {
      this.showMobileMenu = false;
    }
  }

  private loadCurrentUser() {
    // Only load if we don't already have user data
    if (!this.authService.currentUserValue) {
      const userSub = this.authService.getCurrentUser().subscribe({
        next: (user) => {
          this.currentUser = user;
        },
        error: (error) => {
        }
      });
      this.subscriptions.push(userSub);
    }
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  closeUserMenu() {
    this.showUserMenu = false;
  }

  toggleMobileMenu() {
    this.showMobileMenu = !this.showMobileMenu;
  }

  closeMobileMenu() {
    this.showMobileMenu = false;
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.currentUser = null;
        this.showUserMenu = false;
        this.showMobileMenu = false;
        this.router.navigate(['/']);
      },
      error: (error) => {
        // Force logout even if server request fails - just navigate since logout clears data anyway
        this.currentUser = null;
        this.showUserMenu = false;
        this.showMobileMenu = false;
        this.router.navigate(['/']);
      }
    });
  }

  getCartItemsCount(): number {
    return this.cartService.getItemCount();
  }
}

