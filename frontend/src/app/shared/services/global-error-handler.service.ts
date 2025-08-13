import { Injectable, ErrorHandler } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class GlobalErrorHandlerService implements ErrorHandler {

  constructor(private toastService: ToastService) {}

  handleError(error: any): void {
    if (error instanceof HttpErrorResponse) {
      this.handleHttpError(error);
    } else {
      this.handleClientError(error);
    }
  }

  private handleHttpError(error: HttpErrorResponse): void {
    let message: string;
    
    switch (error.status) {
      case 0:
        message = 'Network error. Please check your internet connection.';
        break;
      case 400:
        message = error.error?.message || 'Bad request. Please check your input.';
        break;
      case 401:
        message = 'Authentication failed. Please log in again.';
        break;
      case 403:
        message = 'Access denied. You don\'t have permission to perform this action.';
        break;
      case 404:
        message = 'The requested resource was not found.';
        break;
      case 409:
        message = error.error?.message || 'Conflict. The resource already exists.';
        break;
      case 422:
        message = this.formatValidationErrors(error.error);
        break;
      case 429:
        message = 'Too many requests. Please wait a moment before trying again.';
        break;
      case 500:
        message = 'Internal server error. Please try again later.';
        break;
      case 502:
        message = 'Server is temporarily unavailable. Please try again later.';
        break;
      case 503:
        message = 'Service unavailable. Please try again later.';
        break;
      default:
        message = error.error?.message || `Unexpected error occurred (${error.status})`;
    }

    this.toastService.error(message);
  }

  private handleClientError(error: Error): void {
    const message = error.message || 'An unexpected error occurred';
    this.toastService.error(message);
  }

  private formatValidationErrors(errorResponse: any): string {
    if (errorResponse?.errors) {
      const errors = Object.values(errorResponse.errors).flat() as string[];
      return errors.join(', ');
    } else if (errorResponse?.message) {
      return errorResponse.message;
    }
    return 'Validation failed. Please check your input.';
  }

  // Method to handle specific API errors manually
  handleApiError(error: HttpErrorResponse, customMessage?: string): void {
    if (customMessage) {
      this.toastService.error(customMessage);
    } else {
      this.handleHttpError(error);
    }
  }
}