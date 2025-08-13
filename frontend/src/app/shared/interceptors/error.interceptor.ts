import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';
import { Router } from '@angular/router';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      handleHttpError(error, toastService, router, req);
      return throwError(() => error);
    })
  );
};

function handleHttpError(error: HttpErrorResponse, toastService: ToastService, router: Router, req: any): void {
  // Check if request should be silent (no toast notifications)
  if (req.headers.get('X-Silent-Request')) {
    return;
  }

  // Handle specific status codes
  switch (error.status) {
    case 0:
      toastService.showNetworkError();
      return;
    case 401:
      toastService.showUnauthorizedError();
      // Optionally redirect to login
      setTimeout(() => {
        router.navigate(['/auth/login']);
      }, 2000);
      return;
    case 422:
      toastService.showApiValidationError(error);
      return;
    case 400:
    case 403:
    case 404:
    case 409:
    case 429:
    case 500:
    case 502:
    case 503:
      toastService.showApiError(error, getDefaultErrorMessage(error.status));
      return;
    default:
      // For unknown errors, try to show API message or generic error
      if (error.error?.message) {
        toastService.showApiError(error, 'An unexpected error occurred');
      }
      return;
  }
}

function getDefaultErrorMessage(status: number): string {
  switch (status) {
    case 400:
      return 'Invalid request. Please check your input.';
    case 403:
      return 'Access denied. You don\'t have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return 'Conflict. The resource already exists.';
    case 429:
      return 'Too many requests. Please wait a moment before trying again.';
    case 500:
      return 'Internal server error. Please try again later.';
    case 502:
      return 'Server is temporarily unavailable. Please try again later.';
    case 503:
      return 'Service unavailable. Please try again later.';
    default:
      return 'An unexpected error occurred.';
  }
}