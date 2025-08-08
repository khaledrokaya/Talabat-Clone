import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { RestaurantService } from '../../shared/services/restaurant.service';

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './wallet.html',
  styleUrls: ['./wallet.scss']
})
export class Wallet implements OnInit {
  walletData: any = {};
  transactions: any[] = [];
  filteredTransactions: any[] = [];
  withdrawalRequests: any[] = [];
  isLoading = true;

  showWithdrawalModal = false;
  withdrawalForm!: FormGroup;
  isSubmittingWithdrawal = false;

  selectedPeriod = '6months';
  transactionFilter = 'all';

  constructor(
    private restaurantService: RestaurantService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadWalletData();
  }

  initializeForm(): void {
    this.withdrawalForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(50)]],
      bankAccount: ['', [Validators.required]],
      notes: ['']
    });
  }

  loadWalletData(): void {
    this.isLoading = true;
    
    // Simulate API calls
    Promise.all([
      this.restaurantService.getRestaurantStats().toPromise(),
      this.restaurantService.getRestaurantOrders().toPromise() // Assuming orders contain transaction data
    ]).then(([stats, orders]) => {
      this.walletData = {
        currentBalance: stats?.currentBalance || 0,
        totalEarnings: stats?.totalEarnings || 0,
        monthlyEarnings: stats?.monthlyEarnings || 0,
        pendingWithdrawals: stats?.pendingWithdrawals || 0,
      };

      // Simulate transactions from orders (for demonstration)
      this.transactions = (orders || []).map((order: any) => ({
        id: order._id,
        type: 'earning',
        description: `أرباح من الطلب #${order.orderNumber}`,
        amount: order.total,
        status: 'completed',
        createdAt: order.createdAt
      }));

      // Simulate some withdrawal requests
      this.withdrawalRequests = [
        { _id: 'req1', requestNumber: '001', amount: 100, status: 'pending', createdAt: new Date() },
        { _id: 'req2', requestNumber: '002', amount: 250, status: 'approved', createdAt: new Date(Date.now() - 86400000) },
      ];

      this.filterTransactions();
      this.isLoading = false;
    }).catch(error => {
      console.error('خطأ في تحميل بيانات المحفظة:', error);
      this.isLoading = false;
    });
  }

  formatDate(dateString: string): string {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('ar-SA', options);
  }

  // Transaction methods
  getTransactionIcon(type: string): string {
    switch (type) {
      case 'earning': return 'fas fa-money-bill-wave';
      case 'withdrawal': return 'fas fa-arrow-alt-circle-down';
      case 'fee': return 'fas fa-percent';
      default: return 'fas fa-receipt';
    }
  }

  getTransactionTitle(type: string): string {
    switch (type) {
      case 'earning': return 'إيراد طلب';
      case 'withdrawal': return 'سحب رصيد';
      case 'fee': return 'رسوم خدمة';
      default: return 'معاملة';
    }
  }

  getTransactionStatus(status: string): string {
    switch (status) {
      case 'completed': return 'مكتملة';
      case 'pending': return 'معلقة';
      case 'failed': return 'فاشلة';
      default: return status;
    }
  }

  filterTransactions(): void {
    let tempTransactions = [...this.transactions];

    if (this.transactionFilter !== 'all') {
      tempTransactions = tempTransactions.filter(t => t.type === this.transactionFilter);
    }

    this.filteredTransactions = tempTransactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Withdrawal methods
  getWithdrawalStatus(status: string): string {
    switch (status) {
      case 'pending': return 'معلق';
      case 'approved': return 'موافق عليه';
      case 'rejected': return 'مرفوض';
      default: return status;
    }
  }

  openWithdrawalModal(): void {
    this.showWithdrawalModal = true;
    this.withdrawalForm.reset({
      amount: '',
      bankAccount: '',
      notes: ''
    });
    // Set max amount for withdrawal based on current balance
    this.withdrawalForm.get('amount')?.setValidators([
      Validators.required,
      Validators.min(50),
      Validators.max(this.walletData.currentBalance)
    ]);
    this.withdrawalForm.get('amount')?.updateValueAndValidity();
  }

  closeWithdrawalModal(): void {
    this.showWithdrawalModal = false;
    this.withdrawalForm.reset();
  }

  calculateWithdrawalFee(): number {
    const amount = this.withdrawalForm.get('amount')?.value || 0;
    // Simulate 2% fee, minimum 5 SAR
    return Math.max(5, amount * 0.02);
  }

  calculateNetAmount(): number {
    const amount = this.withdrawalForm.get('amount')?.value || 0;
    return amount - this.calculateWithdrawalFee();
  }

  onSubmitWithdrawal(): void {
    if (this.withdrawalForm.valid) {
      this.isSubmittingWithdrawal = true;
      const withdrawalData = this.withdrawalForm.value;
      
      // Simulate API call
      setTimeout(() => {
        this.isSubmittingWithdrawal = false;
        this.closeWithdrawalModal();
        alert('تم إرسال طلب السحب بنجاح. سيتم مراجعته قريباً.');
        // Add to pending withdrawals (simulated)
        this.withdrawalRequests.unshift({
          _id: `req${this.withdrawalRequests.length + 1}`,
          requestNumber: `00${this.withdrawalRequests.length + 1}`,
          amount: withdrawalData.amount,
          status: 'pending',
          createdAt: new Date()
        });
        this.loadWalletData(); // Reload data to update balance
      }, 1500);

      // In a real application, you would call a service here:
      // this.restaurantService.requestWithdrawal(withdrawalData).subscribe({
      //   next: () => { ... },
      //   error: (error) => { ... }
      // });
    } else {
      this.markFormGroupTouched(this.withdrawalForm);
    }
  }

  cancelWithdrawal(requestId: string): void {
    if (confirm('هل أنت متأكد من إلغاء طلب السحب هذا؟')) {
      // Simulate API call
      setTimeout(() => {
        this.withdrawalRequests = this.withdrawalRequests.filter(req => req._id !== requestId);
        alert('تم إلغاء طلب السحب.');
        this.loadWalletData(); // Reload data to update balance
      }, 500);

      // In a real application, you would call a service here:
      // this.restaurantService.cancelWithdrawal(requestId).subscribe({
      //   next: () => { ... },
      //   error: (error) => { ... }
      // });
    }
  }

  exportStatement(): void {
    alert('وظيفة تصدير كشف الحساب قيد التطوير.');
  }

  loadEarningsChart(): void {
    // This function would load data for the chart based on selectedPeriod
    // and then update a charting library (e.g., Chart.js, D3.js)
    console.log(`تحميل بيانات الرسم البياني للفترة: ${this.selectedPeriod}`);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}

