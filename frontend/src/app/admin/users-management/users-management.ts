import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, AdminUser, UserFilters, UsersResponse } from '../../shared/services/admin.service';

@Component({
  selector: 'app-users-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users-management.html',
  styleUrls: ['./users-management.scss']
})
export class UsersManagementComponent implements OnInit {
  users: AdminUser[] = [];
  filteredUsers: AdminUser[] = [];
  searchTerm: string = '';
  selectedRole: string = '';
  selectedStatus: string = '';
  loading: boolean = false;
  error: string = '';

  // Filters
  filters: UserFilters = {};

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;

  constructor(private adminService: AdminService) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.adminService.getAllUsers(this.filters).subscribe({
      next: (response) => {
        if (response.success) {
          // Handle the actual API response structure where data is directly an array
          this.users = response.data;

          // Check if response has meta object
          if (response.meta) {
            this.totalItems = response.meta.totalUsers;
            this.totalPages = response.meta.totalPages;
            this.currentPage = response.meta.currentPage;
          } else {
            // Fallback for simple array response
            this.totalItems = response.data.length;
            this.totalPages = 1;
            this.currentPage = 1;
          }
        }
        this.loading = false;
        this.filteredUsers = this.users;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.loading = false;
        return [];
      }
    });
  }

  onSearchChange(): void {
    this.filters.search = this.searchTerm;
    this.filters.page = 1;
    this.currentPage = 1;
    this.loadUsers();
  }

  onRoleChange(): void {
    this.filters.role = this.selectedRole ? this.selectedRole as 'customer' | 'delivery' | 'restaurant' : undefined;
    this.filters.page = 1;
    this.currentPage = 1;
    this.loadUsers();
  }

  onStatusChange(): void {
    this.filters.status = this.selectedStatus ? this.selectedStatus as 'pending' | 'active' | 'inactive' | 'verified' | 'rejected' : undefined;
    this.filters.page = 1;
    this.currentPage = 1;
    this.loadUsers();
  }

  filterUsers(): void {
    this.filters.page = this.currentPage;
    this.filters.limit = this.itemsPerPage;
    this.loadUsers();
  }

  getRoleClass(role: string): string {
    switch (role) {
      case 'admin':
        return 'badge bg-danger';
      case 'restaurant':
      case 'restaurant_owner':
        return 'badge bg-primary';
      case 'delivery':
        return 'badge bg-warning';
      case 'customer':
        return 'badge bg-success';
      default:
        return 'badge bg-secondary';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'active':
        return 'badge bg-success';
      case 'inactive':
        return 'badge bg-danger';
      case 'pending':
        return 'badge bg-warning';
      case 'verified':
        return 'badge bg-info';
      case 'rejected':
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
    }
  }

  updateUserStatus(userId: string, newStatus: string): void {
    const isActive = newStatus === 'active';
    this.loading = true;

    this.adminService.updateUserStatus(userId, {
      isActive,
      reason: isActive ? 'Status activated by admin' : 'Status deactivated by admin'
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadUsers();
        }
      },
      error: (error) => {
        console.error('Error updating user status:', error);
        this.error = 'Failed to update user status. Please try again.';
        this.loading = false;
      }
    });
  }

  deleteUser(userId: string): void {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      this.loading = true;

      this.adminService.deleteUser(userId).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadUsers();
          }
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          this.error = 'Failed to delete user. Please try again.';
          this.loading = false;
        }
      });
    }
  }

  exportUsers(): void {
    const headers = ['Name', 'Email', 'Role', 'Status', 'Created At', 'Last Login'];
    const csvContent = [
      headers.join(','),
      ...this.users.map(user => [
        `"${user.firstName} ${user.lastName}"`,
        `"${user.email}"`,
        `"${user.role}"`,
        `"${user.isActive ? 'Active' : 'Inactive'}"`,
        `"${new Date(user.createdAt).toLocaleDateString()}"`,
        `"${user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.filters.page = page;
      this.loadUsers();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.filters.page = this.currentPage;
      this.loadUsers();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.filters.page = this.currentPage;
      this.loadUsers();
    }
  }

  getPaginationPages(): number[] {
    const pages: number[] = [];
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(this.totalPages, this.currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  formatDate(date: string | Date): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  }
}

