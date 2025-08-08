export interface ApproveUserDTO {
  userId: string;
  status: 'verified' | 'rejected';
  reason?: string;
}

export interface UpdateUserStatusDTO {
  userId: string;
  isActive: boolean;
  reason?: string;
}

export interface GetUsersFilterDTO {
  role?: 'customer' | 'restaurant_owner' | 'delivery';
  status?: 'active' | 'inactive' | 'pending' | 'verified' | 'rejected';
  page?: number;
  limit?: number;
  search?: string;
}

export interface AdminDashboardStatsDTO {
  dateRange?: {
    from: string;
    to: string;
  };
}
