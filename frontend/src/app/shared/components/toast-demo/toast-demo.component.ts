import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast-demo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-demo-container">
      <h3>Toast Notification Demo</h3>
      <div class="demo-buttons">
        <button class="btn btn-success" (click)="showSuccess()">Success Toast</button>
        <button class="btn btn-danger" (click)="showError()">Error Toast</button>
        <button class="btn btn-warning" (click)="showWarning()">Warning Toast</button>
        <button class="btn btn-info" (click)="showInfo()">Info Toast</button>
        <button class="btn btn-primary" (click)="showLoginSuccess()">Login Success</button>
        <button class="btn btn-success" (click)="showOrderSuccess()">Order Success</button>
        <button class="btn btn-warning" (click)="showValidationError()">Validation Error</button>
        <button class="btn btn-secondary" (click)="clearAll()">Clear All</button>
      </div>
    </div>
  `,
  styles: [`
    .toast-demo-container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .demo-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 20px;
    }
    
    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.3s ease;
    }
    
    .btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    
    .btn-success { background-color: #28a745; color: white; }
    .btn-danger { background-color: #dc3545; color: white; }
    .btn-warning { background-color: #ffc107; color: #212529; }
    .btn-info { background-color: #17a2b8; color: white; }
    .btn-primary { background-color: #007bff; color: white; }
    .btn-secondary { background-color: #6c757d; color: white; }
  `]
})
export class ToastDemoComponent {

  constructor(private toastService: ToastService) { }

  showSuccess(): void {
    this.toastService.success('This is a success message!', 'Well Done!');
  }

  showError(): void {
    this.toastService.error('Something went wrong!', 'Oops!');
  }

  showWarning(): void {
    this.toastService.warning('Please check your input!', 'Warning');
  }

  showInfo(): void {
    this.toastService.info('Here is some useful information.', 'FYI');
  }

  showLoginSuccess(): void {
    this.toastService.showLoginSuccess('Ahmed Mohamed');
  }

  showOrderSuccess(): void {
    this.toastService.showOrderSuccess('TLB-2024-001234');
  }

  showValidationError(): void {
    this.toastService.showValidationError('Please fill in all required fields correctly');
  }

  clearAll(): void {
    this.toastService.clear();
  }
}
