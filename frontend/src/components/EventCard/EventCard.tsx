import React from 'react';
import { Button, Tag, Tooltip, Badge } from 'antd';
import { EditOutlined, DeleteOutlined, MailOutlined, LoadingOutlined, EyeOutlined, UserAddOutlined, TeamOutlined } from '@ant-design/icons';
import type { Event } from '../../api/eventService';
import styles from './EventCard.module.scss';

interface EventCardProps {
  event: Event;
  onEdit: (event: Event) => void;
  onDelete: (id: number) => void;
  onView: (event: Event) => void;
  onParticipate?: (eventId: number) => void;
  onShowParticipants?: (eventId: number) => void;
  userEmail?: string;
  isLoadingEmail?: boolean;
  currentUserId?: number;
  participantsCount?: number;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onEdit,
  onDelete,
  onView,
  onParticipate,
  onShowParticipants,
  userEmail,
  isLoadingEmail,
  currentUserId,
  participantsCount
}) => {
  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Концерт': '#ff4d4f',
      'Лекция': '#1890ff',
      'Выставка': '#52c41a',
      'Встреча': '#722ed1'
    };
    return colors[category] || '#8c8c8c';
  };

  return (
    <div className={styles.eventCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.title}>{event.title}</h3>
        <Tag 
          color={getCategoryColor(event.category)}
          className={styles.category}
        >
          {event.category}
        </Tag>
      </div>
      
      <div className={styles.description}>
        {event.description}
      </div>
      
      {participantsCount !== undefined && (
        <div className={styles.participants} style={{ marginBottom: '12px' }}>
          <Badge 
            count={participantsCount} 
            showZero 
            style={{ backgroundColor: '#52c41a' }}
          >
            <Button
              type="text"
              icon={<TeamOutlined />}
              onClick={() => onShowParticipants?.(event.id)}
              size="small"
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                padding: '4px 8px',
                color: '#52c41a',
                border: '1px solid #d9d9d9'
              }}
            >
              Участники
            </Button>
          </Badge>
        </div>
      )}
      
      <div className={styles.date}>
        <strong>Дата:</strong> {formatDate(event.date)}
      </div>
      
      {event.createdBy && (
        <div className={styles.creator}>
          <strong>Создатель:</strong>
          {isLoadingEmail ? (
            <Tag icon={<LoadingOutlined spin />} color="processing">
              Загрузка...
            </Tag>
          ) : (
            <Tooltip title={userEmail}>
              <Tag icon={<MailOutlined />} color="blue">
                {userEmail || `user_${event.createdBy}@example.com`}
              </Tag>
            </Tooltip>
          )}
        </div>
      )}
      
      <div className={styles.actions}>
        {currentUserId && event.createdBy === currentUserId ? (
          <>
            <Button
              type="default"
              icon={<EditOutlined />}
              onClick={() => onEdit(event)}
              className={styles.editButton}
              size="small"
            >
              Редактировать
            </Button>
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              onClick={() => onDelete(event.id)}
              className={styles.deleteButton}
              size="small"
            >
              Удалить
            </Button>
          </>
        ) : (
          <>
            {onParticipate && currentUserId && (
              <Button
                type="primary"
                icon={<UserAddOutlined />}
                onClick={() => onParticipate(event.id)}
                className={styles.participateButton}
                size="small"
              >
                Участвовать
              </Button>
            )}
            <Button
              type="default"
              icon={<EyeOutlined />}
              onClick={() => onView(event)}
              className={styles.viewButton}
              size="small"
            >
              Просмотр
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default EventCard;
