// Ключи для хранения данных в localStorage
const TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';

// Проверка доступности localStorage
const isClient = typeof window !== 'undefined';

// Работа с токеном доступа
export const getToken = (): string | null => {
  return isClient ? localStorage.getItem(TOKEN_KEY) : null;
};

export const setToken = (token: string): void => {
  if (isClient) {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

export const removeToken = (): void => {
  if (isClient) {
    localStorage.removeItem(TOKEN_KEY);
  }
};

// Работа с refresh токеном
export const getRefreshToken = (): string | null => {
  return isClient ? localStorage.getItem(REFRESH_TOKEN_KEY) : null;
};

export const setRefreshToken = (token: string): void => {
  if (isClient) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  }
};

export const removeRefreshToken = (): void => {
  if (isClient) {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
};

// Работа с данными пользователя
export const getUser = <T>(): T | null => {
  if (!isClient) return null;
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

export const setUser = <T>(user: T): void => {
  if (isClient) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};

export const removeUser = (): void => {
  if (isClient) {
    localStorage.removeItem(USER_KEY);
  }
};

// Очистка всех данных аутентификации
export const clearAuthData = (): void => {
  if (isClient) {
    removeToken();
    removeRefreshToken();
    removeUser();
  }
};

// Проверка аутентификации
export const isAuthenticated = (): boolean => {
  return isClient ? !!getToken() : false;
};

export default {
  getToken,
  setToken,
  removeToken,
  getRefreshToken,
  setRefreshToken,
  removeRefreshToken,
  getUser,
  setUser,
  removeUser,
  clearAuthData,
  isAuthenticated
};