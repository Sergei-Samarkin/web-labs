import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../components/AuthContext';
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
  const { login, error: authError, loading, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | undefined;

  // Handle redirect message from registration or other pages
  useEffect(() => {
    if (state?.message) {
      setFormError(state.message);
      // Clear the location state to prevent showing the message again on refresh
      window.history.replaceState({}, '');
    }
  }, [state]);

  // Clear any auth errors when component unmounts
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !password) {
      setFormError('Пожалуйста, заполните все поля');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setFormError('Пожалуйста, введите корректный email');
      return;
    }

    try {
      setFormError('');
      await login({ email, password });
      // Redirect to the protected page user tried to access or home
      const to = state?.from?.pathname || '/';
      navigate(to, { replace: true });
    } catch (error) {
      // Error is already handled by AuthContext
      console.error('Login error:', error);
    }
  };

  // Combine form errors and auth errors
  const errorMessage = formError || authError || '';

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <h1 className={styles.title}>Вход в систему</h1>
        
        {errorMessage && (
          <div className={styles.error} role="alert">
            {errorMessage}
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
              disabled={loading}
              aria-busy={loading}
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
              disabled={loading}
              aria-busy={loading}
            />
          </div>
          
          <div className={styles.actions}>
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? 'Вход...' : 'Войти'}
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
