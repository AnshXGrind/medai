/**
 * Centralized HTTP Client
 * Unified API client for all platforms with error handling and retries
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { getApiUrl, API_CONFIG } from '../config/api.config';

// Create axios instance with default configuration
const createHttpClient = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: getApiUrl(),
    timeout: API_CONFIG.TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  // Request interceptor - Add auth token if available
  instance.interceptors.request.use(
    (config) => {
      // Add auth token if available
      const token = getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Log request in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
      }
      
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor - Handle errors globally
  instance.interceptors.response.use(
    (response) => {
      // Log response in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ API Response: ${response.config.url}`, response.data);
      }
      return response;
    },
    async (error: AxiosError) => {
      // Log error in development
      if (process.env.NODE_ENV === 'development') {
        console.error(`❌ API Error: ${error.config?.url}`, error.message);
      }

      // Handle specific error cases
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        
        switch (status) {
          case 401:
            // Unauthorized - Clear auth and redirect to login
            clearAuth();
            break;
          case 403:
            // Forbidden
            console.error('Access forbidden');
            break;
          case 404:
            // Not found
            console.error('Resource not found');
            break;
          case 500:
            // Server error
            console.error('Server error occurred');
            break;
          default:
            console.error(`Error ${status}: ${error.message}`);
        }
      } else if (error.request) {
        // Request made but no response received
        console.error('Network error: No response from server');
      } else {
        // Something else happened
        console.error('Request error:', error.message);
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

// Create singleton instance
export const httpClient = createHttpClient();

// Helper function to get auth token (platform-specific implementation needed)
const getAuthToken = (): string | null => {
  // For web: localStorage
  if (typeof window !== 'undefined' && window.localStorage) {
    return localStorage.getItem('medaid_auth_token');
  }
  
  // For React Native: AsyncStorage (implement separately)
  // This is just a placeholder
  return null;
};

// Helper function to clear auth
const clearAuth = (): void => {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem('medaid_auth_token');
    localStorage.removeItem('medaid_user_data');
  }
};

// Retry logic for failed requests
export const retryRequest = async <T>(
  requestFn: () => Promise<T>,
  maxRetries: number = API_CONFIG.RETRY_ATTEMPTS,
  delay: number = API_CONFIG.RETRY_DELAY
): Promise<T> => {
  let lastError: Error | undefined;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error as Error;
      
      if (i < maxRetries - 1) {
        console.log(`Retry attempt ${i + 1}/${maxRetries}...`);
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }

  throw lastError;
};

// Generic API request methods
export const apiClient = {
  // GET request
  get: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await httpClient.get<T>(url, config);
    return response.data;
  },

  // POST request
  post: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await httpClient.post<T>(url, data, config);
    return response.data;
  },

  // PUT request
  put: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await httpClient.put<T>(url, data, config);
    return response.data;
  },

  // PATCH request
  patch: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await httpClient.patch<T>(url, data, config);
    return response.data;
  },

  // DELETE request
  delete: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await httpClient.delete<T>(url, config);
    return response.data;
  },
};

export default apiClient;
