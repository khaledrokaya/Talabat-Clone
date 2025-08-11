import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileService } from '../../shared/services/profile.service';

@Component({
  selector: 'app-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './password.html',
  styleUrls: ['./password.scss']
})
export class Password implements OnInit {
  passwordForm!: FormGroup;
  isLoading = false;
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;
  successMessage = '';
  errorMessage = '';

  passwordStrength = {
    percentage: 0,
    text: '',
    class: ''
  };

  passwordRequirements = {
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  };

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        this.passwordValidator
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    // Monitor new password changes
    this.passwordForm.get('newPassword')?.valueChanges.subscribe(value => {
      this.checkPasswordStrength(value);
      this.checkPasswordRequirements(value);
    });
  }

  passwordValidator(control: AbstractControl): { [key: string]: any } | null {
    const value = control.value;
    if (!value) return null;

    const hasNumber = /[0-9]/.test(value);
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);

    const valid = hasNumber && hasUpper && hasLower;
    if (!valid) {
      return { pattern: true };
    }
    return null;
  }

  passwordMatchValidator(group: AbstractControl): { [key: string]: any } | null {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    if (newPassword !== confirmPassword) {
      group.get('confirmPassword')?.setErrors({ mismatch: true });
      return { mismatch: true };
    }

    return null;
  }

  checkPasswordStrength(password: string): void {
    if (!password) {
      this.passwordStrength = { percentage: 0, text: '', class: '' };
      return;
    }

    let score = 0;

    // طول كلمة المرور
    if (password.length >= 8) score += 25;
    if (password.length >= 12) score += 10;

    // وجود أحرف كبيرة
    if (/[A-Z]/.test(password)) score += 20;

    // وجود أحرف صغيرة
    if (/[a-z]/.test(password)) score += 20;

    // وجود أرقام
    if (/[0-9]/.test(password)) score += 15;

    // وجود رموز خاصة
    if (/[^A-Za-z0-9]/.test(password)) score += 10;

    if (score < 50) {
      this.passwordStrength = {
        percentage: score,
        text: 'ضعيفة',
        class: 'weak'
      };
    } else if (score < 80) {
      this.passwordStrength = {
        percentage: score,
        text: 'متوسطة',
        class: 'medium'
      };
    } else {
      this.passwordStrength = {
        percentage: score,
        text: 'قوية',
        class: 'strong'
      };
    }
  }

  checkPasswordRequirements(password: string): void {
    this.passwordRequirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
  }

  toggleCurrentPassword(): void {
    this.showCurrentPassword = !this.showCurrentPassword;
  }

  toggleNewPassword(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit(): void {
    if (this.passwordForm.valid) {
      this.isLoading = true;
      this.clearMessages();

      const passwordData = {
        currentPassword: this.passwordForm.value.currentPassword,
        newPassword: this.passwordForm.value.newPassword
      };

      this.profileService.changePassword(passwordData).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.successMessage = 'تم تغيير كلمة المرور بنجاح';
          this.passwordForm.reset();
          this.hideMessageAfterDelay();
        },
        error: (error: any) => {
          this.isLoading = false;
          console.error('خطأ في تغيير كلمة المرور:', error);

          // Handle different types of errors
          if (error.status === 404) {
            this.errorMessage = 'خدمة تغيير كلمة المرور غير متوفرة حالياً. يرجى المحاولة لاحقاً.';
          } else if (error.status === 400) {
            // Check if there's a specific error message from the server
            if (error.error && error.error.message) {
              this.errorMessage = error.error.message;
            } else {
              this.errorMessage = 'كلمة المرور الحالية غير صحيحة';
            }
          } else if (error.status === 401) {
            this.errorMessage = 'جلسة المستخدم منتهية. يرجى تسجيل الدخول مرة أخرى.';
          } else if (error.status === 422) {
            this.errorMessage = 'البيانات المدخلة غير صحيحة. يرجى التحقق من كلمة المرور الجديدة.';
          } else {
            this.errorMessage = 'حدث خطأ أثناء تغيير كلمة المرور. يرجى المحاولة مرة أخرى.';
          }
          this.hideMessageAfterDelay();
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.router.navigate(['/profile']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.passwordForm.controls).forEach(key => {
      const control = this.passwordForm.get(key);
      control?.markAsTouched();
    });
  }

  private clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  private hideMessageAfterDelay(): void {
    setTimeout(() => {
      this.clearMessages();
    }, 5000);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.passwordForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.passwordForm.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) return 'هذا الحقل مطلوب';
      if (field.errors['minlength']) return `يجب أن تكون كلمة المرور على الأقل ${field.errors['minlength'].requiredLength} أحرف`;
      if (field.errors['mismatch']) return 'كلمات المرور غير متطابقة';
      if (field.errors['weakPassword']) return 'كلمة المرور ضعيفة جداً';
    }
    return '';
  }
}

