import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService, User } from '../../shared/services/auth.service';
import { ProfileService } from '../../shared/services/profile.service';
import { ToastService } from '../../shared/services/toast.service';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile implements OnInit {
  currentUser$: Observable<User | null>;
  showQuickActions = true;

  constructor(
    private authService: AuthService,
    private profileService: ProfileService,
    private router: Router,
    private toastService: ToastService
  ) {
    this.currentUser$ = this.authService.currentUser$;

    // Hide quick actions when navigating to child routes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(event => event as NavigationEnd)
    ).subscribe(event => {
      this.showQuickActions = event.url === '/profile' || event.url === '/profile/';
    });
  }

  ngOnInit(): void {
    // Load current user profile
    this.profileService.getProfile().subscribe({
      next: (profile) => {
        // Profile loaded successfully
      },
      error: (error) => {
        this.toastService.error('Failed to load profile information', 'Profile Error');
      }
    });
  }

  getRoleText(role: string): string {
    const roleMap: { [key: string]: string } = {
      'customer': 'Customer',
      'restaurant_owner': 'Restaurant Owner',
      'delivery': 'Delivery Driver',
      'admin': 'Administrator'
    };
    return roleMap[role] || role;
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/auth/login']);
    });
  }
}

