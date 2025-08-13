import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { FormValidationService } from '../../services/form-validation.service';
import { Subject, takeUntil, startWith } from 'rxjs';

@Component({
  selector: 'app-password-strength',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="password-strength-container" *ngIf="password">
      <div class="strength-bars">
        <div 
          class="strength-bar" 
          [ngClass]="getBarClass(1)"
        ></div>
        <div 
          class="strength-bar" 
          [ngClass]="getBarClass(2)"
        ></div>
        <div 
          class="strength-bar" 
          [ngClass]="getBarClass(3)"
        ></div>
        <div 
          class="strength-bar" 
          [ngClass]="getBarClass(4)"
        ></div>
      </div>
      
      <div class="strength-text">
        <span [ngClass]="'strength-' + strengthInfo.strength">
          {{ getStrengthText() }}
        </span>
      </div>

      <div class="password-requirements" *ngIf="showRequirements">
        <div class="requirement" [ngClass]="{ 'met': password.length >= 8 }">
          <i class="bi" [ngClass]="password.length >= 8 ? 'bi-check-circle-fill' : 'bi-circle'"></i>
          At least 8 characters
        </div>
        <div class="requirement" [ngClass]="{ 'met': hasUppercase }">
          <i class="bi" [ngClass]="hasUppercase ? 'bi-check-circle-fill' : 'bi-circle'"></i>
          One uppercase letter
        </div>
        <div class="requirement" [ngClass]="{ 'met': hasLowercase }">
          <i class="bi" [ngClass]="hasLowercase ? 'bi-check-circle-fill' : 'bi-circle'"></i>
          One lowercase letter
        </div>
        <div class="requirement" [ngClass]="{ 'met': hasNumber }">
          <i class="bi" [ngClass]="hasNumber ? 'bi-check-circle-fill' : 'bi-circle'"></i>
          One number
        </div>
        <div class="requirement" [ngClass]="{ 'met': hasSpecialChar }">
          <i class="bi" [ngClass]="hasSpecialChar ? 'bi-check-circle-fill' : 'bi-circle'"></i>
          One special character
        </div>
      </div>
    </div>
  `,
  styles: [`
    .password-strength-container {
      margin-top: 8px;
    }

    .strength-bars {
      display: flex;
      gap: 4px;
      margin-bottom: 6px;
    }

    .strength-bar {
      height: 4px;
      flex: 1;
      border-radius: 2px;
      background-color: #e9ecef;
      transition: background-color 0.3s ease;
    }

    .strength-bar.weak {
      background-color: #dc3545;
    }

    .strength-bar.medium {
      background-color: #ffc107;
    }

    .strength-bar.strong {
      background-color: #28a745;
    }

    .strength-text {
      font-size: 12px;
      margin-bottom: 8px;
    }

    .strength-none {
      color: #6c757d;
    }

    .strength-weak {
      color: #dc3545;
    }

    .strength-medium {
      color: #ffc107;
    }

    .strength-strong {
      color: #28a745;
    }

    .password-requirements {
      font-size: 11px;
      color: #6c757d;
    }

    .requirement {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 2px;
      transition: color 0.2s ease;
    }

    .requirement.met {
      color: #28a745;
    }

    .requirement i {
      font-size: 12px;
    }

    .requirement .bi-check-circle-fill {
      color: #28a745;
    }

    .requirement .bi-circle {
      color: #dee2e6;
    }
  `]
})
export class PasswordStrengthComponent implements OnInit, OnDestroy {
  @Input() form!: FormGroup;
  @Input() fieldName: string = 'password';
  @Input() showRequirements: boolean = true;

  private destroy$ = new Subject<void>();
  
  password: string = '';
  strengthInfo = { strength: 'none', score: 0 };

  constructor(private formValidationService: FormValidationService) {}

  ngOnInit(): void {
    if (this.form && this.fieldName) {
      const control = this.form.get(this.fieldName);
      if (control) {
        control.valueChanges
          .pipe(
            startWith(control.value || ''),
            takeUntil(this.destroy$)
          )
          .subscribe(value => {
            this.password = value || '';
            this.strengthInfo = this.formValidationService.getPasswordStrength(this.password);
          });
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get hasUppercase(): boolean {
    return /[A-Z]/.test(this.password);
  }

  get hasLowercase(): boolean {
    return /[a-z]/.test(this.password);
  }

  get hasNumber(): boolean {
    return /\d/.test(this.password);
  }

  get hasSpecialChar(): boolean {
    return /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(this.password);
  }

  getBarClass(barIndex: number): string {
    if (this.strengthInfo.score >= barIndex) {
      return this.strengthInfo.strength;
    }
    return '';
  }

  getStrengthText(): string {
    switch (this.strengthInfo.strength) {
      case 'none':
        return 'Enter password';
      case 'weak':
        return 'Weak password';
      case 'medium':
        return 'Medium password';
      case 'strong':
        return 'Strong password';
      default:
        return '';
    }
  }
}