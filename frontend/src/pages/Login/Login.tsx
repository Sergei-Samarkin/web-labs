import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { loginUser, clearError } from '../../features/auth/authSlice';
import { addNotification } from '../../features/ui/uiSlice';
import { useClearNotificationsOnRouteChange } from '../../hooks/useClearNotificationsOnRouteChange';
import ErrorNotification from '../../components/ErrorNotification';
import styles from './Login.module.scss';

interface LocationState {
  from?: {
    pathname: string;
  };
  message?: string;
}

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector(state => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | undefined;

  // Handle redirect message from registration or other pages
  useEffect(() => {
    if (state?.message) {
      dispatch(addNotification({
        type: 'info',
        message: state.message
      }));
      // Clear the location state to prevent showing the message again on refresh
      window.history.replaceState({}, '');
    }
  }, [state, dispatch]);

  // Clear any auth errors when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Clear notifications on route change
  useClearNotificationsOnRouteChange();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Предотвращаем обновление страницы
    
    // Basic validation
    if (!email || !password) {
      dispatch(addNotification({
        type: 'error',
        message: 'Пожалуйста, заполните все поля'
      }));
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      dispatch(addNotification({
        type: 'error',
        message: 'Пожалуйста, введите корректный email'
      }));
      return;
    }

    // Очищаем предыдущие ошибки
    setFormError('');
    // НЕ вызываем clearError() здесь, так как это может мешать нашему состоянию

    try {
      await dispatch(loginUser({ email, password })).unwrap();
      // Успешный вход - только теперь выполняем навигацию
      const to = state?.from?.pathname || '/';
      navigate(to, { replace: true });
    } catch (error: any) {
      // Redux thunk возвращает ошибку как строку
      const errorMessage = error.message || error || 'Ошибка входа';
      
      dispatch(addNotification({
        type: 'error',
        message: errorMessage
      }));
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <ErrorNotification isAuthPage={true} />
        
        <h1 className={styles.title}>Вход в систему</h1>
        
        {/* Отображение других ошибок формы */}
        {formError && (
          <div className={styles.error} role="alert">
            {formError}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              placeholder="Введите ваш email"
              disabled={isLoading}
              aria-busy={isLoading}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Пароль
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder="Введите ваш пароль"
              disabled={isLoading}
              aria-busy={isLoading}
            />
          </div>
          
          <div className={styles.actions}>
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={isLoading}
              aria-busy={isLoading}
            >
              {isLoading ? 'Вход...' : 'Войти'}
            </button>
            
            <div className={styles.registerLink}>
              Нет аккаунта?{' '}
              <Link to="/register" className={styles.link}>
                Зарегистрируйтесь
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
