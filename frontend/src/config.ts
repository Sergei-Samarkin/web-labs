// API configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Auth configuration
export const TOKEN_KEY = 'token';
export const REFRESH_TOKEN_KEY = 'refreshToken';

const config = {
  API_URL,
  TOKEN_KEY,
  REFRESH_TOKEN_KEY,
} as const;

export default config;
