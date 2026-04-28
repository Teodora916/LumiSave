import { apiClient } from './client';

// --- Users ---

export interface UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  orderCount: number;
  totalSpentRsd: number;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// --- Transactions ---

export interface TransactionStatsDto {
  totalRevenue: number;
  totalTransactions: number;
  successfulTransactions: number;
  refundedAmount: number;
  averageOrderValue: number;
  totalEnergySavedKwh: number;
}

export interface TransactionDto {
  id: string;
  orderId: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  isRefunded: boolean;
  receiptUrl?: string;
}

export interface TransactionFilterDto {
  page?: number;
  pageSize?: number;
  status?: string;
  from?: string;
  to?: string;
}

export interface RefundRequestDto {
  reason?: string;
  amount?: number;
}

// --- Reports ---

export interface SalesDataPointDto {
  period: string;
  totalRevenue: number;
  orderCount: number;
  averageOrderValue: number;
}

export interface TopProductDto {
  productId: string;
  productName: string;
  unitsSold: number;
  revenue: number;
}

export interface SalesByCategoryDto {
  categoryName: string;
  unitsSold: number;
  revenue: number;
  revenuePercent: number;
}

export interface SalesReportDto {
  dataPoints: SalesDataPointDto[];
  totalRevenue: number;
  totalOrders: number;
  topProducts: TopProductDto[];
  salesByCategory: SalesByCategoryDto[];
}

// --- Settings ---

export interface SystemSettingDto {
  id: string;
  key: string;
  value: string;
  type: string;
  description?: string;
}

export interface OrderSummaryDto {
  id: string;
  createdAt: string;
  status: string;
  totalAmount: number;
  itemCount: number;
}

export interface ProductDto {
  id: string;
  name: string;
  slug: string;
  price: number;
  stockQuantity: number;
  categoryId?: string;
  isSmartDevice: boolean;
  isActive: boolean;
}

// --- API Functions ---

export const adminApi = {
  // Users
  getUsers: (page = 1, pageSize = 20, search?: string) => {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (search) params.set('search', search);
    return apiClient.get<PagedResult<UserDto>>(`/api/admin/users?${params}`);
  },

  getUserById: (id: string) =>
    apiClient.get<UserDto>(`/api/admin/users/${id}`),

  toggleUserActive: (id: string) =>
    apiClient.patch<UserDto>(`/api/admin/users/${id}/toggle`, {}),

  updateUserRole: (id: string, role: string) =>
    apiClient.patch<UserDto>(`/api/admin/users/${id}/role`, { role }),

  // Transactions
  getTransactions: (filter: TransactionFilterDto = {}) => {
    const params = new URLSearchParams();
    if (filter.page) params.set('page', String(filter.page));
    if (filter.pageSize) params.set('pageSize', String(filter.pageSize));
    if (filter.status) params.set('status', filter.status);
    if (filter.from) params.set('from', filter.from);
    if (filter.to) params.set('to', filter.to);
    return apiClient.get<PagedResult<TransactionDto>>(`/api/admin/transactions?${params}`);
  },

  getTransactionStats: () =>
    apiClient.get<TransactionStatsDto>('/api/admin/transactions/stats'),

  refundTransaction: (id: string, dto: RefundRequestDto) =>
    apiClient.post<TransactionDto>(`/api/admin/transactions/${id}/refund`, dto),

  // Reports
  getSalesReport: (from: string, to: string, groupBy: 'day' | 'week' | 'month' = 'day') =>
    apiClient.get<SalesReportDto>(
      `/api/admin/reports/sales?from=${from}&to=${to}&groupBy=${groupBy}`
    ),

  // Settings
  getSettings: () => apiClient.get<SystemSettingDto[]>('/api/admin/settings'),
  updateSetting: (id: string, value: string) =>
    apiClient.put<SystemSettingDto>(`/api/admin/settings/${id}`, { value }),

  // Orders
  getOrders: (page = 1, pageSize = 20, status?: string) => {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (status) params.set('status', status);
    return apiClient.get<PagedResult<OrderSummaryDto>>(`/api/orders/admin/all?${params}`);
  },
  updateOrderStatus: (id: string, status: string) =>
    apiClient.patch<OrderSummaryDto>(`/api/orders/admin/${id}/status`, { status }),

  // Products
  getProducts: (page = 1, pageSize = 50, search?: string) => {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (search) params.set('search', search);
    return apiClient.get<PagedResult<ProductDto>>(`/api/products?${params}`);
  },
  createProduct: (data: Partial<ProductDto>) =>
    apiClient.post<ProductDto>('/api/products', data),
  updateProduct: (id: string, data: Partial<ProductDto>) =>
    apiClient.put<ProductDto>(`/api/products/${id}`, data),
  deleteProduct: (id: string) =>
    apiClient.delete(`/api/products/${id}`),
  updateStock: (id: string, quantityChange: number) =>
    apiClient.patch(`/api/products/${id}/stock`, { quantityChange }),
};
