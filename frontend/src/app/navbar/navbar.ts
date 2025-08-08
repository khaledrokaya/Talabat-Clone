import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, User } from '../shared/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar implements OnInit, OnDestroy {
  currentUser: User | null = null;
  dropdownOpen = false;
  private userSubscription: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  closeDropdown(): void {
    this.dropdownOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const dropdown = document.querySelector('.has-dropdown');

    if (dropdown && !dropdown.contains(target)) {
      this.dropdownOpen = false;
    }
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        console.log('Logout successful');
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        // Even if logout fails on backend, redirect to login
        this.router.navigate(['/auth/login']);
      }
    });
  }

  navigateToProfile(): void {
    if (this.currentUser) {
      switch (this.currentUser.role) {
        case 'admin':
          this.router.navigate(['/admin']);
          break;
        case 'restaurant_owner':
          this.router.navigate(['/restaurant-dashboard']);
          break;
        case 'delivery':
          this.router.navigate(['/delivery-dashboard']);
          break;
        case 'customer':
        default:
          this.router.navigate(['/profile']);
          break;
      }
    }
  }
}
