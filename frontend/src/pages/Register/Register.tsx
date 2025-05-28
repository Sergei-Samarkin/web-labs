import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../components/AuthContext';
import styles from './Register.module.scss';
import { Loader2 } from 'lucide-react';

type LocationState = {
  from?: { pathname: string };
  message?: string;
};

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export const RegisterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register: registerUser, error: authError, loading, clearError } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState('');
  const errorMessage = formError || errors.general || authError || '';

  // Handle redirect messages
  useEffect(() => {
    const state = location.state as LocationState | undefined;
    if (state?.message) {
      setFormError(state.message);
      // Clear the location state
      window.history.replaceState({}, '');
    }
  }, [location]);

  // Clear any auth errors when component unmounts
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Имя пользователя обязательно';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Имя пользователя должно содержать не менее 3 символов';
    }

    if (!formData.email) {
      newErrors.email = 'Email обязателен';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Некорректный формат email';
    }

    if (!formData.password) {
      newErrors.password = 'Пароль обязателен';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Пароль должен содержать не менее 6 символов';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors({
        ...errors,
        [name]: undefined
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setErrors({});
    setFormError('');
    
    try {
      await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      // On successful registration, the AuthContext will automatically log the user in
      // and redirect to the home page or the page they were trying to access
      const state = location.state as LocationState | undefined;
      const to = state?.from?.pathname || '/';
      navigate(to, { replace: true });
      
    } catch (error) {
      console.error('Registration failed:', error);
      // Error is already handled by AuthContext
    }
  };

  return (
    <div className={styles.registerContainer}>
      <div className={styles.registerBox}>
        <h1 className={styles.title}>Создать аккаунт</h1>
        
        {errorMessage && (
          <div className={styles.error}>
            {errorMessage}
          </div>
        )}
        
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>
              Имя пользователя
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
              className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
              aria-invalid={!!errors.name}
              aria-errormessage={errors.name ? 'name-error' : undefined}
              aria-busy={loading}
              autoComplete="name"
              placeholder="Введите имя пользователя"
            />
            {errors.name && (
              <div className={styles.errorText}>{errors.name}</div>
            )}
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
              aria-invalid={!!errors.email}
              aria-errormessage={errors.email ? 'email-error' : undefined}
              aria-busy={loading}
              autoComplete="email"
              placeholder="Введите ваш email"
            />
            {errors.email && (
              <div className={styles.errorText}>{errors.email}</div>
            )}
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Пароль
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
              aria-invalid={!!errors.password}
              aria-errormessage={errors.password ? 'password-error' : undefined}
              aria-busy={loading}
              autoComplete="new-password"
              placeholder="Введите пароль"
            />
            {errors.password && (
              <div className={styles.errorText}>{errors.password}</div>
            )}
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>
              Подтвердите пароль
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
              className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
              aria-invalid={!!errors.confirmPassword}
              aria-errormessage={errors.confirmPassword ? 'confirm-password-error' : undefined}
              aria-busy={loading}
              autoComplete="new-password"
              placeholder="Повторите пароль"
            />
            {errors.confirmPassword && (
              <div className={styles.errorText}>{errors.confirmPassword}</div>
            )}
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className={styles.submitButton}
            aria-busy={loading}
          >
            {loading ? (
              <>
                <Loader2 className={styles.spinner} />
                Регистрация...
              </>
            ) : 'Зарегистрироваться'}
          </button>
          
          <div className={styles.loginLink}>
            Уже есть аккаунт?{' '}
            <Link to="/login">
              Войти
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
