import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn, FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class FormValidationService {

  // Custom validators
  static emailValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) {
        return null; // Let required validator handle empty values
      }
      
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return emailRegex.test(value) ? null : { email: { value } };
    };
  }

  static passwordStrengthValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) {
        return null; // Let required validator handle empty values
      }

      const errors: any = {};

      if (value.length < 8) {
        errors.minLength = true;
      }

      if (!/[A-Z]/.test(value)) {
        errors.uppercase = true;
      }

      if (!/[a-z]/.test(value)) {
        errors.lowercase = true;
      }

      if (!/\d/.test(value)) {
        errors.number = true;
      }

      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
        errors.specialChar = true;
      }

      return Object.keys(errors).length > 0 ? { passwordStrength: errors } : null;
    };
  }

  static phoneValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) {
        return null;
      }

      // Allow various phone formats: +1234567890, (123) 456-7890, 123-456-7890, etc.
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      const cleanValue = value.replace(/[\s\-\(\)]/g, '');
      
      return phoneRegex.test(cleanValue) ? null : { phone: { value } };
    };
  }

  static passwordMatchValidator(passwordField: string, confirmPasswordField: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const formGroup = control as FormGroup;
      const password = formGroup.get(passwordField);
      const confirmPassword = formGroup.get(confirmPasswordField);

      if (!password || !confirmPassword || password.value === confirmPassword.value) {
        return null;
      }

      return { passwordMismatch: true };
    };
  }

  static urlValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) {
        return null;
      }

      try {
        new URL(value);
        return null;
      } catch {
        return { url: { value } };
      }
    };
  }

  static minAgeValidator(minAge: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) {
        return null;
      }

      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        return age < minAge ? { minAge: { requiredAge: minAge, currentAge: age - 1 } } : null;
      }

      return age < minAge ? { minAge: { requiredAge: minAge, currentAge: age } } : null;
    };
  }

  // Error message functions
  getFieldErrorMessage(fieldName: string, errors: ValidationErrors | null): string {
    if (!errors) {
      return '';
    }

    const fieldDisplayName = this.getFieldDisplayName(fieldName);

    if (errors['required']) {
      return `${fieldDisplayName} is required.`;
    }

    if (errors['email']) {
      return 'Please enter a valid email address.';
    }

    if (errors['phone']) {
      return 'Please enter a valid phone number.';
    }

    if (errors['url']) {
      return 'Please enter a valid URL.';
    }

    if (errors['minlength']) {
      const requiredLength = errors['minlength'].requiredLength;
      return `${fieldDisplayName} must be at least ${requiredLength} characters long.`;
    }

    if (errors['maxlength']) {
      const requiredLength = errors['maxlength'].requiredLength;
      return `${fieldDisplayName} cannot exceed ${requiredLength} characters.`;
    }

    if (errors['min']) {
      return `${fieldDisplayName} must be at least ${errors['min'].min}.`;
    }

    if (errors['max']) {
      return `${fieldDisplayName} cannot exceed ${errors['max'].max}.`;
    }

    if (errors['pattern']) {
      return `${fieldDisplayName} format is invalid.`;
    }

    if (errors['passwordStrength']) {
      const strengthErrors = errors['passwordStrength'];
      const messages = [];
      
      if (strengthErrors.minLength) {
        messages.push('at least 8 characters');
      }
      if (strengthErrors.uppercase) {
        messages.push('one uppercase letter');
      }
      if (strengthErrors.lowercase) {
        messages.push('one lowercase letter');
      }
      if (strengthErrors.number) {
        messages.push('one number');
      }
      if (strengthErrors.specialChar) {
        messages.push('one special character');
      }

      return `Password must contain ${messages.join(', ')}.`;
    }

    if (errors['passwordMismatch']) {
      return 'Passwords do not match.';
    }

    if (errors['minAge']) {
      const { requiredAge } = errors['minAge'];
      return `You must be at least ${requiredAge} years old.`;
    }

    // Generic error message
    return `${fieldDisplayName} is invalid.`;
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      'email': 'Email',
      'password': 'Password',
      'confirmPassword': 'Confirm Password',
      'firstName': 'First Name',
      'lastName': 'Last Name',
      'phone': 'Phone Number',
      'address': 'Address',
      'city': 'City',
      'state': 'State',
      'zipCode': 'ZIP Code',
      'businessName': 'Business Name',
      'description': 'Description',
      'website': 'Website',
      'licenseNumber': 'License Number',
      'vehicleType': 'Vehicle Type',
      'drivingLicense': 'Driving License'
    };

    return displayNames[fieldName] || fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
  }

  // Form validation helpers
  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      return this.getFieldErrorMessage(fieldName, field.errors);
    }
    return '';
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      control?.markAsTouched({ onlySelf: true });

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Password strength indicator
  getPasswordStrength(password: string): { strength: string; score: number } {
    if (!password) {
      return { strength: 'none', score: 0 };
    }

    let score = 0;
    const checks = [
      password.length >= 8,
      /[A-Z]/.test(password),
      /[a-z]/.test(password),
      /\d/.test(password),
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      password.length >= 12
    ];

    score = checks.filter(check => check).length;

    if (score <= 2) {
      return { strength: 'weak', score };
    } else if (score <= 4) {
      return { strength: 'medium', score };
    } else {
      return { strength: 'strong', score };
    }
  }
}