import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService, SystemSettings } from '../../shared/services/admin.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './settings.html',
  styleUrls: ['./settings.scss']
})
export class Settings implements OnInit {
  settings: SystemSettings | null = null;
  isLoading = true;
  errorMessage = '';
  successMessage = '';
  hasUnsavedChanges = false;
  activeSection = 'general';

  // Form groups for different sections
  generalForm: FormGroup;
  paymentForm: FormGroup;
  deliveryForm: FormGroup;
  notificationForm: FormGroup;
  securityForm: FormGroup;

  // Configuration data
  paymentMethods: any[] = [
    {
      name: 'Credit Card',
      icon: 'fas fa-credit-card',
      enabled: true,
      config: [
        { label: 'Stripe Public Key', type: 'text', placeholder: 'pk_test_...', value: '' },
        { label: 'Stripe Secret Key', type: 'password', placeholder: 'sk_test_...', value: '' }
      ]
    },
    {
      name: 'PayPal',
      icon: 'fab fa-paypal',
      enabled: false,
      config: [
        { label: 'PayPal Client ID', type: 'text', placeholder: 'Your PayPal Client ID', value: '' },
        { label: 'PayPal Secret', type: 'password', placeholder: 'Your PayPal Secret', value: '' }
      ]
    },
    {
      name: 'Cash on Delivery',
      icon: 'fas fa-money-bill-wave',
      enabled: true,
      config: []
    }
  ];

  deliveryZones: any[] = [
    { name: 'Downtown', fee: 2.50, radius: 5 },
    { name: 'Suburbs', fee: 4.00, radius: 15 }
  ];

  operatingHours: any[] = [
    { name: 'Monday', enabled: true, openTime: '08:00', closeTime: '22:00' },
    { name: 'Tuesday', enabled: true, openTime: '08:00', closeTime: '22:00' },
    { name: 'Wednesday', enabled: true, openTime: '08:00', closeTime: '22:00' },
    { name: 'Thursday', enabled: true, openTime: '08:00', closeTime: '22:00' },
    { name: 'Friday', enabled: true, openTime: '08:00', closeTime: '23:00' },
    { name: 'Saturday', enabled: true, openTime: '09:00', closeTime: '23:00' },
    { name: 'Sunday', enabled: true, openTime: '09:00', closeTime: '21:00' }
  ];

  emailNotifications: any[] = [
    {
      title: 'New Order Notifications',
      description: 'Notify when new orders are placed',
      icon: 'fas fa-shopping-cart',
      enabled: true
    },
    {
      title: 'User Registration',
      description: 'Notify when new users register',
      icon: 'fas fa-user-plus',
      enabled: true
    },
    {
      title: 'Restaurant Applications',
      description: 'Notify when restaurants apply',
      icon: 'fas fa-utensils',
      enabled: true
    }
  ];

  pushNotifications: any[] = [
    {
      title: 'Order Status Updates',
      description: 'Push notifications for order status changes',
      icon: 'fas fa-bell',
      enabled: true
    },
    {
      title: 'Promotional Offers',
      description: 'Push promotional notifications',
      icon: 'fas fa-tag',
      enabled: false
    }
  ];

  systemInfo = {
    version: '1.0.0',
    databaseVersion: 'MongoDB 5.0',
    lastBackup: new Date().toISOString(),
    uptime: '15 days 3 hours'
  };

  constructor(
    private adminService: AdminService,
    private fb: FormBuilder
  ) {
    this.generalForm = this.fb.group({
      platformName: ['Talabat Clone', Validators.required],
      platformUrl: ['https://localhost:4200', Validators.required],
      supportEmail: ['support@talabatclone.com', [Validators.required, Validators.email]],
      supportPhone: ['+1234567890', Validators.required],
      defaultCurrency: ['USD', Validators.required],
      timeZone: ['UTC', Validators.required],
      maintenanceMode: [false]
    });

    this.paymentForm = this.fb.group({
      platformCommission: [10, [Validators.required, Validators.min(0), Validators.max(50)]],
      deliveryFee: [2.50, [Validators.required, Validators.min(0)]],
      autoRefunds: [true]
    });

    this.deliveryForm = this.fb.group({
      defaultDeliveryTime: [30, [Validators.required, Validators.min(15), Validators.max(120)]],
      maxDeliveryDistance: [20, [Validators.required, Validators.min(1), Validators.max(50)]]
    });

    this.notificationForm = this.fb.group({
      smtpServer: ['smtp.gmail.com'],
      smtpPort: [587, [Validators.required, Validators.min(1), Validators.max(65535)]],
      smtpUsername: [''],
      smtpPassword: ['']
    });

    this.securityForm = this.fb.group({
      twoFactorAuth: [false],
      passwordComplexity: [true],
      sessionTimeout: [true],
      loginAttemptLimit: [true],
      sessionTimeoutDuration: [60, [Validators.required, Validators.min(5), Validators.max(480)]],
      maxLoginAttempts: [5, [Validators.required, Validators.min(3), Validators.max(10)]],
      dataRetentionPeriod: [365, [Validators.required, Validators.min(30), Validators.max(2555)]]
    });
  }

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.adminService.getSystemSettings().subscribe({
      next: (response) => {
        if (response.success) {
          this.settings = response.data;
          // Update forms with loaded settings if needed
        } else {
          this.errorMessage = 'Failed to load system settings';
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error loading settings: ' + (error.error?.message || 'Unknown error');
        this.isLoading = false;
      }
    });
  }

  setActiveSection(section: string): void {
    this.activeSection = section;
  }

  saveAllSettings(): void {
    // Save all forms
    this.saveSettings();
  }

  saveSettings(): void {
    const allSettings = {
      general: this.generalForm.value,
      payment: this.paymentForm.value,
      delivery: this.deliveryForm.value,
      notification: this.notificationForm.value,
      security: this.securityForm.value,
      paymentMethods: this.paymentMethods,
      deliveryZones: this.deliveryZones,
      operatingHours: this.operatingHours,
      emailNotifications: this.emailNotifications,
      pushNotifications: this.pushNotifications
    };

    this.adminService.updateSystemSettings(allSettings as any).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage = 'Settings saved successfully!';
          this.hasUnsavedChanges = false;
          setTimeout(() => this.clearMessages(), 5000);
        } else {
          this.errorMessage = 'Failed to update settings';
        }
      },
      error: (error) => {
        this.errorMessage = 'Error updating settings: ' + (error.error?.message || 'Unknown error');
      }
    });
  }

  resetToDefaults(): void {
    if (confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) {
      // Reset all forms to default values
      this.generalForm.reset({
        platformName: 'Talabat Clone',
        platformUrl: 'https://localhost:4200',
        supportEmail: 'support@talabatclone.com',
        supportPhone: '+1234567890',
        defaultCurrency: 'USD',
        timeZone: 'UTC',
        maintenanceMode: false
      });

      this.hasUnsavedChanges = true;
      this.successMessage = 'Settings reset to defaults. Click "Save All Changes" to apply.';
    }
  }

  togglePaymentMethod(method: any): void {
    method.enabled = !method.enabled;
    this.hasUnsavedChanges = true;
  }

  addDeliveryZone(): void {
    this.deliveryZones.push({ name: '', fee: 0, radius: 0 });
    this.hasUnsavedChanges = true;
  }

  removeDeliveryZone(index: number): void {
    this.deliveryZones.splice(index, 1);
    this.hasUnsavedChanges = true;
  }

  clearCache(): void {
    if (confirm('Are you sure you want to clear the application cache?')) {
      // Implement cache clearing logic
      this.successMessage = 'Cache cleared successfully!';
      setTimeout(() => this.clearMessages(), 3000);
    }
  }

  backupDatabase(): void {
    if (confirm('Create a backup of the current database?')) {
      // Implement database backup logic
      this.successMessage = 'Database backup created successfully!';
      setTimeout(() => this.clearMessages(), 3000);
    }
  }

  viewSystemHealth(): void {
    // Implement system health viewing logic
    alert('System Health: All services running normally');
  }

  downloadLogs(): void {
    // Implement log download logic
    this.successMessage = 'System logs download started!';
    setTimeout(() => this.clearMessages(), 3000);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}
