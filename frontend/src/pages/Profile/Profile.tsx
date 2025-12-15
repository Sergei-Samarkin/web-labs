import { useAppSelector } from '../../app/hooks';
import { useState, useEffect } from 'react';
import { Button, message, Alert, App, Spin } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import EventForm from '../../components/EventForm/index';
import EventCard from '../../components/EventCard/EventCard';
import { getMyEvents, deleteEvent, type Event } from '../../api/eventService';
import { ExclamationCircleFilled } from '@ant-design/icons';
import styles from './Profile.module.scss';

export const ProfilePage = () => {
  const { user } = useAppSelector(state => state.auth);
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const { modal } = App.useApp();
  const [actionError, setActionError] = useState<{ code: number; message: string } | null>(null);

  // Fetch user events
  const fetchUserEvents = async () => {
    if (!user) return;
    
    console.log('[fetchUserEvents] Starting to fetch user events');
    setLoading(true);
    setActionError(null);
    
    try {
      const data = await getMyEvents();
      console.log('[fetchUserEvents] Events response:', data);
      
      if (Array.isArray(data)) {
        const eventsWithKeys = data.map(event => ({
          ...event,
          key: event.id,
        }));
        
        // Sort events by date/time (nearest future events first, then past events) and by id as secondary key
        const sortedEvents = [...eventsWithKeys].sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          const now = new Date();
          
          const isAFuture = dateA >= now;
          const isBFuture = dateB >= now;
          
          // If one event is future and the other is past, future comes first
          if (isAFuture && !isBFuture) return -1;
          if (!isAFuture && isBFuture) return 1;
          
          // If both are future, sort by ascending date (nearest first)
          if (isAFuture && isBFuture) {
            if (dateA.getTime() !== dateB.getTime()) {
              return dateA.getTime() - dateB.getTime();
            }
            return a.id - b.id;
          }
          
          // If both are past, sort by descending date (most recent past first)
          if (dateA.getTime() !== dateB.getTime()) {
            return dateB.getTime() - dateA.getTime();
          }
          
          // Secondary sort: by id (ascending)
          return a.id - b.id;
        });
        
        setEvents(sortedEvents);
        console.log('[fetchUserEvents] Events set successfully');
      } else {
        console.error('Expected array but got:', data);
        setEvents([]);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      message.error(`Не удалось загрузить мероприятия: ${errorMessage}`);
      console.error('Error fetching user events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // Фильтрация мероприятий по категориям
  const filterEventsByCategories = (eventsList: Event[], categories: string[]) => {
    if (categories.length === 0) {
      return eventsList;
    }
    return eventsList.filter(event => categories.includes(event.category));
  };

  // Обновление отфильтрованных мероприятий при изменении событий или категорий
  useEffect(() => {
    const filtered = filterEventsByCategories(events, selectedCategories);
    
    // Apply sorting to filtered events as well (create a new array to avoid mutation)
    const sortedFiltered = [...filtered].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      const now = new Date();
      
      const isAFuture = dateA >= now;
      const isBFuture = dateB >= now;
      
      // If one event is future and the other is past, future comes first
      if (isAFuture && !isBFuture) return -1;
      if (!isAFuture && isBFuture) return 1;
      
      // If both are future, sort by ascending date (nearest first)
      if (isAFuture && isBFuture) {
        if (dateA.getTime() !== dateB.getTime()) {
          return dateA.getTime() - dateB.getTime();
        }
        return a.id - b.id;
      }
      
      // If both are past, sort by descending date (most recent past first)
      if (dateA.getTime() !== dateB.getTime()) {
        return dateB.getTime() - dateA.getTime();
      }
      
      // Secondary sort: by id (ascending)
      return a.id - b.id;
    });
    
    setFilteredEvents(sortedFiltered);
  }, [events, selectedCategories]);

  // Получение всех уникальных категорий
  const getAllCategories = (): string[] => {
    const allSystemCategories = ['Концерт', 'Лекция', 'Выставка', 'Встреча'];
    return allSystemCategories;
  };

  // Обработка выбора категории
  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  // Очистка всех фильтров
  const clearFilters = () => {
    setSelectedCategories([]);
  };

  // Delete event
  const handleDelete = (id: number) => {
    modal.confirm({
      title: 'Удаление мероприятия',
      icon: <ExclamationCircleFilled />,
      content: 'Вы уверены, что хотите удалить это мероприятие?',
      okText: 'Да',
      cancelText: 'Нет',
      okType: 'danger',
      onOk: async () => {
        try {
          await deleteEvent(id);
          message.success('Мероприятие успешно удалено');
          fetchUserEvents(); // Refresh events list
        } catch (error: any) {
          console.error('Error deleting event:', error);
          if (error.response?.status === 404) {
            message.error('Мероприятие не найдено');
          } else if (error.response?.status === 403) {
            message.error('У вас нет прав для удаления этого мероприятия');
          } else {
            message.error('Не удалось удалить мероприятие');
          }
        }
      },
    });
  };

  // Edit event
  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  // Create event
  const handleCreate = () => {
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  // Modal handlers
  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  const handleView = (event: Event) => {
    // На странице профиля все мероприятия принадлежат пользователю,
    // поэтому функция просмотра не используется, но требуется для EventCard
    console.log('View event:', event);
  };

  const handleSubmitSuccess = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
    fetchUserEvents(); // Refresh events list
  };

  useEffect(() => {
    fetchUserEvents();
  }, [user]);

  if (!user) {
    return (
      <div className={styles.profileContainer}>
        <div className={styles.accessDenied}>
          <h2>Доступ запрещен</h2>
          <p>Для просмотра профиля необходимо авторизоваться</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileHeader}>
        <h1>Профиль пользователя</h1>
      </div>
      
      <div className={styles.profileContent}>
        <div className={styles.userInfo}>
          <h2>Информация о пользователе</h2>
          <div className={styles.infoBlock}>
            <p><strong>Имя:</strong> {user.email.split('@')[0]}</p>
            <p><strong>Email:</strong> {user.email}</p>
          </div>
        </div>
        
        {/* Мероприятия пользователя */}
        <div className={styles.eventsSection}>
          {actionError && (
            <Alert
              message={`Ошибка ${actionError.code}`}
              description={actionError.message}
              type="error"
              showIcon
              closable
              onClose={() => setActionError(null)}
              style={{ marginBottom: 16 }}
            />
          )}

          {/* Фильтры по категориям */}
          <div className={styles.filtersContainer}>
            <div className={styles.filtersHeader}>
              <span className={styles.filtersTitle}>Фильтры по категориям:</span>
              {selectedCategories.length > 0 && (
                <Button 
                  type="link" 
                  size="small" 
                  onClick={clearFilters}
                  className={styles.clearFilters}
                >
                  Очистить все
                </Button>
              )}
            </div>
            <div className={styles.categoryButtons}>
              {getAllCategories().map(category => (
                <Button
                  key={category}
                  type={selectedCategories.includes(category) ? "primary" : "default"}
                  size="small"
                  onClick={() => handleCategoryToggle(category)}
                  className={selectedCategories.includes(category) ? styles.activeCategory : ''}
                  style={{
                    backgroundColor: selectedCategories.includes(category) ? '#0d4f8c' : 'var(--card-bg)',
                    borderColor: selectedCategories.includes(category) ? '#0d4f8c' : 'var(--border-color)',
                    color: selectedCategories.includes(category) ? 'white' : '#c0c0c0',
                    transition: 'all 0.3s ease',
                    outline: 'none',
                    boxShadow: 'none'
                  }}
                  onMouseDown={(e) => e.currentTarget.style.outline = 'none'}
                  onBlur={(e) => e.currentTarget.style.outline = 'none'}
                >
                  {category}
                </Button>
              ))}
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
              style={{ marginTop: '1rem' }}
            >
              Создать мероприятие
            </Button>
          </div>

          <div className={styles.cardsContainer}>
            {loading ? (
              <div className={styles.loadingContainer}>
                <Spin size="large" />
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className={styles.emptyState}>
                <p>Мероприятий с выбранными категориями нет</p>
              </div>
            ) : (
              <div 
                className={styles.cardsGrid}
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '1.5rem',
                  width: '100%',
                  alignItems: 'stretch',
                  marginTop: '1.5rem'
                }}
              >
                {filteredEvents.map(event => (
                  <div
                    key={event.id}
                    style={{
                      flex: '0 0 calc(25% - 1.125rem)',
                      minWidth: '270px',
                      boxSizing: 'border-box',
                      marginBottom: '1.5rem'
                    }}
                  >
                    <EventCard
                      event={event}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onView={handleView}
                      userEmail={user.email}
                      isLoadingEmail={false}
                      currentUserId={user?.id ? Number(user.id) : undefined}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <EventForm
        open={isModalOpen}
        onCancel={handleModalClose}
        onSubmitSuccess={handleSubmitSuccess}
        event={editingEvent}
      />
    </div>
  );
};

export default ProfilePage;
