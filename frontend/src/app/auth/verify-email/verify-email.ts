import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
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
  errorMessage = '';
  successMessage = '';
  isLoading = false;
  isResending = false;
  canResend = true;
  countdown = 0;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
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
        this.successMessage = 'Verification code has been sent to your email';
        this.startCountdown(); // Start countdown since OTP was just sent

        // Clear the message after a few seconds
        setTimeout(() => {
          this.successMessage = '';
        }, 5000);
      }
    });
  }

  onVerifyOTP(): void {
    if (!this.otp || this.otp.length !== 6) {
      this.errorMessage = 'Please enter a 6-digit verification code';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.verifyOTP(this.email, this.otp, this.type).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.successMessage = 'Email verified successfully!';

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
          this.errorMessage = response.message || 'Failed to verify code';
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('OTP verification failed', error);

        if (error.error && !error.error.success) {
          this.errorMessage = error.error.message || 'Failed to verify code';
        } else {
          this.errorMessage = 'An unexpected error occurred. Please try again.';
        }
      }
    });
  }

  onResendOTP(): void {
    if (!this.canResend) {
      return;
    }

    this.isResending = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.resendOTP(this.email, this.type).subscribe({
      next: (response) => {
        this.isResending = false;
        if (response.success) {
          this.successMessage = 'New verification code sent to your email';
          this.startCountdown();
        } else {
          this.errorMessage = response.message || 'Failed to send verification code';
        }
      },
      error: (error) => {
        this.isResending = false;
        console.error('Resend OTP failed', error);

        if (error.error && !error.error.success) {
          this.errorMessage = error.error.message || 'Failed to send verification code';
        } else {
          this.errorMessage = 'An unexpected error occurred. Please try again.';
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
