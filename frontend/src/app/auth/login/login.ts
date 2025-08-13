import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import { FormValidationService } from '../../shared/services/form-validation.service';
import { FormErrorComponent } from '../../shared/components/form-error/form-error.component';
import { TalabatLogo } from '../../shared/components/talabat-logo/talabat-logo';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TalabatLogo, FormErrorComponent],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  loginForm: FormGroup;
  errorMessage = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService,
    private fb: FormBuilder,
    private formValidationService: FormValidationService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [
        Validators.required,
        FormValidationService.emailValidator()
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6)
      ]]
    });
  }

  onLogin(): void {
    if (this.loginForm.invalid) {
      this.formValidationService.markFormGroupTouched(this.loginForm);
      this.errorMessage = 'Please correct the errors below';
      this.toastService.showValidationError('Please fill in all required fields correctly');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;
    this.authService.login({ email, password }).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success && response.data && response.data.user) {
          const userName = response.data.user.firstName || response.data.user.email;
          this.toastService.showLoginSuccess(userName);

          // Redirect based on user role
          const userRole = response.data.user.role;
          switch (userRole) {
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
              this.router.navigate(['/home']);
              break;
          }
        } else {
          this.errorMessage = response.message || 'Login failed. Please try again.';
          this.toastService.error(this.errorMessage);
        }
      },
      error: (error) => {
        this.isLoading = false;

        if (error.error && !error.error.success) {
          this.errorMessage = error.error.message || 'Login failed. Please try again.';

          // Check if it's an email verification error
          if (error.error.data && error.error.data.errorCode === 'EMAIL_NOT_VERIFIED') {
            const email = error.error.data.email;

            // Show success message about OTP being sent
            this.toastService.info('A verification code has been sent to your email. Please check your inbox and verify your email to login.', 'Email Verification Required', 8000);

            // Navigate to verify-email page with email parameter and indicate OTP was sent
            this.router.navigate(['/auth/verify-email'], {
              queryParams: {
                email: email,
                type: 'registration',
                otpSent: 'true'
              }
            });
            return;
          }
        } else {
          this.errorMessage = 'An unexpected error occurred. Please try again.';
        }

        this.toastService.error(this.errorMessage);
      }
    });
  }
}