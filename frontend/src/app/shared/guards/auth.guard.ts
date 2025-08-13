import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if user has valid authentication
  if (authService.isAuthenticated()) {
    // If authenticated but no user data, trigger sync
    if (!authService.currentUserValue) {
      authService.checkAuthState().subscribe();
    }
    return true;
  } else {
    router.navigate(['/auth/login']);
    return false;
  }
};

export const roleGuard = (allowedRoles: string[]) => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Check authentication first
    if (!authService.isAuthenticated()) {
      router.navigate(['/auth/login']);
      return false;
    }

    // Get current user (may trigger sync if needed)
    const currentUser = authService.currentUserValue;

    if (!currentUser) {
      // Trigger user data sync and allow access (will redirect if sync fails)
      authService.checkAuthState().subscribe({
        next: (user) => {
          if (!user || !allowedRoles.includes(user.role)) {
            router.navigate(['/unauthorized']);
          }
        },
        error: () => {
          router.navigate(['/auth/login']);
        }
      });
      return true; // Allow access while syncing
    }

    if (allowedRoles.includes(currentUser.role)) {
      return true;
    } else {
      router.navigate(['/unauthorized']);
      return false;
    }
  };
};

export const customerGuard = roleGuard(['customer']);
export const restaurantGuard = roleGuard(['restaurant_owner']);
export const adminGuard = roleGuard(['admin']);
export const deliveryGuard = roleGuard(['delivery']);
