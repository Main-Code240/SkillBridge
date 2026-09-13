const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000/api'
).replace(/\/$/, '');

function getToken(): string | null {
  const possibleKeys = [
    'token',
    'accessToken',
    'access_token',
    'authToken',
    'auth_token',
    'jwt',
  ];

  for (const key of possibleKeys) {
    const value = localStorage.getItem(key);

    if (value) {
      return value;
    }
  }

  return null;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const headers = new Headers(options.headers);

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(
    `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`,
    {
      ...options,
      headers,
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        'Request failed'
    );
  }

  return data as T;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  return request<T>(path, options);
}

export const api = {
  get<T>(path: string): Promise<T> {
    return request<T>(path, {
      method: 'GET',
    });
  },

  post<T>(
    path: string,
    body?: unknown
  ): Promise<T> {
    return request<T>(path, {
      method: 'POST',
      body:
        body === undefined
          ? undefined
          : JSON.stringify(body),
    });
  },

  put<T>(
    path: string,
    body?: unknown
  ): Promise<T> {
    return request<T>(path, {
      method: 'PUT',
      body:
        body === undefined
          ? undefined
          : JSON.stringify(body),
    });
  },

  patch<T>(
    path: string,
    body?: unknown
  ): Promise<T> {
    return request<T>(path, {
      method: 'PATCH',
      body:
        body === undefined
          ? undefined
          : JSON.stringify(body),
    });
  },

  delete<T>(path: string): Promise<T> {
    return request<T>(path, {
      method: 'DELETE',
    });
  },
};