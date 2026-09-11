/**
 * SettleX API Client
 *
 * Centralized HTTP client for all backend communication.
 * Uses environment variable VITE_API_URL for the backend base URL.
 *
 * IMPORTANT: The frontend never makes financial decisions.
 * All state changes (release, refund, escrow) come from the backend.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class ApiClient {
  constructor() {
    this.baseUrl = BASE_URL;
  }

  getToken() {
    return localStorage.getItem('settlex_token');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // If body is FormData, remove Content-Type to let browser set boundary
    if (options.body instanceof FormData) {
      delete headers['Content-Type'];
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        // Only redirect on 401 for protected endpoints, not for login or register attempts
        const isAuthEndpoint = endpoint.includes('/auth/login') || endpoint.includes('/auth/register');
        if (!isAuthEndpoint) {
          localStorage.removeItem('settlex_token');
          localStorage.removeItem('settlex_user');
          if (typeof window !== 'undefined' && window.location.pathname !== '/login' && window.location.pathname !== '/register') {
            window.location.href = '/login';
          }
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.message ||
          (Array.isArray(errorData.errors) ? errorData.errors.join(', ') : null) ||
          `Request failed with status ${response.status}`;
        throw new ApiError(
          errorMessage,
          response.status,
          errorData
        );
      }

      // Handle 204 No Content
      if (response.status === 204) return null;

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        error.message || 'Network error — unable to reach the server',
        0,
        null
      );
    }
  }

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  patch(endpoint, body) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export const apiClient = new ApiClient();
export { ApiError };
export default apiClient;
