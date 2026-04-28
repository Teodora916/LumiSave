import { apiClient } from './client';

export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface RegisterRequestDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const authApi = {
  login: (dto: LoginRequestDto) =>
    apiClient.post<AuthResponseDto>('/api/auth/login', dto, { skipAuth: true }),

  register: (dto: RegisterRequestDto) =>
    apiClient.post<AuthResponseDto>('/api/auth/register', dto, { skipAuth: true }),

  logout: () =>
    apiClient.post<void>('/api/auth/logout', {}),

  refresh: (refreshToken: string) =>
    apiClient.post<AuthResponseDto>('/api/auth/refresh', { refreshToken }, { skipAuth: true }),
};
