import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { API_URL } from '../config';
import {
  getToken,
  setToken as setTokenStorage,
  getRefreshToken,
  setRefreshToken as setRefreshTokenStorage,
  getUser as getCurrentUserStorage,
  setUser as setUserStorage,
  clearAuthData,
  isAuthenticated as isUserAuthenticated
} from '../utils/localStorageUtils';

// Create axios instance with base config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 10000, // 10 seconds timeout
});

// Log the API configuration
console.log('API base URL:', API_URL);
console.log('Axios default base URL:', axios.defaults.baseURL);

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // If 401 error and not a refresh token request
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const { token } = await refreshToken();
        if (token) {
          setTokenStorage(token);
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If token refresh fails, clear auth and redirect to login
        clearAuthData();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export interface User {
  id: string;
  name: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

type AuthResponse = {
  token: string;
  refreshToken: string;
  user: User;
};

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginData {
  email: string;
  password: string;
};

// Get current user from storage
export const getCurrentUser = (): User | null => {
  return getCurrentUserStorage<User>();
};

// User registration
export const register = async (userData: RegisterData): Promise<AuthResponse> => {
  try {
    const endpoint = '/api/auth/register';
    console.log('Sending registration request to:', endpoint);
    console.log('Registration data:', userData);
    
    const response = await api.post<AuthResponse>(endpoint, userData, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true
    });
    
    console.log('Registration response:', response);
    
    const { token, refreshToken, user } = response.data;
    
    if (token) {
      setTokenStorage(token);
    }
    if (refreshToken) {
      setRefreshTokenStorage(refreshToken);
    }
    if (user) {
      setUserStorage(user);
    }
    
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: error.config
      });
      const errorMessage = error.response?.data?.message || 'Registration failed';
      throw new Error(errorMessage);
    }
    throw new Error('An unexpected error occurred');
  }
};

// User login
export const login = async (credentials: LoginData): Promise<AuthResponse> => {
  try {
    const endpoint = '/api/auth/login';
    console.log('Sending login request to:', endpoint);
    const response = await api.post<AuthResponse>(endpoint, credentials, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true
    });
    
    console.log('Login response:', response);
    const { token, refreshToken, user } = response.data;
    
    if (token) {
      setTokenStorage(token);
    }
    if (refreshToken) {
      setRefreshTokenStorage(refreshToken);
    }
    if (user) {
      setUserStorage(user);
    }
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      throw new Error(errorMessage);
    }
    throw new Error('An unexpected error occurred');
  }
};

// User logout
export const logout = async (): Promise<void> => {
  try {
    await api.post('/api/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
    // Even if logout fails, we should clear auth data
  } finally {
    clearAuthData();
  }
};

// Refresh access token
export const refreshToken = async (): Promise<{ token: string }> => {
  try {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const endpoint = '/api/auth/refresh-token';
    const response = await api.post<{ token: string }>(endpoint, {
      refreshToken
    });

    if (response.data.token) {
      setTokenStorage(response.data.token);
    }

    return response.data;
  } catch (error) {
    clearAuthData();
    throw error;
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return isUserAuthenticated();
};

// Export the axios instance to be used by other services
export { api };

export default {
  register,
  login,
  logout,
  getCurrentUser,
  isAuthenticated,
  clearAuth: clearAuthData,
};