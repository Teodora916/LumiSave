import { apiClient } from './client';

export interface CartItemDto {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  imageUrl?: string;
  price: number;
  quantity: number;
  totalPrice: number;
  stockQuantity: number;
  isAvailable: boolean;
}

export interface CartDto {
  items: CartItemDto[];
  totalAmount: number;
  itemCount: number;
}

export interface AddToCartDto {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemDto {
  quantity: number;
}

export const cartApi = {
  getCart: () =>
    apiClient.get<CartDto>('/api/cart'),

  addItem: (dto: AddToCartDto) =>
    apiClient.post<CartDto>('/api/cart', dto),

  updateItem: (itemId: string, dto: UpdateCartItemDto) =>
    apiClient.put<CartDto>(`/api/cart/${itemId}`, dto),

  removeItem: (itemId: string) =>
    apiClient.delete<CartDto>(`/api/cart/${itemId}`),

  clearCart: () =>
    apiClient.delete<void>('/api/cart'),
};
