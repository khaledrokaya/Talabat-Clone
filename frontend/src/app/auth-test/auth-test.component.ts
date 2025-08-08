import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-auth-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="auth-test-container">
      <h2>Authentication Test</h2>
      
      <div class="test-section">
        <h3>Current User State</h3>
        <pre>{{ currentUser | json }}</pre>
        <p>Is Logged In: {{ isLoggedIn }}</p>
        <p>Is Authenticated: {{ isAuthenticated }}</p>
      </div>

      <div class="test-section">
        <h3>Actions</h3>
        <button (click)="debugAuth()">Debug Auth State</button>
        <button (click)="checkAuth()">Check Auth</button>
        <button (click)="clearAuth()">Clear Auth Data</button>
      </div>

      <div class="test-section">
        <h3>Test Registration</h3>
        <button (click)="testCustomerRegistration()">Test Customer Registration</button>
        <button (click)="testLogin()">Test Login</button>
        <button (click)="testLogout()">Test Logout</button>
      </div>

      <div class="test-section" *ngIf="testResult">
        <h3>Test Result</h3>
        <pre>{{ testResult | json }}</pre>
      </div>
    </div>
  `,
  styles: [`
    .auth-test-container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }
    .test-section {
      margin: 20px 0;
      padding: 15px;
      border: 1px solid #ddd;
      border-radius: 5px;
    }
    button {
      margin: 5px;
      padding: 8px 16px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    button:hover {
      background-color: #0056b3;
    }
    pre {
      background-color: #f8f9fa;
      padding: 10px;
      border-radius: 4px;
      overflow-x: auto;
    }
  `]
})
export class AuthTestComponent {
  currentUser: any = null;
  isLoggedIn = false;
  isAuthenticated = false;
  testResult: any = null;

  constructor(private authService: AuthService) {
    this.updateState();

    // Subscribe to user changes
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.updateState();
    });
  }

  updateState() {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.isAuthenticated = this.authService.isAuthenticated();
  }

  debugAuth() {
    this.authService.debugAuthState();
    this.updateState();
  }

  checkAuth() {
    this.authService.checkAuthState().subscribe(user => {
      console.log('Check auth result:', user);
      this.testResult = { checkAuth: user };
      this.updateState();
    });
  }

  clearAuth() {
    this.authService.clearAllAuthData();
    this.updateState();
  }

  testCustomerRegistration() {
    const testData = {
      email: 'test.customer@example.com',
      password: 'SecurePass123',
      firstName: 'Test',
      lastName: 'Customer',
      phone: '+1234567890',
      address: {
        street: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345'
      }
    };

    this.authService.registerCustomer(testData).subscribe({
      next: (response) => {
        console.log('Registration success:', response);
        this.testResult = { registration: response };
      },
      error: (error) => {
        console.error('Registration error:', error);
        this.testResult = { registrationError: error };
      }
    });
  }

  testLogin() {
    const loginData = {
      email: 'test.customer@example.com',
      password: 'SecurePass123'
    };

    this.authService.login(loginData).subscribe({
      next: (response) => {
        console.log('Login success:', response);
        this.testResult = { login: response };
        this.updateState();
      },
      error: (error) => {
        console.error('Login error:', error);
        this.testResult = { loginError: error };
      }
    });
  }

  testLogout() {
    this.authService.logout().subscribe({
      next: (response) => {
        console.log('Logout success:', response);
        this.testResult = { logout: response };
        this.updateState();
      },
      error: (error) => {
        console.error('Logout error:', error);
        this.testResult = { logoutError: error };
      }
    });
  }
}
