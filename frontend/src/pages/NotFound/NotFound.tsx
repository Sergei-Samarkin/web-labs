import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import styles from './NotFound.module.scss';

export const NotFoundPage = () => {
  useEffect(() => {
    document.title = '404 - Страница не найдена';
  }, []);

  return (
    <div className={styles.notFound}>
      <h1 className={styles.notFound__code}>404</h1>
      <h2 className={styles.notFound__title}>Страница не найдена</h2>
      <p className={styles.notFound__message}>
        Кажется, что-то пошло не так! Страница, которую вы ищете, не существует.
      </p>
      <Link to="/" className={styles.notFound__link}>
        Вернуться на главную
      </Link>
    </div>
  );
};

export default NotFoundPage;
