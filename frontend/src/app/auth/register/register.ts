import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, CustomerRegisterRequest, RestaurantRegisterRequest, DeliveryRegisterRequest } from '../../shared/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import { FormValidationService } from '../../shared/services/form-validation.service';
import { TalabatLogo } from '../../shared/components/talabat-logo/talabat-logo';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, TalabatLogo],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  currentStep = 1;
  selectedRole: 'customer' | 'restaurant' | 'delivery' = 'customer';
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  basicForm!: FormGroup;
  customerForm!: FormGroup;
  restaurantForm!: FormGroup;
  deliveryForm!: FormGroup;

  // Dropdown options for restaurant form
  cuisineOptions = [
    { value: 'Italian', label: 'Italian' },
    { value: 'Chinese', label: 'Chinese' },
    { value: 'Mexican', label: 'Mexican' },
    { value: 'Indian', label: 'Indian' },
    { value: 'Japanese', label: 'Japanese' },
    { value: 'Thai', label: 'Thai' },
    { value: 'Mediterranean', label: 'Mediterranean' },
    { value: 'American', label: 'American' },
    { value: 'French', label: 'French' },
    { value: 'Korean', label: 'Korean' },
    { value: 'Vietnamese', label: 'Vietnamese' },
    { value: 'Middle Eastern', label: 'Middle Eastern' },
    { value: 'Greek', label: 'Greek' },
    { value: 'Turkish', label: 'Turkish' },
    { value: 'Lebanese', label: 'Lebanese' },
    { value: 'Egyptian', label: 'Egyptian' },
    { value: 'Other', label: 'Other' }
  ];

  restaurantTypeOptions = [
    { value: 'fast_food', label: 'Fast Food' },
    { value: 'casual_dining', label: 'Casual Dining' },
    { value: 'fine_dining', label: 'Fine Dining' },
    { value: 'cafe', label: 'Cafe' },
    { value: 'bakery', label: 'Bakery' },
    { value: 'dessert_shop', label: 'Dessert Shop' },
    { value: 'juice_bar', label: 'Juice Bar' },
    { value: 'food_truck', label: 'Food Truck' },
    { value: 'cloud_kitchen', label: 'Cloud Kitchen' },
    { value: 'buffet', label: 'Buffet' }
  ];

  serviceTypeOptions = [
    { value: 'delivery_only', label: 'Delivery Only' },
    { value: 'pickup_only', label: 'Pickup Only' },
    { value: 'both', label: 'Delivery & Pickup' }
  ];

  cityOptions = [
    { value: 'Cairo', label: 'Cairo' },
    { value: 'Alexandria', label: 'Alexandria' },
    { value: 'Giza', label: 'Giza' },
    { value: 'Sharm El Sheikh', label: 'Sharm El Sheikh' },
    { value: 'Hurghada', label: 'Hurghada' },
    { value: 'Luxor', label: 'Luxor' },
    { value: 'Aswan', label: 'Aswan' },
    { value: 'Port Said', label: 'Port Said' },
    { value: 'Suez', label: 'Suez' },
    { value: 'Mansoura', label: 'Mansoura' },
    { value: 'Tanta', label: 'Tanta' },
    { value: 'Ismailia', label: 'Ismailia' },
    { value: 'Other', label: 'Other' }
  ];

  stateOptions = [
    { value: 'Cairo', label: 'Cairo Governorate' },
    { value: 'Alexandria', label: 'Alexandria Governorate' },
    { value: 'Giza', label: 'Giza Governorate' },
    { value: 'Red Sea', label: 'Red Sea Governorate' },
    { value: 'South Sinai', label: 'South Sinai Governorate' },
    { value: 'Luxor', label: 'Luxor Governorate' },
    { value: 'Aswan', label: 'Aswan Governorate' },
    { value: 'Port Said', label: 'Port Said Governorate' },
    { value: 'Suez', label: 'Suez Governorate' },
    { value: 'Dakahlia', label: 'Dakahlia Governorate' },
    { value: 'Gharbia', label: 'Gharbia Governorate' },
    { value: 'Ismailia', label: 'Ismailia Governorate' },
    { value: 'Other', label: 'Other' }
  ];

  bankOptions = [
    { value: 'National Bank of Egypt', label: 'National Bank of Egypt' },
    { value: 'Banque Misr', label: 'Banque Misr' },
    { value: 'Commercial International Bank', label: 'Commercial International Bank (CIB)' },
    { value: 'QNB ALAHLI', label: 'QNB ALAHLI' },
    { value: 'HSBC Egypt', label: 'HSBC Egypt' },
    { value: 'Arab African International Bank', label: 'Arab African International Bank' },
    { value: 'Crédit Agricole Egypt', label: 'Crédit Agricole Egypt' },
    { value: 'Bank of Alexandria', label: 'Bank of Alexandria' },
    { value: 'Faisal Islamic Bank', label: 'Faisal Islamic Bank' },
    { value: 'Other', label: 'Other' }
  ];

  deliveryTimeOptions = [
    { value: 15, label: '15 minutes' },
    { value: 20, label: '20 minutes' },
    { value: 25, label: '25 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 35, label: '35 minutes' },
    { value: 40, label: '40 minutes' },
    { value: 45, label: '45 minutes' },
    { value: 60, label: '1 hour' },
    { value: 90, label: '1.5 hours' },
    { value: 120, label: '2 hours' }
  ];

  vehicleTypeOptions = [
    { value: 'motorcycle', label: 'Motorcycle' },
    { value: 'car', label: 'Car' },
    { value: 'bicycle', label: 'Bicycle' },
    { value: 'scooter', label: 'Scooter' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private toastService: ToastService,
    private formValidationService: FormValidationService
  ) {
    this.initializeForms();
  }

  private initializeForms(): void {
    // Basic information form
    this.basicForm = this.fb.group({
      email: ['', [
        Validators.required,
        FormValidationService.emailValidator()
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        FormValidationService.passwordStrengthValidator()
      ]],
      confirmPassword: ['', [Validators.required]],
      firstName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]],
      lastName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]],
      phone: ['', [
        Validators.required,
        FormValidationService.phoneValidator()
      ]]
    }, {
      validators: FormValidationService.passwordMatchValidator('password', 'confirmPassword')
    });

    // Customer specific form
    this.customerForm = this.fb.group({
      street: ['', [Validators.required]],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      zipCode: ['', [Validators.required]]
    });

    // Restaurant specific form
    this.restaurantForm = this.fb.group({
      restaurantName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ]],
      description: ['', [
        Validators.required,
        Validators.minLength(20),
        Validators.maxLength(500)
      ]],
      restaurantType: ['', [Validators.required]],
      cuisineType: ['', [Validators.required]],
      serviceType: ['both', [Validators.required]],
      averageDeliveryTime: [30, [
        Validators.required,
        Validators.min(15),
        Validators.max(120)
      ]],
      minimumOrderAmount: [15, [
        Validators.required,
        Validators.min(5),
        Validators.max(100)
      ]],
      deliveryFee: [3.99, [
        Validators.required,
        Validators.min(0),
        Validators.max(50)
      ]],
      serviceRadius: [10, [
        Validators.required,
        Validators.min(1),
        Validators.max(100)
      ]],
      licenseNumber: ['', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(50)
      ]],
      taxId: ['', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(50)
      ]],
      bankAccountNumber: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(30)
      ]],
      bankName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ]],
      website: ['', FormValidationService.urlValidator()],
      instagram: [''],
      facebook: [''],
      twitter: [''],
      logoUrl: ['', FormValidationService.urlValidator()],
      bannerUrl: ['', FormValidationService.urlValidator()],
      openingTime: ['08:00', [Validators.required]],
      closingTime: ['22:00', [Validators.required]],
      isOpen: [true],
      acceptsOnlinePayment: [true],
      acceptsCashOnDelivery: [true],
      specialOffers: [''],
      tags: [''],
      street: ['', [Validators.required]],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      zipCode: ['', [Validators.required]],
      latitude: [''],
      longitude: ['']
    });

    // Delivery specific form
    this.deliveryForm = this.fb.group({
      vehicleType: ['', [Validators.required]],
      licensePlate: ['', [Validators.required]],
      vehicleColor: ['', [Validators.required]],
      vehicleModel: ['', [Validators.required]],
      deliveryZones: ['', [Validators.required]],
      licenseNumber: ['', [Validators.required]],
      licenseImage: ['', [Validators.required]],
      vehicleRegistration: ['', [Validators.required]],
      identityProof: ['', [Validators.required]],
      street: ['', [Validators.required]],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      zipCode: ['', [Validators.required]]
    });
  }

  private passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password');
    const confirmPassword = formGroup.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ mismatch: true });
    } else {
      confirmPassword?.setErrors(null);
    }
    return null;
  }

  selectRole(role: 'customer' | 'restaurant' | 'delivery'): void {
    this.selectedRole = role;
    this.currentStep = 2;
    this.errorMessage = '';
  }

  nextStep(): void {
    if (this.currentStep === 2 && this.basicForm.valid) {
      this.currentStep = 3;
    } else if (this.currentStep === 2 && this.basicForm.invalid) {
      this.formValidationService.markFormGroupTouched(this.basicForm);
      this.toastService.showValidationError('Please fill in all required fields correctly');
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  onRegister(): void {
    if (!this.isFormValid()) {
      this.errorMessage = 'Please fill in all required fields';
      this.toastService.showValidationError('Please fill in all required fields correctly');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const basicData = this.basicForm.value;

    switch (this.selectedRole) {
      case 'customer':
        this.registerCustomer(basicData);
        break;
      case 'restaurant':
        this.registerRestaurant(basicData);
        break;
      case 'delivery':
        this.registerDelivery(basicData);
        break;
    }
  }

  private registerCustomer(basicData: any): void {
    const customerData = this.customerForm.value;
    const registerData: CustomerRegisterRequest = {
      email: basicData.email,
      password: basicData.password,
      firstName: basicData.firstName,
      lastName: basicData.lastName,
      phone: basicData.phone,
      address: {
        street: customerData.street,
        city: customerData.city,
        state: customerData.state,
        zipCode: customerData.zipCode
      }
    };

    this.authService.registerCustomer(registerData).subscribe({
      next: (response) => this.handleSuccess(response),
      error: (error) => this.handleError(error)
    });
  }

  private registerRestaurant(basicData: any): void {
    const restaurantData = this.restaurantForm.value;
    const cuisineTypes = restaurantData.cuisineType.split(',').map((type: string) => type.trim());
    const tags = restaurantData.tags ? restaurantData.tags.split(',').map((tag: string) => tag.trim()) : [];

    const registerData: RestaurantRegisterRequest = {
      email: basicData.email,
      password: basicData.password,
      firstName: basicData.firstName,
      lastName: basicData.lastName,
      phone: basicData.phone,
      restaurantDetails: {
        name: restaurantData.restaurantName,
        description: restaurantData.description,
        cuisineType: cuisineTypes,
        averageDeliveryTime: restaurantData.averageDeliveryTime,
        minimumOrderAmount: restaurantData.minimumOrderAmount,
        deliveryFee: restaurantData.deliveryFee,
        serviceRadius: restaurantData.serviceRadius,
        logoUrl: restaurantData.logoUrl,
        bannerUrl: restaurantData.bannerUrl,
        openingTime: restaurantData.openingTime,
        closingTime: restaurantData.closingTime,
        isOpen: restaurantData.isOpen,
        acceptsOnlinePayment: restaurantData.acceptsOnlinePayment,
        acceptsCashOnDelivery: restaurantData.acceptsCashOnDelivery,
        specialOffers: restaurantData.specialOffers,
        tags: tags,
        socialMedia: {
          website: restaurantData.website,
          instagram: restaurantData.instagram,
          facebook: restaurantData.facebook,
          twitter: restaurantData.twitter
        }
      },
      businessInfo: {
        licenseNumber: restaurantData.licenseNumber,
        taxId: restaurantData.taxId,
        bankAccountNumber: restaurantData.bankAccountNumber,
        bankName: restaurantData.bankName
      },
      address: {
        street: restaurantData.street,
        city: restaurantData.city,
        state: restaurantData.state,
        zipCode: restaurantData.zipCode,
        coordinates: {
          latitude: restaurantData.latitude ? parseFloat(restaurantData.latitude) : undefined,
          longitude: restaurantData.longitude ? parseFloat(restaurantData.longitude) : undefined
        }
      }
    };

    this.authService.registerRestaurant(registerData).subscribe({
      next: (response) => this.handleSuccess(response),
      error: (error) => this.handleError(error)
    });
  }

  private registerDelivery(basicData: any): void {
    const deliveryData = this.deliveryForm.value;
    const zones = deliveryData.deliveryZones.split(',').map((zone: string) => zone.trim());

    const registerData: DeliveryRegisterRequest = {
      email: basicData.email,
      password: basicData.password,
      firstName: basicData.firstName,
      lastName: basicData.lastName,
      phone: basicData.phone,
      vehicleInfo: {
        type: deliveryData.vehicleType,
        licensePlate: deliveryData.licensePlate,
        color: deliveryData.vehicleColor,
        model: deliveryData.vehicleModel
      },
      deliveryZones: zones,
      documents: {
        licenseNumber: deliveryData.licenseNumber,
        licenseImage: deliveryData.licenseImage,
        vehicleRegistration: deliveryData.vehicleRegistration,
        identityProof: deliveryData.identityProof
      },
      address: {
        street: deliveryData.street,
        city: deliveryData.city,
        state: deliveryData.state,
        zipCode: deliveryData.zipCode
      }
    };

    this.authService.registerDelivery(registerData).subscribe({
      next: (response) => this.handleSuccess(response),
      error: (error) => this.handleError(error)
    });
  }

  public isFormValid(): boolean {
    const isBasicValid = this.basicForm.valid;
    let isSpecificValid = false;

    switch (this.selectedRole) {
      case 'customer':
        isSpecificValid = this.customerForm.valid;
        break;
      case 'restaurant':
        isSpecificValid = this.restaurantForm.valid;
        break;
      case 'delivery':
        isSpecificValid = this.deliveryForm.valid;
        break;
    }

    return isBasicValid && isSpecificValid;
  }

  private handleSuccess(response: any): void {
    this.isLoading = false;
    if (response.success) {
      this.successMessage = 'Registration successful! Please check your email for verification.';
      this.toastService.success('Registration successful! A verification email has been sent to your inbox.', 'Welcome!', 6000);

      // Get email from the basic form
      const email = this.basicForm.get('email')?.value;

      setTimeout(() => {
        // Redirect to verify-email page with email parameter and indicate OTP was sent
        this.router.navigate(['/auth/verify-email'], {
          queryParams: {
            email: email,
            type: 'registration',
            otpSent: 'true'
          }
        });
      }, 2000);
    } else {
      this.errorMessage = response.message || 'Registration failed. Please try again.';
      this.toastService.error(this.errorMessage);
    }
  }

  private handleError(error: any): void {
    this.isLoading = false;

    if (error.error && !error.error.success) {
      this.errorMessage = error.error.message || 'Registration failed. Please try again.';
    } else {
      this.errorMessage = 'An unexpected error occurred. Please try again.';
    }

    this.toastService.error(this.errorMessage);
  }
}
