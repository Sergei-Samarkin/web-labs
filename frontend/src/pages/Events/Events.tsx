import { useState, useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchEvents, deleteEventAsync, participateInEventAsync } from '../../features/events/eventsSlice';
import { getEventParticipants } from '../../api/eventService';
import { setEventFilters, resetEventFilters, addNotification } from '../../features/ui/uiSlice';
import { useClearNotificationsOnRouteChange } from '../../hooks/useClearNotificationsOnRouteChange';
import { api } from '../../api/authService';
import type { Event } from '../../api/eventService';
import styles from './Events.module.scss';
import { Button, message, App, Spin } from 'antd';
import { PlusOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import EventForm from '../../components/EventForm/index';
import EventCard from '../../components/EventCard/EventCard';
import ParticipantsModal from '../../components/ParticipantsModal/ParticipantsModal';
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
  const [participantsModalOpen, setParticipantsModalOpen] = useState<boolean>(false);
  const [participants, setParticipants] = useState<any[]>([]);
  const [participantsLoading, setParticipantsLoading] = useState<boolean>(false);
  const [participantsCounts, setParticipantsCounts] = useState<Record<number, number>>({});
  const { modal } = App.useApp(); // Используем App.useApp() для доступа к контексту

  // Clear notifications on route change
  useClearNotificationsOnRouteChange();

  // Fetch user email by ID
  const fetchUserEmail = useCallback(async (userId: number): Promise<string> => {
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
  }, []);

  // Fetch events data
  const fetchEventsData = useCallback(async () => {
    try {
      await dispatch(fetchEvents()).unwrap();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      message.error(`Не удалось загрузить мероприятия: ${errorMessage}`);
      console.error('Error fetching events:', error);
      throw error;
    }
  }, [dispatch]);

  // Update user emails
  const updateUserEmails = useCallback(async () => {
    console.log('[updateUserEmails] Starting to update user emails...');
    
    // Get unique user IDs from events
    const userIds = [...new Set(events
      .filter(event => event.createdBy)
      .map(event => event.createdBy!)
      .filter(id => id !== null && id !== undefined)
    )];

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
      }), {} as Record<number, string>);
      
      setUserEmails(prev => ({
        ...prev,
        ...newEmails
      }));
      
      console.log('[updateUserEmails] Updated emails:', newEmails);
    } catch (error) {
      console.error('[updateUserEmails] Error updating emails:', error);
    }
  }, [events, userEmails]);

  // Функция для загрузки количества участников для всех событий
  const fetchParticipantsCounts = useCallback(async () => {
    console.log('[fetchParticipantsCounts] Starting to fetch participants counts...');
    const counts: Record<number, number> = {};
    
    // Используем Promise.allSettled для обработки ошибок индивидуально
    const promises = events.map(async (event) => {
      // Пропускаем, если количество уже загружено
      if (participantsCounts[event.id] !== undefined) {
        console.log(`[fetchParticipantsCounts] Skipping event ${event.id} - already loaded: ${participantsCounts[event.id]}`);
        return { eventId: event.id, count: participantsCounts[event.id] };
      }
      
      try {
        console.log(`[fetchParticipantsCounts] Fetching participants for event ${event.id}`);
        const participantsData = await getEventParticipants(event.id);
        return { eventId: event.id, count: participantsData.length };
      } catch (error) {
        console.error(`Error fetching participants count for event ${event.id}:`, error);
        return { eventId: event.id, count: 0 };
      }
    });
    
    const results = await Promise.allSettled(promises);
    
    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        counts[result.value.eventId] = result.value.count;
      }
    });
    
    setParticipantsCounts(counts);
    console.log('[fetchParticipantsCounts] Updated participants counts:', counts);
  }, [events, participantsCounts]);

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

  // Добавляем useEffect для обновления данных после загрузки событий
  useEffect(() => {
    if (events.length > 0) {
      console.log('[useEffect] Events loaded, updating user emails and participants counts...');
      updateUserEmails();
      fetchParticipantsCounts();
    }
  }, [events.length]); // Обновляем только при изменении количества событий, а не при каждом изменении массива

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

  const handleParticipate = async (eventId: number) => {
    if (!user) {
      dispatch(addNotification({
        type: 'error',
        message: 'Требуется авторизация для участия в мероприятии'
      }));
      return;
    }

    try {
      // Сначала проверяем, участвует ли пользователь уже
      const participants = await getEventParticipants(eventId);
      const isAlreadyParticipating = participants.some(participant => participant.id === Number(user.id));
      
      if (isAlreadyParticipating) {
        dispatch(addNotification({
          type: 'error',
          message: 'Вы уже участвуете в этом мероприятии'
        }));
        return;
      }

      // Если не участвует, отправляем запрос на участие
      await dispatch(participateInEventAsync(eventId)).unwrap();
      modal.success({
        content: 'Вы успешно присоединились к мероприятию!'
      });
      
      // Обновляем счетчик участников
      setParticipantsCounts(prev => ({
        ...prev,
        [eventId]: (prev[eventId] || 0) + 1
      }));
    } catch (error: any) {
      console.error('Error participating in event:', error);
      
      let errorMessage = 'Не удалось присоединиться к мероприятию';
      if (error.response) {
        const { status, data } = error.response;
        errorMessage = data.message || `Ошибка ${status}: Не удалось присоединиться к мероприятию`;
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
  };

  const handleShowParticipants = async (eventId: number) => {
    setParticipantsModalOpen(true);
    setParticipantsLoading(true);
    
    try {
      const participantsData = await getEventParticipants(eventId);
      setParticipants(participantsData);
    } catch (error: any) {
      console.error('Error fetching participants:', error);
      message.error('Не удалось загрузить список участников');
    } finally {
      setParticipantsLoading(false);
    }
  };

  const handleCloseParticipantsModal = () => {
    setParticipantsModalOpen(false);
    setParticipants([]);
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
                  onParticipate={handleParticipate}
                  onShowParticipants={handleShowParticipants}
                  userEmail={event.createdBy ? userEmails[event.createdBy] : undefined}
                  isLoadingEmail={event.createdBy ? loadingEmails[event.createdBy] : false}
                  currentUserId={user?.id ? Number(user.id) : undefined}
                  participantsCount={participantsCounts[event.id]}
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

      <ParticipantsModal
        open={participantsModalOpen}
        onClose={handleCloseParticipantsModal}
        participants={participants}
        isLoading={participantsLoading}
      />
    </div>
  );
};

export default EventsPage;
