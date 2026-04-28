import { apiClient } from './client';

// ─── Request DTOs ─────────────────────────────────────────────

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
  // NOTE: items are NOT sent — backend reads from the server-side cart.
  // Call cartApi.addItem() for each local cart item before calling createCheckoutSession().
}

// ─── Response DTOs ─────────────────────────────────────────────

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
  stripeSessionId?: string;
}

export interface OrderItemDto {
  productId: string;
  productNameSnapshot: string;
  productSkuSnapshot: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productImageUrl?: string;
}

export interface StripeTransactionSummaryDto {
  paymentIntentId: string;
  amount: number;
  currency: string;
  status: string;
  receiptUrl?: string;
  isRefunded: boolean;
}

/** Full order detail including items and shipping info */
export interface OrderDetailDto extends OrderSummaryDto {
  subTotal: number;
  taxAmount: number;
  shippingCost: number;
  shippingFirstName: string;
  shippingLastName: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingCountry: string;
  shippingPhone: string;
  notes?: string;
  items: OrderItemDto[];
  stripeTransaction?: StripeTransactionSummaryDto;
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

// ─── API Functions ─────────────────────────────────────────────

export const ordersApi = {
  createCheckoutSession: (dto: CreateOrderDto) =>
    apiClient.post<CheckoutSessionResult>('/api/orders/checkout', dto),

  getMyOrders: (page = 1, pageSize = 10) =>
    apiClient.get<PagedResult<OrderSummaryDto>>(`/api/orders?page=${page}&pageSize=${pageSize}`),

  /** Returns the full OrderDetailDto with items, shipping info, and transaction data */
  getOrderById: (id: string) =>
    apiClient.get<OrderDetailDto>(`/api/orders/${id}`),
};
