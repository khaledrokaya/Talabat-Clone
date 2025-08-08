import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

let isRefreshing = false;
let refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

export const AuthInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if user is authenticated and add token
  const currentUser = authService.currentUserValue;
  const token = authService.getToken();

  if (currentUser && token) {
    // For all users (including admin), add JWT token
    req = addTokenHeader(req, token);
  }

  return next(req).pipe(
    catchError((error: any) => {
      if (error.status === 401) {
        if (currentUser && currentUser.role === 'admin') {
          return handleAdminUnauthorized(authService, router);
        } else {
          return handle401Error(req, next, authService, router);
        }
      }
      return throwError(() => error);
    })
  );
};

function addTokenHeader(request: HttpRequest<any>, token: string): HttpRequest<any> {
  return request.clone({
    headers: request.headers.set('Authorization', `Bearer ${token}`)
  });
}

function handleAdminUnauthorized(authService: AuthService, router: Router): Observable<never> {
  // For admin users, immediately logout and redirect to admin login
  authService.logout().subscribe();
  router.navigate(['/auth/admin-login']);
  return throwError(() => new Error('Admin session expired'));
}

function handle401Error(request: HttpRequest<any>, next: HttpHandlerFn, authService: AuthService, router: Router): Observable<HttpEvent<any>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    const refreshToken = authService.getRefreshToken();

    if (refreshToken) {
      return authService.refreshToken().pipe(
        switchMap((response: any) => {
          isRefreshing = false;
          if (response.success && response.data) {
            refreshTokenSubject.next(response.data.tokens.accessToken);
            return next(addTokenHeader(request, response.data.tokens.accessToken));
          }
          return throwError(() => new Error('Token refresh failed'));
        }),
        catchError((err) => {
          isRefreshing = false;
          authService.logout().subscribe();
          router.navigate(['/auth/login']);
          return throwError(() => err);
        })
      );
    } else {
      isRefreshing = false;
      authService.logout().subscribe();
      router.navigate(['/auth/login']);
      return throwError(() => new Error('No refresh token available'));
    }
  }

  return refreshTokenSubject.pipe(
    filter(token => token !== null),
    take(1),
    switchMap((token) => next(addTokenHeader(request, token)))
  );
}

