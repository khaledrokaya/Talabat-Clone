import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileService, CustomerProfile, UpdateProfileRequest } from '../../shared/services/profile.service';
import { AuthService } from '../../shared/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import { User } from '../../shared/models/user';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-personal-data',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './personal-data.html',
  styleUrls: ['./personal-data.scss']
})
export class PersonalData implements OnInit, OnDestroy {
  profileForm: FormGroup;
  addressForm: FormGroup;
  deliveryPreferencesForm: FormGroup;
  currentUser: User | null = null;
  profile: CustomerProfile | null = null;
  loading = false;
  submitting = false;
  activeTab = 'personal';
  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {
    this.profileForm = this.createPersonalForm();
    this.addressForm = this.createAddressForm();
    this.deliveryPreferencesForm = this.createDeliveryPreferencesForm();
  }

  ngOnInit() {
    this.loadUserProfile();
    this.subscribeToAuthState();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private createPersonalForm(): FormGroup {
    return this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s-()]+$/)]]
    });
  }

  private createAddressForm(): FormGroup {
    return this.fb.group({
      street: ['', [Validators.required, Validators.minLength(5)]],
      city: ['', [Validators.required, Validators.minLength(2)]],
      state: [''],
      zipCode: ['', [Validators.pattern(/^\d{5}(-\d{4})?$/)]],
      coordinates: this.fb.group({
        lat: [''],
        lng: ['']
      })
    });
  }

  private createDeliveryPreferencesForm(): FormGroup {
    return this.fb.group({
      preferredDeliveryTime: [''],
      specialInstructions: ['', [Validators.maxLength(200)]]
    });
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  private subscribeToAuthState() {
    const authSub = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.populateForm(user);
      }
    });
    this.subscriptions.push(authSub);
  }

  private loadUserProfile() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.loading = true;

    const profileSub = this.profileService.getProfile().subscribe({
      next: (profile) => {
        this.profile = profile;
        this.populateFormFromProfile(profile);
        this.loading = false;
      },
      error: (error) => {
        this.toastService.error('Error loading data', 'Loading Error');
        this.loading = false;
      }
    });
    this.subscriptions.push(profileSub);
  }

  private populateForm(user: User) {
    // Populate personal data form
    this.profileForm.patchValue({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || ''
    });

    // Populate address form if user has address data
    if ((user as any).address) {
      this.addressForm.patchValue({
        street: (user as any).address.street || '',
        city: (user as any).address.city || '',
        state: (user as any).address.state || '',
        zipCode: (user as any).address.zipCode || ''
      });
    }

    // Populate delivery preferences form if user has delivery preferences
    if ((user as any).deliveryPreferences) {
      this.deliveryPreferencesForm.patchValue({
        preferredDeliveryTime: (user as any).deliveryPreferences.preferredDeliveryTime || '',
        specialInstructions: (user as any).deliveryPreferences.specialInstructions || ''
      });
    }
  }

  private populateFormFromProfile(profile: CustomerProfile) {
    // Populate personal data form
    this.profileForm.patchValue({
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      email: profile.email || '',
      phone: profile.phone || ''
    });

    // Populate address form
    if (profile.address) {
      this.addressForm.patchValue({
        street: profile.address.street || '',
        city: profile.address.city || '',
        state: profile.address.state || '',
        zipCode: profile.address.zipCode || ''
      });
    }

    // Populate delivery preferences form
    if (profile.deliveryPreferences) {
      this.deliveryPreferencesForm.patchValue({
        preferredDeliveryTime: profile.deliveryPreferences.preferredDeliveryTime || '',
        specialInstructions: profile.deliveryPreferences.specialInstructions || ''
      });
    }
  }

  onSubmitPersonalData() {
    if (this.profileForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.submitting = true;

    const personalData = this.profileForm.value;

    // Create the update data for personal info only
    const updateData = {
      firstName: personalData.firstName,
      lastName: personalData.lastName,
      phone: personalData.phone
    };

    const updateSub = this.profileService.updateProfile(updateData).subscribe({
      next: (updatedProfile: CustomerProfile) => {
        this.profile = updatedProfile;
        this.toastService.success('Personal information updated successfully', 'Profile Updated');
        this.submitting = false;

        // Update auth service with new user data by refreshing user state
        this.authService.refreshUserState();
      },
      error: (error: any) => {
        this.toastService.showApiError(error, 'Error saving personal information');
        this.submitting = false;
      }
    });
    this.subscriptions.push(updateSub);
  }

  onSubmitAddress() {
    if (this.addressForm.invalid) {
      this.markAddressFormTouched();
      return;
    }

    this.submitting = true;

    const addressData = this.addressForm.value;

    // Create the update data for address only
    const updateData = {
      address: {
        street: addressData.street,
        city: addressData.city,
        state: addressData.state,
        zipCode: addressData.zipCode
      }
    };

    const updateSub = this.profileService.updateProfile(updateData).subscribe({
      next: (updatedProfile: CustomerProfile) => {
        this.profile = updatedProfile;
        this.toastService.success('Address updated successfully', 'Profile Updated');
        this.submitting = false;

        // Update auth service with new user data by refreshing user state
        this.authService.refreshUserState();
      },
      error: (error: any) => {
        this.toastService.showApiError(error, 'Error saving address');
        this.submitting = false;
      }
    });
    this.subscriptions.push(updateSub);
  }

  onSubmitDeliveryPreferences() {
    if (this.deliveryPreferencesForm.invalid) {
      this.markDeliveryFormTouched();
      return;
    }

    this.submitting = true;

    const deliveryData = this.deliveryPreferencesForm.value;

    // Create the update data for delivery preferences only
    const updateData = {
      deliveryPreferences: {
        preferredDeliveryTime: deliveryData.preferredDeliveryTime,
        specialInstructions: deliveryData.specialInstructions
      }
    };

    const updateSub = this.profileService.updateProfile(updateData).subscribe({
      next: (updatedProfile: CustomerProfile) => {
        this.profile = updatedProfile;
        this.toastService.success('Delivery preferences updated successfully', 'Profile Updated');
        this.submitting = false;

        // Update auth service with new user data by refreshing user state
        this.authService.refreshUserState();
      },
      error: (error: any) => {
        this.toastService.showApiError(error, 'Error saving delivery preferences');
        this.submitting = false;
      }
    });
    this.subscriptions.push(updateSub);
  }

  resetForm(tab?: string) {
    if (this.profile) {
      this.populateFormFromProfile(this.profile);
    }
  }

  resetAllForms() {
    this.resetForm();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.toastService.warning('Please select a valid image file', 'File Validation');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.toastService.warning('Image size must be less than 5 MB', 'File Size');
      return;
    }
  }

  getRoleDisplayName(role?: string): string {
    const roleNames: { [key: string]: string } = {
      'customer': 'Customer',
      'restaurant_owner': 'Restaurant Owner',
      'admin': 'System Admin'
    };
    return roleNames[role || ''] || 'Not Specified';
  }

  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  getFieldError(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'This field is required';
      if (field.errors['minlength']) return `Must be at least ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['maxlength']) return `Must be no more than ${field.errors['maxlength'].requiredLength} characters`;
      if (field.errors['email']) return 'Invalid email format';
      if (field.errors['pattern']) return 'Invalid format';
    }
    return '';
  }

  private markFormGroupTouched() {
    // Mark personal form as touched
    Object.keys(this.profileForm.controls).forEach(key => {
      const control = this.profileForm.get(key);
      control?.markAsTouched();
    });
  }

  private markAddressFormTouched() {
    // Mark address form as touched
    Object.keys(this.addressForm.controls).forEach(key => {
      const control = this.addressForm.get(key);
      control?.markAsTouched();
    });
  }

  private markDeliveryFormTouched() {
    // Mark delivery preferences form as touched
    Object.keys(this.deliveryPreferencesForm.controls).forEach(key => {
      const control = this.deliveryPreferencesForm.get(key);
      control?.markAsTouched();
    });
  }
}

