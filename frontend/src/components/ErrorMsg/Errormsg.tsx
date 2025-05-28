import React from 'react';
import styles from './Errormsg.module.scss';

interface ErrorMessageProps {
    message: string;
    statusCode?: number;
    onClose: () => void; // Функция для закрытия сообщения
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, statusCode, onClose }) => {
    // Не рендерим ничего, если нет сообщения
    if (!message) {
        return null;
    }

    return (
        <div className={styles.errorContainer} role="alert">
            <div className={styles.errorContent}>
                <span className={styles.errorMessage}>
                    {/* Показываем код ошибки, если он есть */}
                    {statusCode && `[${statusCode}] `} {message}
                </span>
                {/* Кнопка для закрытия сообщения */}
                <button onClick={onClose} className={styles.closeButton} aria-label="Закрыть сообщение об ошибке">&times;</button>
            </div>
        </div>
    );
};

export default ErrorMessage;