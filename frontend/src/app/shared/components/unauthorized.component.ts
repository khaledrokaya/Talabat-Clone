import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="unauthorized-container">
      <div class="unauthorized-card">
        <i class="fas fa-ban"></i>
        <h2>Unauthorized Access</h2>
        <p>عذراً، ليس لديك صلاحية للوصول إلى هذه الصفحة.</p>
        <div class="actions">
          <a routerLink="/home" class="btn btn-primary">العودة للرئيسية</a>
          <a routerLink="/auth/login" class="btn btn-secondary">تسجيل الدخول</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .unauthorized-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .unauthorized-card {
      background: white;
      padding: 40px;
      border-radius: 10px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      text-align: center;
      max-width: 400px;
      width: 100%;
    }

    .fa-ban {
      font-size: 4rem;
      color: #dc3545;
      margin-bottom: 20px;
    }

    h2 {
      color: #333;
      margin-bottom: 15px;
      font-weight: 600;
    }

    p {
      color: #666;
      margin-bottom: 30px;
      line-height: 1.5;
    }

    .actions {
      display: flex;
      gap: 15px;
      justify-content: center;
    }

    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 5px;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    @media (max-width: 480px) {
      .actions {
        flex-direction: column;
      }
      
      .btn {
        width: 100%;
      }
    }
  `]
})
export class UnauthorizedComponent { }
