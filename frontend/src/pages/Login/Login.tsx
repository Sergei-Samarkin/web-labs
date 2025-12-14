import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../components/AuthContext';
import { Alert } from 'antd';
import styles from './Login.module.scss';

interface LocationState {
  from?: {
    pathname: string;
  };
  message?: string;
}

interface LoginError {
  code: number;
  message: string;
}

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [loginError, setLoginError] = useState<LoginError | null>(null);
  const { login, loading, error: authError, clearError } = useAuth();
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
      // НЕ вызываем clearError() здесь, чтобы не сбрасывать состояние при размонтировании
    };
  }, []);

  // Добавляем useEffect для отслеживания изменений loginError
  useEffect(() => {
    // Отслеживаем изменения для отладки при необходимости
  }, [loginError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Предотвращаем обновление страницы
    
    // Basic validation
    if (!email || !password) {
      setFormError('Пожалуйста, заполните все поля');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError('Пожалуйста, введите корректный email');
      return;
    }

    // Очищаем предыдущие ошибки
    setFormError('');
    setLoginError(null);
    // НЕ вызываем clearError() здесь, так как это может мешать нашему состоянию

    try {
      await login({ email, password });
      // Успешный вход - только теперь выполняем навигацию
      const to = state?.from?.pathname || '/';
      navigate(to, { replace: true });
    } catch (error: any) {
      
      // Детальная обработка ошибок
      if (error.response) {
        const { status, data } = error.response;
        setLoginError({ 
          code: status, 
          message: data.message || 'Ошибка входа' 
        });
      } else if (error.request) {
        setLoginError({ 
          code: 0, 
          message: 'Ошибка сети. Проверьте подключение к интернету' 
        });
      } else {
        // Проверяем, есть ли в сообщении информация о статусе
        const message = error.message || 'Внутренняя ошибка приложения';
        let code = 500;
        
        // Если ошибка содержит статус, пытаемся его извлечь
        // Проверяем сначала на 400, так как "Неверный email или пароль" - это 400 ошибка
        if (message.includes('Неверный email или пароль') || message.includes('400') || message.includes('Bad Request')) {
          code = 400;
        } else if (message.includes('401') || message.includes('Unauthorized')) {
          code = 401;
        } else if (message.includes('403') || message.includes('Forbidden')) {
          code = 403;
        } else if (message.includes('404') || message.includes('Not Found')) {
          code = 404;
        } else if (message.includes('500') || message.includes('Internal Server Error')) {
          code = 500;
        }
        
        const errorData = { code, message };
        setLoginError(errorData);
      }
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <h1 className={styles.title}>Вход в систему</h1>
        
        {/* Отображение ошибок - сначала проверяем loginError, потом authError */}
        {loginError && (
          <Alert
            message={`Ошибка ${loginError.code}`}
            description={loginError.message}
            type="error"
            closable
            onClose={() => setLoginError(null)}
            style={{ marginBottom: 16 }}
          />
        )}
        
        {/* Используем authError как запасной вариант */}
        {!loginError && authError && (
          <Alert
            message="Ошибка входа"
            description={authError}
            type="error"
            closable
            onClose={() => clearError()}
            style={{ marginBottom: 16 }}
          />
        )}
        
        {/* Отображение других ошибок формы */}
        {formError && !loginError && !authError && (
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
