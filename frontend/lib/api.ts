import { useAuthStore } from '../store/authStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface ApiError {
  error: string;
  details?: any;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = typeof window !== 'undefined' 
      ? localStorage.getItem('accessToken') 
      : null;

    let response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    // Handle 401 - Token expired or invalid
    if (response.status === 401 && token) {
      // Try to refresh token
      const refreshToken = typeof window !== 'undefined'
        ? localStorage.getItem('refreshToken')
        : null;

      if (refreshToken) {
        try {
          const refreshResponse = await fetch(`${this.baseUrl}/api/auth/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
          });

          if (refreshResponse.ok) {
            const { accessToken } = await refreshResponse.json();
            
            // Update token in localStorage
            if (typeof window !== 'undefined') {
              localStorage.setItem('accessToken', accessToken);
            }

            // Update token in auth store
            const { updateToken } = useAuthStore.getState();
            if (updateToken) {
              updateToken(accessToken);
            }

            // Retry original request with new token
            response = await fetch(`${this.baseUrl}${endpoint}`, {
              ...options,
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
                ...options.headers,
              },
            });
          } else {
            // Refresh failed - logout user
            const { logout } = useAuthStore.getState();
            logout();
            
            // Redirect to login if in browser
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            
            throw new Error('Session expired. Please login again.');
          }
        } catch (error) {
          // Refresh failed - logout user
          const { logout } = useAuthStore.getState();
          logout();
          
          // Redirect to login if in browser
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          
          throw error;
        }
      } else {
        // No refresh token - logout and redirect
        const { logout } = useAuthStore.getState();
        logout();
        
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        
        throw new Error('Authentication required');
      }
    }

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({ 
        error: 'Unknown error' 
      }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient(API_URL);
