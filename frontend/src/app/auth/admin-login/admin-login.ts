import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService, LoginRequest } from '../../shared/services/auth.service';
import { TalabatLogo } from '../../shared/components/talabat-logo/talabat-logo';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TalabatLogo],
  templateUrl: './admin-login.html',
  styleUrls: ['./admin-login.scss']
})
export class AdminLogin implements OnInit {
  adminLoginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.adminLoginForm = this.createForm();
  }

  ngOnInit() {
    // Check if admin is already logged in
    if (this.authService.isLoggedIn() && this.authService.hasRole('admin')) {
      this.router.navigate(['/admin/dashboard']);
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.adminLoginForm.invalid || this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const formData = this.adminLoginForm.value;
    const credentials: LoginRequest = {
      email: formData.email,
      password: formData.password
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.isLoading = false;

        if (response.success && response.data?.user) {
          // Check if the logged-in user is an admin
          if (response.data.user.role === 'admin') {
            console.log('Admin logged in successfully');
            // Force reload the auth state to ensure UI updates
            setTimeout(() => {
              this.authService.forceReloadUserState();
            }, 100);
            this.router.navigate(['/admin/dashboard']);
          } else {
            this.handleLoginError('Access denied. Admin privileges required.');
            // Clear the login since this user is not an admin
            this.authService.logout();
          }
        } else {
          this.handleLoginError(response.message || 'Login failed');
        }
      },
      error: (error) => {
        this.isLoading = false;

        if (error.status === 401) {
          this.handleLoginError('Invalid email or password');
        } else if (error.status === 403) {
          this.handleLoginError('Access denied. Admin privileges required.');
        } else {
          this.handleLoginError('Connection error. Please try again');
        }
      }
    });
  }

  private handleLoginError(message: string): void {
    this.errorMessage = message;
    // Clear password for security
    this.adminLoginForm.get('password')?.setValue('');
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
