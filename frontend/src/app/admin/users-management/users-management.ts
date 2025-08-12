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
  selectedUsers: string[] = [];
  showUserModal: boolean = false;
  showDeleteModal: boolean = false;
  selectedUser: AdminUser | null = null;
  userToDelete: string | null = null;
  pageSize: number = 10;

  // Filters
  filters: UserFilters = {};

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;

  // Math object for template
  Math = Math;

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

  onPageSizeChange(): void {
    this.filters.limit = this.pageSize;
    this.itemsPerPage = this.pageSize;
    this.filters.page = 1;
    this.currentPage = 1;
    this.loadUsers();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedRole = '';
    this.selectedStatus = '';
    this.filters = {};
    this.currentPage = 1;
    this.loadUsers();
  }

  filterUsers(): void {
    this.filters.page = this.currentPage;
    this.filters.limit = this.itemsPerPage;
    this.loadUsers();
  }

  // Bulk selection methods
  toggleSelectAll(): void {
    if (this.isAllSelected()) {
      this.selectedUsers = [];
    } else {
      this.selectedUsers = this.filteredUsers.map(user => user.id);
    }
  }

  toggleUserSelection(userId: string): void {
    const index = this.selectedUsers.indexOf(userId);
    if (index > -1) {
      this.selectedUsers.splice(index, 1);
    } else {
      this.selectedUsers.push(userId);
    }
  }

  isAllSelected(): boolean {
    return this.filteredUsers.length > 0 && this.selectedUsers.length === this.filteredUsers.length;
  }

  bulkDelete(): void {
    if (this.selectedUsers.length === 0) return;

    if (confirm(`Are you sure you want to delete ${this.selectedUsers.length} selected users? This action cannot be undone.`)) {
      this.loading = true;
      // Implement bulk delete logic here
      console.log('Bulk deleting users:', this.selectedUsers);
      this.selectedUsers = [];
      this.loadUsers();
    }
  }

  // User details modal methods
  viewUserDetails(user: AdminUser): void {
    this.selectedUser = user;
    this.showUserModal = true;
  }

  closeUserModal(): void {
    this.showUserModal = false;
    this.selectedUser = null;
  }

  // Delete confirmation modal methods
  deleteUser(userId: string): void {
    this.userToDelete = userId;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.userToDelete = null;
  }

  confirmDelete(): void {
    if (!this.userToDelete) return;

    this.loading = true;
    this.adminService.deleteUser(this.userToDelete).subscribe({
      next: (response) => {
        if (response.success) {
          this.closeDeleteModal();
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

  getRoleClass(role: string): string {
    switch (role) {
      case 'admin':
        return 'role-badge admin';
      case 'restaurant':
      case 'restaurant_owner':
        return 'role-badge restaurant';
      case 'delivery':
        return 'role-badge delivery';
      case 'customer':
        return 'role-badge customer';
      default:
        return 'role-badge default';
    }
  }

  getRoleIcon(role: string): string {
    switch (role) {
      case 'admin':
        return 'fas fa-shield-alt';
      case 'restaurant':
      case 'restaurant_owner':
        return 'fas fa-utensils';
      case 'delivery':
        return 'fas fa-motorcycle';
      case 'customer':
        return 'fas fa-user';
      default:
        return 'fas fa-user';
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

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.filters.page = page;
      this.loadUsers();
    }
  }

  getPageNumbers(): number[] {
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

  formatTime(date: string | Date): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleTimeString();
  }

  formatDateTime(date: string | Date): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString();
  }
}

