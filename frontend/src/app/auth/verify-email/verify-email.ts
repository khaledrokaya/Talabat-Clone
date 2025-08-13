import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import { TalabatLogo } from '../../shared/components/talabat-logo/talabat-logo';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TalabatLogo],
  templateUrl: './verify-email.html',
  styleUrl: './verify-email.scss'
})
export class VerifyEmail implements OnInit {
  email = '';
  otp = '';
  type: 'registration' | 'password-reset' = 'registration';
  isLoading = false;
  isResending = false;
  canResend = true;
  countdown = 0;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    // Get email and type from query parameters
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      this.type = params['type'] || 'registration';
      const otpSent = params['otpSent'] === 'true';

      if (!this.email) {
        // If no email is provided, redirect to login
        this.router.navigate(['/auth/login']);
        return;
      }

      // Show initial success message if OTP was just sent (e.g., from failed login)
      if (otpSent) {
        this.toastService.success('Verification code has been sent to your email', 'Code Sent');
        this.startCountdown(); // Start countdown since OTP was just sent
      }
    });
  }

  onVerifyOTP(): void {
    if (!this.otp || this.otp.length !== 6) {
      this.toastService.warning('Please enter a 6-digit verification code', 'Invalid Code');
      return;
    }

    this.isLoading = true;

    this.authService.verifyOTP(this.email, this.otp, this.type).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.toastService.success('Email verified successfully!', 'Verification Complete');

          setTimeout(() => {
            // Redirect based on verification type
            if (this.type === 'registration') {
              this.router.navigate(['/auth/login']);
            } else {
              // For password reset, redirect to reset password page
              this.router.navigate(['/auth/reset-password'], {
                queryParams: { email: this.email, otp: this.otp }
              });
            }
          }, 2000);
        } else {
          this.toastService.error(response.message || 'Failed to verify code', 'Verification Failed');
        }
      },
      error: (error) => {
        this.isLoading = false;

        if (error.error && !error.error.success) {
          this.toastService.showApiError(error, 'Failed to verify code');
        } else {
          this.toastService.error('An unexpected error occurred. Please try again.', 'Verification Error');
        }
      }
    });
  }

  onResendOTP(): void {
    if (!this.canResend) {
      return;
    }

    this.isResending = true;

    this.authService.resendOTP(this.email, this.type).subscribe({
      next: (response) => {
        this.isResending = false;
        if (response.success) {
          this.toastService.success('New verification code sent to your email', 'Code Resent');
          this.startCountdown();
        } else {
          this.toastService.error(response.message || 'Failed to send verification code', 'Resend Failed');
        }
      },
      error: (error) => {
        this.isResending = false;

        if (error.error && !error.error.success) {
          this.toastService.showApiError(error, 'Failed to send verification code');
        } else {
          this.toastService.error('An unexpected error occurred. Please try again.', 'Resend Error');
        }
      }
    });
  }

  private startCountdown(): void {
    this.canResend = false;
    this.countdown = 60; // 60 seconds countdown

    const interval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        this.canResend = true;
        clearInterval(interval);
      }
    }, 1000);
  }

  goBack(): void {
    if (this.type === 'registration') {
      this.router.navigate(['/auth/login']);
    } else {
      this.router.navigate(['/auth/forgot-password']);
    }
  }
}
