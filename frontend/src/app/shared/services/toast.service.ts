import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(private toastr: ToastrService) { }

  success(message: string, title?: string, duration?: number): void {
    this.toastr.success(message, title || 'Success', {
      timeOut: duration || 5000,
      progressBar: true,
      closeButton: true,
      tapToDismiss: true
    });
  }

  error(message: string, title?: string, duration?: number): void {
    this.toastr.error(message, title || 'Error', {
      timeOut: duration || 6000,
      progressBar: true,
      closeButton: true,
      tapToDismiss: true,
      disableTimeOut: false
    });
  }

  warning(message: string, title?: string, duration?: number): void {
    this.toastr.warning(message, title || 'Warning', {
      timeOut: duration || 5000,
      progressBar: true,
      closeButton: true,
      tapToDismiss: true
    });
  }

  info(message: string, title?: string, duration?: number): void {
    this.toastr.info(message, title || 'Info', {
      timeOut: duration || 4000,
      progressBar: true,
      closeButton: true,
      tapToDismiss: true
    });
  }

  // Additional utility methods for common scenarios
  showValidationError(message: string): void {
    this.warning(message, 'Please Check Your Input', 6000);
  }

  showLoginSuccess(userName?: string): void {
    const message = userName
      ? `Welcome back, ${userName}!`
      : 'Welcome back!';
    this.toastr.success(message, 'Login Successful', {
      timeOut: 4000,
      progressBar: true,
      closeButton: true,
      tapToDismiss: true
    });
  }

  showOrderSuccess(orderNumber?: string): void {
    const message = orderNumber
      ? `Order #${orderNumber} has been placed successfully!`
      : 'Your order has been placed successfully!';
    this.toastr.success(message, 'Order Confirmed', {
      timeOut: 6000,
      progressBar: true,
      closeButton: true,
      tapToDismiss: true
    });
  }

  // Custom styled premium toast
  showPremiumMessage(message: string, title?: string): void {
    this.toastr.success(message, title || '✨ Premium Feature', {
      timeOut: 5000,
      progressBar: true,
      closeButton: true,
      tapToDismiss: true
    });
  }

  // Custom styled delivery toast
  showDeliveryUpdate(message: string, title?: string): void {
    this.toastr.info(message, title || '🚚 Delivery Update', {
      timeOut: 6000,
      progressBar: true,
      closeButton: true,
      tapToDismiss: true
    });
  }

  // Network error with custom styling
  showNetworkError(): void {
    this.toastr.error(
      'Please check your internet connection and try again',
      'Connection Error',
      {
        timeOut: 8000,
        progressBar: true,
        closeButton: true,
        tapToDismiss: true
      }
    );
  }

  showSaveSuccess(itemType: string = 'Item'): void {
    this.success(`${itemType} has been saved successfully!`, 'Saved', 3000);
  }

  showDeleteSuccess(itemType: string = 'Item'): void {
    this.success(`${itemType} has been deleted successfully!`, 'Deleted', 3000);
  }

  showUnauthorizedError(): void {
    this.error(
      'Your session has expired. Please log in again.',
      'Session Expired',
      7000
    );
  }

  // API Response handlers - show message from API response
  showApiSuccess(response: any, defaultMessage: string = 'Operation completed successfully'): void {
    const message = response?.message || defaultMessage;
    const title = response?.meta?.action ? `${response.meta.action} Successful` : 'Success';
    this.success(message, title);
  }

  showApiError(error: any, defaultMessage: string = 'An error occurred'): void {
    let message = defaultMessage;
    let title = 'Error';

    // Handle different error response structures
    if (error?.error?.message) {
      message = error.error.message;
    } else if (error?.message) {
      message = error.message;
    } else if (error?.error?.details) {
      message = error.error.details;
    }

    // Extract title from error if available
    if (error?.error?.error) {
      title = error.error.error;
    } else if (error?.statusText) {
      title = error.statusText;
    }

    this.error(message, title);
  }

  // Handle API validation errors specifically
  showApiValidationError(error: any): void {
    let message = 'Please check your input and try again';

    if (error?.error?.errors) {
      // Handle Laravel/backend validation errors
      const errors = error.error.errors;
      const errorMessages: string[] = [];

      Object.keys(errors).forEach(field => {
        if (Array.isArray(errors[field])) {
          errorMessages.push(...errors[field]);
        } else {
          errorMessages.push(errors[field]);
        }
      });

      message = errorMessages.join(', ');
    } else if (error?.error?.message) {
      message = error.error.message;
    } else if (error?.message) {
      message = error.message;
    }

    this.warning(message, 'Validation Error', 7000);
  }

  // Clear all toasts
  clear(): void {
    this.toastr.clear();
  }

  // Generic custom toast method
  showCustomToast(
    type: 'success' | 'error' | 'warning' | 'info',
    message: string,
    title?: string,
    options?: {
      duration?: number;
      customClass?: string;
      showIcon?: boolean;
      showProgressBar?: boolean;
      position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
    }
  ): void {
    const defaultOptions = {
      timeOut: options?.duration || 5000,
      progressBar: options?.showProgressBar !== false,
      closeButton: true,
      tapToDismiss: true,
      positionClass: `toast-${options?.position || 'top-right'}`,
      toastClass: `toast toast-${type} ${options?.showIcon !== false ? 'toast-with-icon' : ''} ${options?.customClass || ''}`
    };

    switch (type) {
      case 'success':
        this.toastr.success(message, title || 'Success', defaultOptions);
        break;
      case 'error':
        this.toastr.error(message, title || 'Error', defaultOptions);
        break;
      case 'warning':
        this.toastr.warning(message, title || 'Warning', defaultOptions);
        break;
      case 'info':
        this.toastr.info(message, title || 'Info', defaultOptions);
        break;
    }
  }

  // Themed toast methods
  showTalabatBrandedToast(message: string, title?: string): void {
    this.showCustomToast('info', message, title, {
      customClass: 'toast-talabat-branded',
      duration: 4000
    });
  }

  showOrderStatusToast(status: string, orderNumber?: string): void {
    const statusMessages = {
      'confirmed': `Order ${orderNumber ? `#${orderNumber}` : ''} has been confirmed!`,
      'preparing': `Your order ${orderNumber ? `#${orderNumber}` : ''} is being prepared`,
      'ready': `Order ${orderNumber ? `#${orderNumber}` : ''} is ready for pickup!`,
      'on_way': `Your order ${orderNumber ? `#${orderNumber}` : ''} is on the way!`,
      'delivered': `Order ${orderNumber ? `#${orderNumber}` : ''} has been delivered!`
    };

    const message = statusMessages[status as keyof typeof statusMessages] || `Order status updated: ${status}`;

    this.showCustomToast('info', message, '📦 Order Update', {
      customClass: 'toast-order-status',
      duration: 6000
    });
  }
}