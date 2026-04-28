import { apiClient } from './client';

export interface CartItemDto {
  productId: string;
  quantity: number;
}

export interface CreateOrderDto {
  shippingFirstName: string;
  shippingLastName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingCountry: string;
  notes?: string;
  items: CartItemDto[];
}

export interface CheckoutSessionResult {
  sessionUrl: string;
  sessionId: string;
}

export interface OrderSummaryDto {
  id: string;
  createdAt: string;
  status: string;
  totalAmount: number;
  itemCount: number;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const ordersApi = {
  createCheckoutSession: (dto: CreateOrderDto) =>
    apiClient.post<CheckoutSessionResult>('/api/orders/checkout', dto),

  getMyOrders: (page = 1, pageSize = 10) =>
    apiClient.get<PagedResult<OrderSummaryDto>>(`/api/orders?page=${page}&pageSize=${pageSize}`),

  getOrderById: (id: string) =>
    apiClient.get<OrderSummaryDto>(`/api/orders/${id}`),
};
