import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      class="btn btn-logout" 
      (click)="logout()" 
      [disabled]="isLoggingOut"
      title="تسجيل الخروج">
      <i class="fas fa-sign-out-alt"></i>
      <span *ngIf="!isLoggingOut">تسجيل الخروج</span>
      <span *ngIf="isLoggingOut">جار الخروج...</span>
    </button>
  `,
  styles: [`
    .btn-logout {
      background: #dc3545;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.3s ease;
    }

    .btn-logout:hover:not(:disabled) {
      background: #c82333;
      transform: translateY(-1px);
    }

    .btn-logout:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .fa-sign-out-alt {
      font-size: 16px;
    }
  `]
})
export class LogoutComponent {
  isLoggingOut = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  logout(): void {
    if (this.isLoggingOut) return;

    this.isLoggingOut = true;

    this.authService.logout().subscribe({
      next: () => {
        this.isLoggingOut = false;
        this.router.navigate(['/home']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        this.isLoggingOut = false;
        // Even if logout fails on server, redirect to home
        this.router.navigate(['/home']);
      }
    });
  }
}
