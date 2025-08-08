import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, AdminUser, UserFilters } from '../../shared/services/admin.service';

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

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;

  constructor(private adminService: AdminService) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = '';

    const filters: UserFilters = {
      page: this.currentPage,
      limit: this.itemsPerPage
    };

    if (this.selectedRole) {
      filters.role = this.selectedRole as any;
    }
    if (this.selectedStatus) {
      filters.status = this.selectedStatus as any;
    }
    if (this.searchTerm.trim()) {
      filters.search = this.searchTerm.trim();
    }

    this.adminService.getAllUsers(filters).subscribe({
      next: (response) => {
        if (response.success) {
          this.users = response.data.users;
          this.filteredUsers = [...this.users];
          this.totalItems = response.data.totalUsers;
          this.totalPages = response.data.totalPages;
          this.currentPage = response.data.currentPage;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.error = 'Failed to load users. Please try again.';
        this.loading = false;
        this.users = [];
        this.filteredUsers = [];
      }
    });
  }

  onSearchChange(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  onRoleChange(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  onStatusChange(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  filterUsers(): void {
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
      this.loadUsers();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadUsers();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
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

