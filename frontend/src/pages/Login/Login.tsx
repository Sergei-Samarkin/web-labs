import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../components/AuthContext';
import { login } from '../../api/authService';
import styles from './Login.module.scss';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login: loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Валидация
    if (!email || !password) {
      setError('Пожалуйста, заполните все поля');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Пожалуйста, введите корректный email');
      return;
    }

    try {
      setError('');
      setIsLoading(true);
      
      // Вызов API для входа
      const response = await login({ email, password });
      
      // Обновление контекста аутентификации
      loginUser(response.user);
      
      // Перенаправление на главную страницу
      navigate('/');
    } catch (error: any) {
      console.error('Ошибка входа:', error);
      setError(error.response?.data?.message || 'Не удалось войти. Пожалуйста, проверьте введенные данные.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <h1 className={styles.title}>Вход в систему</h1>
        
        {error && <div className={styles.error}>{error}</div>}
        
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
            />
          </div>
          
          <div className={styles.actions}>
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={isLoading}
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
