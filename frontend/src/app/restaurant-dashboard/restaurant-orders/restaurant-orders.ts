import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RestaurantService } from '../../shared/services/restaurant.service';

@Component({
  selector: 'app-restaurant-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './restaurant-orders.html',
  styleUrls: ['./restaurant-orders.scss']
})
export class RestaurantOrders implements OnInit {
  orders: any[] = [];
  filteredOrders: any[] = [];
  isLoading = true;
  activeFilter = 'all';
  searchTerm = '';
  
  showOrderModal = false;
  selectedOrder: any = null;

  constructor(private restaurantService: RestaurantService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.restaurantService.getRestaurantOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.filterOrders();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('خطأ في تحميل الطلبات:', error);
        this.isLoading = false;
      }
    });
  }

  filterOrders(): void {
    let tempOrders = [...this.orders];

    // Apply status filter
    if (this.activeFilter !== 'all') {
      tempOrders = tempOrders.filter(order => order.status === this.activeFilter);
    }

    // Apply search term filter
    if (this.searchTerm) {
      const lowerCaseSearchTerm = this.searchTerm.toLowerCase();
      tempOrders = tempOrders.filter(order =>
        order.orderNumber.toLowerCase().includes(lowerCaseSearchTerm) ||
        order.customer?.name.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    this.filteredOrders = tempOrders;
  }

  setFilter(filter: string): void {
    this.activeFilter = filter;
    this.filterOrders();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.activeFilter = 'all';
    this.filterOrders();
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'pending': return 'في الانتظار';
      case 'confirmed': return 'مؤكدة';
      case 'preparing': return 'قيد التحضير';
      case 'ready': return 'جاهزة للتوصيل';
      case 'delivered': return 'تم التوصيل';
      case 'cancelled': return 'ملغاة';
      default: return status;
    }
  }

  formatDate(dateString: string): string {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('ar-SA', options);
  }

  getTotalOrders(): number {
    return this.orders.length;
  }

  getPendingOrders(): number {
    return this.orders.filter(order => order.status === 'pending').length;
  }

  getOrdersByStatus(status: string): any[] {
    return this.orders.filter(order => order.status === status);
  }

  updateOrderStatus(orderId: string, newStatus: string): void {
    this.restaurantService.updateOrderStatus(orderId, newStatus).subscribe({
      next: () => {
        this.loadOrders(); // Reload orders to reflect changes
        alert(`تم تحديث حالة الطلب إلى ${this.getStatusText(newStatus)}`);
      },
      error: (error) => {
        console.error('خطأ في تحديث حالة الطلب:', error);
        alert('حدث خطأ أثناء تحديث حالة الطلب');
      }
    });
  }

  cancelOrder(orderId: string): void {
    if (confirm('هل أنت متأكد من إلغاء هذا الطلب؟')) {
      this.restaurantService.updateOrderStatus(orderId, 'cancelled').subscribe({
        next: () => {
          this.loadOrders();
          alert('تم إلغاء الطلب بنجاح');
        },
        error: (error) => {
          console.error('خطأ في إلغاء الطلب:', error);
          alert('حدث خطأ أثناء إلغاء الطلب');
        }
      });
    }
  }

  viewOrderDetails(order: any): void {
    this.selectedOrder = order;
    this.showOrderModal = true;
  }

  closeOrderModal(): void {
    this.showOrderModal = false;
    this.selectedOrder = null;
  }

  getNextStatusText(currentStatus: string): string {
    switch (currentStatus) {
      case 'pending': return 'تأكيد الطلب';
      case 'confirmed': return 'بدء التحضير';
      case 'preparing': return 'جاهز للتوصيل';
      case 'ready': return 'تم التوصيل';
      default: return '';
    }
  }

  getNextStatusIcon(currentStatus: string): string {
    switch (currentStatus) {
      case 'pending': return 'fas fa-check';
      case 'confirmed': return 'fas fa-utensils';
      case 'preparing': return 'fas fa-check-circle';
      case 'ready': return 'fas fa-truck';
      default: return '';
    }
  }

  getNextStatusAction(order: any): void {
    let nextStatus: string;
    switch (order.status) {
      case 'pending': nextStatus = 'confirmed'; break;
      case 'confirmed': nextStatus = 'preparing'; break;
      case 'preparing': nextStatus = 'ready'; break;
      case 'ready': nextStatus = 'delivered'; break;
      default: return;
    }
    this.updateOrderStatus(order._id, nextStatus);
  }
}

