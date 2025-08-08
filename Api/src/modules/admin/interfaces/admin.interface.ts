export interface IAdminDashboardStats {
  users: {
    total: number;
    customers: number;
    restaurants: number;
    delivery: number;
    activeUsers: number;
    newUsersThisMonth: number;
  };
  orders: {
    total: number;
    pending: number;
    completed: number;
    cancelled: number;
    totalRevenue: number;
    averageOrderValue: number;
  };
  restaurants: {
    total: number;
    active: number;
    pending: number;
    verified: number;
    rejected: number;
  };
  delivery: {
    total: number;
    active: number;
    pending: number;
    verified: number;
    online: number;
  };
  revenue: {
    totalPlatformRevenue: number;
    monthlyRevenue: number;
    averageCommission: number;
    topRestaurants: Array<{
      id: string;
      name: string;
      revenue: number;
      orders: number;
    }>;
  };
}

export interface IUserManagement {
  users: Array<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    isActive: boolean;
    isEmailVerified: boolean;
    verificationStatus?: string;
    createdAt: Date;
    lastLogin?: Date;
  }>;
  totalUsers: number;
  totalPages: number;
  currentPage: number;
}
