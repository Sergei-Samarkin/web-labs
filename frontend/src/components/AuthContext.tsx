import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getCurrentUser, 
  isAuthenticated, 
  logout as authLogout, 
  login as authLogin,
  register as authRegister,
  type User,
  type LoginData,
  type RegisterData
} from '../api/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginData) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        if (isAuthenticated()) {
          const currentUser = await getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
          }
        }
      } catch (err) {
        console.error('Failed to load user:', err);
        // Clear invalid auth data
        if (err instanceof Error && err.message.includes('token')) {
          await authLogout();
        }
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Handle user login
  const login = useCallback(async (credentials: LoginData) => {
    try {
      setLoading(true);
      setError(null);
      const { user } = await authLogin(credentials);
      setUser(user);
      navigate('/');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Handle user registration
  const register = useCallback(async (userData: RegisterData) => {
    try {
      setLoading(true);
      setError(null);
      await authRegister(userData);
      // After successful registration, log the user in
      await login({ email: userData.email, password: userData.password });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [login]);

  // Handle user logout
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await authLogout();
      setUser(null);
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
      // Clear auth data even if logout API fails
      setUser(null);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Clear any auth errors
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
