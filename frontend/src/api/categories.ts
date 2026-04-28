import { apiClient } from './client';

export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
  productCount?: number;
}

export const categoriesApi = {
  getAll: () => apiClient.get<CategoryDto[]>('/api/categories'),
};
