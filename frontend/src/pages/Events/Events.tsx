import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchEvents, deleteEventAsync } from '../../features/events/eventsSlice';
import { setEventFilters, resetEventFilters, addNotification } from '../../features/ui/uiSlice';
import { useClearNotificationsOnRouteChange } from '../../hooks/useClearNotificationsOnRouteChange';
import { api } from '../../api/authService';
import type { Event } from '../../api/eventService';
import styles from './Events.module.scss';
import { Button, message, App, Spin } from 'antd';
import { PlusOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import EventForm from '../../components/EventForm/index';
import EventCard from '../../components/EventCard/EventCard';
import ErrorNotification from '../../components/ErrorNotification';

interface UserEmailCache {
  [key: number]: string;
}


export const EventsPage = () => {
  const dispatch = useAppDispatch();
  const { events, isLoading } = useAppSelector(state => state.events);
  const { user } = useAppSelector(state => state.auth);
  const { eventFilters } = useAppSelector(state => state.ui);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [viewingEvent, setViewingEvent] = useState<Event | null>(null);
  const [userEmails, setUserEmails] = useState<UserEmailCache>({});
  const [loadingEmails, setLoadingEmails] = useState<Record<number, boolean>>({});
  const { modal } = App.useApp(); // Используем App.useApp() для доступа к контексту

  // Clear notifications on route change
  useClearNotificationsOnRouteChange();

  // Fetch user email by ID
  const fetchUserEmail = async (userId: number): Promise<string> => {
    console.log(`[fetchUserEmail] Fetching email for user ${userId}`);
    try {
      const url = `/api/users/${userId}`;
      console.log(`[fetchUserEmail] Making request to: ${url}`);
      const response = await api.get<{id: number, email: string}>(url);
      console.log(`[fetchUserEmail] Response for user ${userId}:`, response.data);
      return response.data.email;
    } catch (error) {
      console.error(`[fetchUserEmail] Error fetching user ${userId}:`, error);
      return `user_${userId}@example.com`;
    }
  };
  
  const updateUserEmails = async () => {
    console.log('[updateUserEmails] Starting to update user emails');
    console.log('[updateUserEmails] Current events:', events);
    
    // Get all non-null/undefined createdBy values
    const userIds = [...new Set(
      events
        .map(e => e.createdBy)
        .filter((id): id is number => id !== null && id !== undefined)
    )];
    
    console.log('[updateUserEmails] Found user IDs:', userIds);
    
    if (userIds.length === 0) {
      console.log('[updateUserEmails] No valid user IDs to process');
      return;
    }
    
    // Set loading state for all user IDs that we don't have emails for yet
    const newLoadingState = userIds.reduce((acc, userId) => {
      if (!userEmails[userId]) {
        acc[userId] = true;
      }
      return acc;
    }, {} as Record<number, boolean>);
    
    setLoadingEmails(prev => ({
      ...prev,
      ...newLoadingState
    }));
    
    // Only fetch emails for users we don't have in cache
    const userIdsToFetch = userIds.filter(userId => !userEmails[userId]);
    
    if (userIdsToFetch.length === 0) {
      console.log('[updateUserEmails] All emails already in cache');
      return;
    }
    
    console.log('[updateUserEmails] Fetching emails for user IDs:', userIdsToFetch);
    
    // Fetch emails in parallel
    const emailPromises = userIdsToFetch.map(async (userId) => {
      try {
        const email = await fetchUserEmail(userId);
        return { userId, email };
      } catch (error) {
        console.error(`[updateUserEmails] Error fetching email for user ${userId}:`, error);
        return { userId, email: `user_${userId}@example.com` };
      } finally {
        // Update loading state when done (whether successful or not)
        setLoadingEmails(prev => ({
          ...prev,
          [userId]: false
        }));
      }
    });
    
    try {
      // Update emails as they come in
      const results = await Promise.all(emailPromises);
      const newEmails = results.reduce((acc, { userId, email }) => ({
        ...acc,
        [userId]: email
      }), {} as UserEmailCache);
      
      console.log('[updateUserEmails] Fetched new emails:', newEmails);
      
      setUserEmails(prev => ({
        ...prev,
        ...newEmails
      }));
    } catch (error) {
      console.error('[updateUserEmails] Error in email fetching batch:', error);
    }
  };

  const fetchEventsData = async () => {
    console.log('[fetchEvents] Starting to fetch events');
    try {
      // Use Redux to fetch events
      const result = await dispatch(fetchEvents()).unwrap();
      console.log('[fetchEvents] Events fetched successfully via Redux', result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      message.error(`Не удалось загрузить мероприятия: ${errorMessage}`);
      console.error('Error fetching events:', error);
      throw error;
    }
  };

  // Фильтрация мероприятий по категориям
  const filterEventsByCategories = (eventsList: Event[], filters: typeof eventFilters) => {
    let filtered = [...eventsList]; // Create a copy to avoid mutation

    // Filter by search
    if (filters.search) {
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        (event.description && event.description.toLowerCase().includes(filters.search.toLowerCase()))
      );
    }

    // Filter by category
    if (filters.category) {
      filtered = filtered.filter(event => event.category === filters.category);
    }

    // Filter by date range
    if (filters.dateRange && filters.dateRange[0] && filters.dateRange[1]) {
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= filters.dateRange![0]! && eventDate <= filters.dateRange![1]!;
      });
    }

    // Filter by status
    const now = new Date();
    if (filters.status === 'upcoming') {
      filtered = filtered.filter(event => new Date(event.date) >= now);
    } else if (filters.status === 'past') {
      filtered = filtered.filter(event => new Date(event.date) < now);
    }

    // Sort - create another copy for sorting to avoid mutation
    const sortedFiltered = [...filtered].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      
      if (filters.sortBy === 'date') {
        return filters.sortOrder === 'asc' 
          ? dateA.getTime() - dateB.getTime()
          : dateB.getTime() - dateA.getTime();
      } else if (filters.sortBy === 'name') {
        return filters.sortOrder === 'asc'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      } else if (filters.sortBy === 'category') {
        return filters.sortOrder === 'asc'
          ? a.category.localeCompare(b.category)
          : b.category.localeCompare(a.category);
      }
      
      return 0;
    });

    return sortedFiltered;
  };

  // Обновление отфильтрованных мероприятий при изменении событий или фильтров
  useEffect(() => {
    const filtered = filterEventsByCategories(events, eventFilters);
    setFilteredEvents(filtered);
  }, [events, eventFilters]);

  // Получение всех уникальных категорий
  const getAllCategories = (): string[] => {
    // Статический список всех возможных категорий в системе
    const allSystemCategories = ['Концерт', 'Лекция', 'Выставка', 'Встреча'];
    return allSystemCategories;
  };

  // Обработка выбора категории
  const handleCategoryToggle = (category: string) => {
    const newCategory = eventFilters.category === category ? '' : category;
    dispatch(setEventFilters({ category: newCategory }));
  };

  // Очистка всех фильтров
  const clearFilters = () => {
    dispatch(resetEventFilters());
  };

  useEffect(() => {
    fetchEventsData();
  }, []); // Пустой массив зависимостей - загружаем события только при монтировании

  // Добавляем useEffect для обновления email после загрузки событий
  useEffect(() => {
    if (events.length > 0) {
      console.log('[useEffect] Events loaded, updating user emails...');
      updateUserEmails();
    }
  }, [events]); // Обновляем email при изменении событий

  const handleDelete = (id: number) => {
    // Проверяем авторизацию пользователя
    if (!user) {
      dispatch(addNotification({
        type: 'error',
        message: 'Требуется авторизация для удаления мероприятия'
      }));
      return;
    }

    modal.confirm({
      title: 'Удалить мероприятие?',
      icon: <ExclamationCircleFilled />,
      content: 'Вы уверены, что хотите удалить это мероприятие?',
      okText: 'Удалить',
      okType: 'danger',
      cancelText: 'Отмена',
      onOk: async () => {
        try {
          await dispatch(deleteEventAsync(id)).unwrap();
          message.success('Мероприятие успешно удалено');
        } catch (error: any) {
          console.error('Error deleting event:', error);
          
          // Обрабатываем разные типы ошибок
          let errorMessage = 'Не удалось удалить мероприятие';
          if (error.response) {
            const { status, data } = error.response;
            errorMessage = data.message || `Ошибка ${status}: Не удалось удалить мероприятие`;
          } else if (error.request) {
            errorMessage = 'Ошибка сети. Проверьте подключение к интернету';
          } else {
            errorMessage = 'Внутренняя ошибка приложения';
          }
          
          dispatch(addNotification({
            type: 'error',
            message: errorMessage
          }));
        }
      },
    });
  };

  const handleEdit = (event: Event) => {
    // Проверяем авторизацию пользователя
    if (!user) {
      dispatch(addNotification({
        type: 'error',
        message: 'Требуется авторизация для редактирования мероприятия'
      }));
      return;
    }

    setEditingEvent(event);
    setViewingEvent(null);
    setIsModalOpen(true);
  };

  const handleView = (event: Event) => {
    setViewingEvent(event);
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    // Проверяем авторизацию пользователя
    if (!user) {
      dispatch(addNotification({
        type: 'error',
        message: 'Требуется авторизация для создания мероприятия'
      }));
      return;
    }

    setEditingEvent(null);
    setViewingEvent(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
    setViewingEvent(null);
  };

  const handleSubmitSuccess = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
    setViewingEvent(null);
    fetchEventsData(); // This will dispatch Redux action
  };


  return (
    <div className={styles.eventsContainer}>
      <ErrorNotification />

      <div className={styles.header}>
        <h1>
          Все мероприятия
        </h1>
        <div className={styles.actions}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            Создать мероприятие
          </Button>
        </div>
      </div>

      {/* Фильтры по категориям */}
      <div className={styles.filtersContainer}>
        <div className={styles.filtersHeader}>
          <span className={styles.filtersTitle}>Фильтры по категориям:</span>
          {eventFilters.category && (
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
              type={eventFilters.category === category ? "primary" : "default"}
              size="small"
              onClick={() => handleCategoryToggle(category)}
              className={eventFilters.category === category ? styles.activeCategory : ''}
              style={{
                backgroundColor: eventFilters.category === category ? '#0d4f8c' : 'var(--card-bg)',
                borderColor: eventFilters.category === category ? '#0d4f8c' : 'var(--border-color)',
                color: eventFilters.category === category ? 'white' : '#c0c0c0',
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
      </div>

      <div className={styles.cardsContainer}>
        {isLoading ? (
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
                  userEmail={event.createdBy ? userEmails[event.createdBy] : undefined}
                  isLoadingEmail={event.createdBy ? loadingEmails[event.createdBy] : false}
                  currentUserId={user?.id ? Number(user.id) : undefined}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <EventForm
        open={isModalOpen}
        onCancel={handleModalClose}
        onSubmitSuccess={handleSubmitSuccess}
        event={editingEvent || viewingEvent}
        viewMode={!!viewingEvent}
      />
    </div>
  );
};

export default EventsPage;
