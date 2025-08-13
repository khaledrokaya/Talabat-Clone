import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { FormValidationService } from '../../services/form-validation.service';

@Component({
  selector: 'app-form-error',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      *ngIf="showError" 
      class="form-error-message"
      [@slideIn]
    >
      <i class="bi bi-exclamation-circle"></i>
      <span>{{ errorMessage }}</span>
    </div>
  `,
  styles: [`
    .form-error-message {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #dc3545;
      font-size: 12px;
      margin-top: 4px;
      padding: 6px 12px;
      background-color: rgba(220, 53, 69, 0.1);
      border: 1px solid rgba(220, 53, 69, 0.2);
      border-radius: 4px;
      animation: slideIn 0.2s ease-out;
    }

    .form-error-message i {
      font-size: 14px;
      flex-shrink: 0;
    }

    .form-error-message span {
      line-height: 1.4;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class FormErrorComponent {
  @Input() form!: FormGroup;
  @Input() fieldName!: string;

  constructor(private formValidationService: FormValidationService) {}

  get showError(): boolean {
    return this.formValidationService.isFieldInvalid(this.form, this.fieldName);
  }

  get errorMessage(): string {
    return this.formValidationService.getFieldError(this.form, this.fieldName);
  }
}