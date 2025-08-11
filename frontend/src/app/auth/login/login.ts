import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { TalabatLogo } from '../../shared/components/talabat-logo/talabat-logo';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TalabatLogo],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  email = '';
  password = '';
  errorMessage = '';
  isLoading = false;

  constructor(private authService: AuthService, private router: Router) { }

  onLogin(): void {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success && response.data && response.data.user) {
          console.log('Login successful', response);

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
          alert(this.errorMessage);
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Login failed', error);

        if (error.error && !error.error.success) {
          this.errorMessage = error.error.message || 'Login failed. Please try again.';

          // Check if it's an email verification error
          if (error.error.data && error.error.data.errorCode === 'EMAIL_NOT_VERIFIED') {
            const email = error.error.data.email;
            console.log('Email not verified, redirecting to verification page for:', email);

            // Show success message about OTP being sent
            alert('A verification code has been sent to your email. Please check your inbox and verify your email to login.');

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

        // Show alert for better user experience
        alert(this.errorMessage);
      }
    });
  }
}
