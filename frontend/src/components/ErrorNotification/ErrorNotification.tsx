import React from 'react';
import { Alert } from 'antd';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { removeNotification } from '../../features/ui/uiSlice';
import styles from './ErrorNotification.module.scss';

interface ErrorNotificationProps {
  className?: string;
  isAuthPage?: boolean;
}

const ErrorNotification: React.FC<ErrorNotificationProps> = ({ className, isAuthPage = false }) => {
  const dispatch = useAppDispatch();
  const { notifications } = useAppSelector(state => state.ui);

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className={`${styles.errorNotificationContainer} ${isAuthPage ? styles.authPage : ''} ${className || ''}`}>
      {notifications.map((notification) => (
        <Alert
          key={notification.id}
          message={notification.type === 'error' ? 'Ошибка' : 
                  notification.type === 'warning' ? 'Предупреждение' :
                  notification.type === 'success' ? 'Успешно' : 'Информация'}
          description={notification.message}
          type={notification.type}
          showIcon
          closable
          onClose={() => dispatch(removeNotification(notification.id))}
          style={{ 
            marginBottom: 8,
            animation: 'slideIn 0.3s ease-out'
          }}
        />
      ))}
    </div>
  );
};

export default ErrorNotification;
