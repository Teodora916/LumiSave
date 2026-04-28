import { apiClient } from './client';

export interface ReviewDto {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  title?: string;
  comment?: string;
  createdAt: string;
  isVerifiedPurchase: boolean;
}

export interface CreateReviewDto {
  rating: number;
  title?: string;
  comment?: string;
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

export const reviewsApi = {
  getProductReviews: (productId: string, page = 1, pageSize = 10) =>
    apiClient.get<PagedResult<ReviewDto>>(
      `/api/products/${productId}/reviews?page=${page}&pageSize=${pageSize}`
    ),

  createReview: (productId: string, dto: CreateReviewDto) =>
    apiClient.post<ReviewDto>(`/api/products/${productId}/reviews`, dto),

  deleteReview: (productId: string, reviewId: string) =>
    apiClient.delete<void>(`/api/products/${productId}/reviews/${reviewId}`),
};
