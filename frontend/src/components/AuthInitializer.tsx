import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { checkAuthStatus } from '../features/auth/authSlice';

interface AuthInitializerProps {
  children: React.ReactNode;
}

export const AuthInitializer = ({ children }: AuthInitializerProps) => {
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector(state => state.auth);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      await dispatch(checkAuthStatus());
      setIsInitialized(true);
    };

    initializeAuth();
  }, [dispatch]);

  // Показываем загрузку, пока идет инициализация
  if (!isInitialized || isLoading) {
    return <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      color: '#e0e0e0',
      fontSize: '16px'
    }}>
      Загрузка...
    </div>;
  }

  return <>{children}</>;
};

export default AuthInitializer;
