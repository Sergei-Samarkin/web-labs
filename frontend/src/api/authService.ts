import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
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

export interface User {
  id: string;
  username: string;
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
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginData {
  email: string;
  password: string;
};

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    
    // If 401 error and not a refresh token request
    if (error.response?.status === 401 && originalRequest && !originalRequest.url?.includes('refresh-token') && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const { token } = await refreshToken();
        if (token && originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch (e) {
        // If token refresh fails, clear auth and redirect to login
        clearAuthData();
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Получение текущего пользователя
export const getCurrentUser = (): User | null => {
  return getCurrentUserStorage<User>();
};

// Регистрация пользователя
export const register = async (userData: RegisterData): Promise<AuthResponse> => {
  try {
    const response: AxiosResponse<AuthResponse> = await api.post('/register', userData);
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
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw error;
  }
};

// Вход пользователя
export const login = async (credentials: LoginData): Promise<AuthResponse> => {
  try {
    const response: AxiosResponse<AuthResponse> = await api.post('/login', credentials);
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
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw error;
  }
};

// Выход пользователя
export const logout = async (): Promise<void> => {
  try {
    await api.post('/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    clearAuthData();
  }
};

// Helper functions
const refreshToken = async (): Promise<{ token: string }> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }
  
  const response = await api.post('/refresh-token', { refreshToken });
  const { token } = response.data;
  
  if (token) {
    setTokenStorage(token);
  }
  
  return { token };
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return isUserAuthenticated();
};

export default {
  register,
  login,
  logout,
  getCurrentUser,
  isAuthenticated,
  clearAuth: clearAuthData,
};