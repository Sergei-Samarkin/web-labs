// Log environment variables for debugging
console.log('Environment variables:', import.meta.env);

// API configuration
export const API_URL = ''; // Empty because we're using direct proxy routes

// Log the final API URL
console.log('Using API URL:', API_URL);

// Auth configuration
export const TOKEN_KEY = 'token';
export const REFRESH_TOKEN_KEY = 'refreshToken';

const config = {
  API_URL,
  TOKEN_KEY,
  REFRESH_TOKEN_KEY,
} as const;

export default config;
