const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

// Lazy import to avoid circular dependency with auth store
function getToken(): string | null {
  try {
    const stored = localStorage.getItem('lumisave-auth');
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return parsed?.state?.token ?? null;
  } catch {
    return null;
  }
}

type RequestOptions = RequestInit & {
  skipAuth?: boolean;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { skipAuth, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string> ?? {}),
  };

  if (!skipAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  let finalUrl = `${BASE_URL}${path}`;
  
  // Safety: If BASE_URL already has /api and path starts with /api, we remove the double prefix
  if (BASE_URL.endsWith('/api') && path.startsWith('/api/')) {
    finalUrl = `${BASE_URL}${path.substring(4)}`;
  }

  const response = await fetch(finalUrl, {
    ...fetchOptions,
    headers,
  });

  if (response.status === 401) {
    // Clear auth state and redirect to login
    try {
      localStorage.removeItem('lumisave-auth');
    } catch {
      // ignore
    }
    window.location.href = '/auth/login';
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    let errorMessage = `API Error: ${response.status} ${response.statusText}`;
    try {
      const errorBody = await response.json();
      errorMessage = errorBody?.message ?? errorBody?.title ?? errorMessage;
    } catch {
      // ignore
    }
    throw new Error(errorMessage);
  }

  // No content responses
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { method: 'GET', ...options }),

  post: <T>(path: string, body: unknown, options?: RequestOptions) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body), ...options }),

  put: <T>(path: string, body: unknown, options?: RequestOptions) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body), ...options }),

  patch: <T>(path: string, body: unknown, options?: RequestOptions) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body), ...options }),

  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { method: 'DELETE', ...options }),
};
