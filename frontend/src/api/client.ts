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
  /** Set to true to suppress the automatic error toast (use when errors are shown inline). */
  silentError?: boolean;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { skipAuth, silentError, ...fetchOptions } = options;

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

  // Safety: If BASE_URL already has /api and path starts with /api, remove the duplicate prefix
  if (BASE_URL.endsWith('/api') && path.startsWith('/api/')) {
    finalUrl = `${BASE_URL}${path.substring(4)}`;
  }

  const response = await fetch(finalUrl, {
    ...fetchOptions,
    headers,
  });

  if (response.status === 401) {
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
    let validationErrors: string[] = [];

    try {
      const errorBody = await response.json();
      // Parses backend ApiErrorResponse: { statusCode, message, errors[], timestamp }
      errorMessage = errorBody?.message ?? errorBody?.title ?? errorMessage;
      validationErrors = Array.isArray(errorBody?.errors) ? errorBody.errors : [];
    } catch {
      // JSON parse failed — keep default message
    }

    // Auto-display toast for all API errors, matching the old Axios interceptor behaviour.
    // Individual callers can pass silentError: true to suppress for inline error display.
    if (!silentError) {
      try {
        const { toast } = await import('sonner');
        if (response.status >= 500) {
          toast.error('Server greška, pokušajte ponovo kasnije.');
        } else if (validationErrors.length > 0) {
          toast.error(errorMessage, {
            description: validationErrors.join('\n'),
          });
        } else {
          toast.error(errorMessage || 'Došlo je do greške u zahtevu.');
        }
      } catch {
        // toast not available — silently continue
      }
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
