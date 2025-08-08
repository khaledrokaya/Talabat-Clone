import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../shared/services/user.service';
import { Address } from '../../shared/models/address';

@Component({
  selector: 'app-addresses',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './addresses.html',
  styleUrls: ['./addresses.scss']
})
export class Addresses implements OnInit {
  addresses: Address[] = [];
  isLoading = true;
  showAddressModal = false;
  showDeleteModal = false;
  isEditMode = false;
  isSubmitting = false;
  addressForm!: FormGroup;
  currentAddressId: string | null = null;
  addressToDelete: string | null = null;

  constructor(
    private userService: UserService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadAddresses();
  }

  initializeForm(): void {
    this.addressForm = this.fb.group({
      type: ['home', [Validators.required]],
      label: [''],
      city: ['', [Validators.required]],
      area: ['', [Validators.required]],
      street: ['', [Validators.required]],
      building: ['', [Validators.required]],
      floor: [''],
      apartment: [''],
      phone: ['', [Validators.required, Validators.pattern(/^05[0-9]{8}$/)]],
      notes: [''],
      isDefault: [false]
    });

    // إضافة validator للتسمية عندما يكون النوع "أخرى"
    this.addressForm.get('type')?.valueChanges.subscribe(type => {
      const labelControl = this.addressForm.get('label');
      if (type === 'other') {
        labelControl?.setValidators([Validators.required]);
      } else {
        labelControl?.clearValidators();
      }
      labelControl?.updateValueAndValidity();
    });
  }

  loadAddresses(): void {
    this.isLoading = true;
    
    this.userService.getAddresses().subscribe({
      next: (addresses) => {
        this.addresses = addresses;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('خطأ في تحميل العناوين:', error);
        this.isLoading = false;
        this.addresses = [];
      }
    });
  }

  getAddressIcon(type: string): string {
    switch (type) {
      case 'home':
        return 'fas fa-home';
      case 'work':
        return 'fas fa-briefcase';
      default:
        return 'fas fa-map-marker-alt';
    }
  }

  getAddressTypeText(type: string): string {
    switch (type) {
      case 'home':
        return 'المنزل';
      case 'work':
        return 'العمل';
      default:
        return 'أخرى';
    }
  }

  openAddAddressModal(): void {
    this.isEditMode = false;
    this.showAddressModal = true;
    this.addressForm.reset({
      type: 'home',
      isDefault: false
    });
  }

  editAddress(address: Address): void {
    this.isEditMode = true;
    this.currentAddressId = address._id!;
    this.showAddressModal = true;
    
    this.addressForm.patchValue({
      type: address.type || 'home',
      label: address.label || '',
      city: address.city,
      area: address.area,
      street: address.street,
      building: address.building,
      floor: address.floor || '',
      apartment: address.apartment || '',
      phone: address.phone,
      notes: address.notes || '',
      isDefault: address.isDefault || false
    });
  }

  closeAddressModal(): void {
    this.showAddressModal = false;
    this.isEditMode = false;
    this.currentAddressId = null;
    this.addressForm.reset();
  }

  onSubmitAddress(): void {
    if (this.addressForm.valid) {
      this.isSubmitting = true;
      
      const addressData = {
        ...this.addressForm.value,
        label: this.addressForm.value.type === 'other' ? this.addressForm.value.label : ''
      };

      if (this.isEditMode && this.currentAddressId) {
        this.userService.updateAddress(this.currentAddressId, addressData).subscribe({
          next: () => {
            this.isSubmitting = false;
            this.closeAddressModal();
            this.loadAddresses();
            alert('تم تحديث العنوان بنجاح');
          },
          error: (error) => {
            this.isSubmitting = false;
            console.error('خطأ في تحديث العنوان:', error);
            alert('حدث خطأ أثناء تحديث العنوان');
          }
        });
      } else {
        this.userService.addAddress(addressData).subscribe({
          next: () => {
            this.isSubmitting = false;
            this.closeAddressModal();
            this.loadAddresses();
            alert('تم إضافة العنوان بنجاح');
          },
          error: (error) => {
            this.isSubmitting = false;
            console.error('خطأ في إضافة العنوان:', error);
            alert('حدث خطأ أثناء إضافة العنوان');
          }
        });
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  deleteAddress(addressId: string): void {
    this.addressToDelete = addressId;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (this.addressToDelete) {
      this.userService.deleteAddress(this.addressToDelete).subscribe({
        next: () => {
          this.loadAddresses();
          this.showDeleteModal = false;
          this.addressToDelete = null;
          alert('تم حذف العنوان بنجاح');
        },
        error: (error) => {
          console.error('خطأ في حذف العنوان:', error);
          alert('حدث خطأ أثناء حذف العنوان');
          this.showDeleteModal = false;
          this.addressToDelete = null;
        }
      });
    }
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.addressToDelete = null;
  }

  setDefaultAddress(addressId: string): void {
    this.userService.setDefaultAddress(addressId).subscribe({
      next: () => {
        this.loadAddresses();
        alert('تم تعيين العنوان كافتراضي');
      },
      error: (error) => {
        console.error('خطأ في تعيين العنوان الافتراضي:', error);
        alert('حدث خطأ أثناء تعيين العنوان الافتراضي');
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.addressForm.controls).forEach(key => {
      const control = this.addressForm.get(key);
      control?.markAsTouched();
    });
  }
}

