import { apiClient } from './client';

export interface ProductListDto {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  stockQuantity: number;
  categoryName: string;
  imageUrl?: string;
  averageRating: number;
  reviewCount: number;
  isSmartDevice: boolean;
  smartProtocol?: string;
  wattageLed?: number;
  wattageOld?: number;
  isLowStock: boolean;
  isFeatured: boolean;
}

export interface ProductDetailDto extends ProductListDto {
  description: string;
  shortDescription?: string;
  sku: string;
  brand?: string;
  imageUrls: string[];
  specifications: Record<string, string>;
  socketType?: string;
  bulbType?: string;
  colorTemperature?: number;
  luminousFlux?: number;
  cri?: number;
  isDimmable: boolean;
  standbyWattage?: number;
  smartHomeCategory?: string;
}

export interface ProductFilterParams {
  page?: number;
  pageSize?: number;
  search?: string;
  categoryId?: string;
  sortBy?: string;
  sortDirection?: string;
  minPrice?: number;
  maxPrice?: number;
  protocol?: string;
  isSmartDevice?: boolean;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const productsApi = {
  getProducts: (filter: ProductFilterParams = {}): Promise<PagedResult<ProductListDto>> => {
    const params = new URLSearchParams();
    if (filter.page) params.set('page', String(filter.page));
    if (filter.pageSize) params.set('pageSize', String(filter.pageSize));
    if (filter.search) params.set('search', filter.search);
    if (filter.categoryId) params.set('categoryId', filter.categoryId);
    if (filter.sortBy) params.set('sortBy', filter.sortBy);
    if (filter.sortDirection) params.set('sortDirection', filter.sortDirection);
    if (filter.minPrice !== undefined) params.set('minPrice', String(filter.minPrice));
    if (filter.maxPrice !== undefined) params.set('maxPrice', String(filter.maxPrice));
    if (filter.protocol) params.set('protocol', filter.protocol);
    if (filter.isSmartDevice !== undefined) params.set('isSmartDevice', String(filter.isSmartDevice));

    const query = params.toString();
    return apiClient.get<PagedResult<ProductListDto>>(`/api/products${query ? `?${query}` : ''}`);
  },

  getById: (id: string) =>
    apiClient.get<ProductDetailDto>(`/api/products/${id}`),

  getBySlug: (slug: string) =>
    apiClient.get<ProductDetailDto>(`/api/products/slug/${slug}`),
};
