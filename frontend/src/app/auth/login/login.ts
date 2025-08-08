import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
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
      this.errorMessage = 'يرجى ملء جميع الحقول';
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
        } else {
          this.errorMessage = 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.';
        }

        // Show alert for better user experience
        alert(this.errorMessage);
      }
    });
  }
}
