import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { TalabatLogo } from '../../shared/components/talabat-logo/talabat-logo';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TalabatLogo],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss'
})
export class ForgotPassword implements OnInit {
  step: 'email' | 'otp' | 'reset' = 'email';
  email = '';
  otp = '';
  newPassword = '';
  confirmPassword = '';

  isLoading = false;
  message = '';
  errorMessage = '';

  // OTP timer
  otpTimer = 0;
  canResendOTP = true;

  // Password requirements
  passwordRequirements = {
    length: false,
    uppercase: false,
    lowercase: false,
    number: false
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void { }

  // Step 1: Send OTP to email
  onSendOTP(): void {
    if (!this.isValidEmail(this.email)) {
      this.errorMessage = 'Please enter a valid email address';
      return;
    }

    this.isLoading = true;
    this.clearMessages();

    this.authService.forgotPassword(this.email).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.message = 'Password reset code has been sent to your email';
        this.step = 'otp';
        this.startOTPTimer();
      },
      error: (error) => {
        this.isLoading = false;

        if (error.status === 404) {
          this.errorMessage = 'No account found with this email address';
        } else if (error.status === 500) {
          this.errorMessage = 'Unable to send email at the moment. Please try again later.';
        } else {
          this.errorMessage = 'An error occurred. Please try again.';
        }
      }
    });
  }

  // Step 2: Verify OTP (just validate format, actual verification happens during reset)
  onVerifyOTP(): void {
    if (!this.otp || this.otp.length !== 6) {
      this.errorMessage = 'Please enter a valid 6-digit code';
      return;
    }

    // For password reset, we skip server-side OTP verification here
    // The OTP will be verified when resetting the password
    this.clearMessages();
    this.message = 'Enter your new password below';
    this.step = 'reset';
  }

  // Step 3: Reset password
  onResetPassword(): void {
    if (!this.isPasswordValid()) {
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.isLoading = true;
    this.clearMessages();

    this.authService.resetPassword(this.email, this.otp, this.newPassword).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.message = 'Password reset successfully! You can now log in with your new password.';

        // Redirect to login after 3 seconds
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 3000);
      },
      error: (error) => {
        this.isLoading = false;

        if (error.status === 400) {
          // Check if it's an OTP-related error
          if (error.error && error.error.message && error.error.message.includes('OTP')) {
            this.errorMessage = 'Invalid or expired verification code. Please go back and request a new code.';
          } else {
            this.errorMessage = 'Invalid request. Please check your input and try again.';
          }
        } else if (error.status === 404) {
          this.errorMessage = 'User not found. Please start the process again.';
        } else {
          this.errorMessage = 'An error occurred. Please try again.';
        }
      }
    });
  }

  // Resend OTP
  onResendOTP(): void {
    if (!this.canResendOTP) {
      return;
    }

    this.isLoading = true;
    this.clearMessages();

    this.authService.resendOTP(this.email, 'password-reset').subscribe({
      next: (response) => {
        this.isLoading = false;
        this.message = 'New code has been sent to your email';
        this.startOTPTimer();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to resend code. Please try again.';
      }
    });
  }

  // Start OTP resend timer
  private startOTPTimer(): void {
    this.canResendOTP = false;
    this.otpTimer = 60;

    const interval = setInterval(() => {
      this.otpTimer--;
      if (this.otpTimer <= 0) {
        this.canResendOTP = true;
        clearInterval(interval);
      }
    }, 1000);
  }

  // Go back to previous step
  goBack(): void {
    if (this.step === 'otp') {
      this.step = 'email';
      this.clearMessages();
    } else if (this.step === 'reset') {
      this.step = 'otp';
      this.clearMessages();
    }
  }

  // Password validation
  onPasswordChange(): void {
    this.checkPasswordRequirements(this.newPassword);
  }

  private checkPasswordRequirements(password: string): void {
    this.passwordRequirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password)
    };
  }

  private isPasswordValid(): boolean {
    return Object.values(this.passwordRequirements).every(req => req);
  }

  // Make method public for template access
  public get isPasswordValidPublic(): boolean {
    return this.isPasswordValid();
  }

  // Utility methods
  private isValidEmail(email: string): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  private clearMessages(): void {
    this.message = '';
    this.errorMessage = '';
  }
}
