import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register, type RegisterData } from '../../api/authService';
import styles from './Register.module.scss';
import { Loader2 } from 'lucide-react';

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Имя пользователя обязательно';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Имя пользователя должно содержать не менее 3 символов';
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
    
    setIsSubmitting(true);
    setErrors({});
    
    try {
      const registerData: RegisterData = {
        username: formData.username,
        email: formData.email,
        password: formData.password
      };
      
      await register(registerData);
      
      // Handle successful registration
      navigate('/login', { 
        state: { 
          registrationSuccess: true,
          message: 'Регистрация прошла успешно! Пожалуйста, войдите в свой аккаунт.'
        } 
      });
      
    } catch (error: any) {
      if (error.error) {
        setErrors({ general: error.error });
      } else if (error.errors) {
        // Handle validation errors from server
        setErrors({
          ...error.errors.reduce((acc: Record<string, string>, err: any) => {
            acc[err.param] = err.msg;
            return acc;
          }, {})
        });
      } else {
        setErrors({ general: 'Произошла ошибка при регистрации' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.registerContainer}>
      <div className={styles.registerBox}>
        <h1 className={styles.title}>Создать аккаунт</h1>
        
        {errors.general && (
          <div className={styles.error}>
            {errors.general}
          </div>
        )}
        
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="username" className={styles.label}>
              Имя пользователя
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={`${styles.input} ${errors.username ? styles.inputError : ''}`}
              disabled={isSubmitting}
              autoComplete="username"
              placeholder="Введите имя пользователя"
            />
            {errors.username && (
              <div className={styles.errorText}>{errors.username}</div>
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
              className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
              disabled={isSubmitting}
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
              className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
              disabled={isSubmitting}
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
              className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
              disabled={isSubmitting}
              autoComplete="new-password"
              placeholder="Повторите пароль"
            />
            {errors.confirmPassword && (
              <div className={styles.errorText}>{errors.confirmPassword}</div>
            )}
          </div>
          
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin h-4 w-4" />
                <span>Регистрация...</span>
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
