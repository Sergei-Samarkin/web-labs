import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
import { getEvents, getMyEvents, deleteEvent } from '../../api/eventService';
import type { Event } from '../../api/eventService';
import { api } from '../../api/authService';
import { useAuth } from '../../components/AuthContext';
import styles from './Events.module.scss';
import { Button, message, Alert, App, Spin } from 'antd';
import { PlusOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import EventForm from '../../components/EventForm/index';
import EventCard from '../../components/EventCard/EventCard';

interface UserEmailCache {
  [key: number]: string;
}


export const EventsPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [userEmails, setUserEmails] = useState<UserEmailCache>({});
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const { user } = useAuth(); // Получаем информацию о текущем пользователе
  const { modal } = App.useApp(); // Используем App.useApp() для доступа к контексту
  const [actionError, setActionError] = useState<{ code: number; message: string } | null>(null);
  // const navigate = useNavigate(); // Will be used for future navigation

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

  // Update user emails cache
  const [loadingEmails, setLoadingEmails] = useState<Record<number, boolean>>({});
  
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

  const fetchEvents = async () => {
    console.log('[fetchEvents] Starting to fetch events');
    try {
      setLoading(true);
      
      // Если пользователь авторизован, показываем только его мероприятия
      // Иначе показываем все мероприятия
      console.log('[fetchEvents] User auth status:', { isAuthenticated: !!user, userId: user?.id });
      
      let data: Event[];
      if (user) {
        console.log('[fetchEvents] User is authenticated, fetching user events...');
        data = await getMyEvents();
      } else {
        console.log('[fetchEvents] User is not authenticated, fetching all events...');
        data = await getEvents();
      }
      
      console.log('[fetchEvents] Events response:', data);
      
      // Log the API instance configuration
      console.log('[fetchEvents] API base URL:', api.defaults.baseURL);
      console.log('[fetchEvents] API defaults:', {
        baseURL: api.defaults.baseURL,
        withCredentials: api.defaults.withCredentials,
        headers: api.defaults.headers
      });
      
      // Ensure we have valid data and it's an array
      if (Array.isArray(data)) {
        // Log the structure of the first event to check for creator/createdBy fields
        if (data.length > 0) {
          console.log('[fetchEvents] First event structure:', {
            id: data[0].id,
            title: data[0].title,
            createdBy: data[0].createdBy,
            creator: data[0].creator,
            allKeys: Object.keys(data[0])
          });
        }

        // Add a unique key to each event for Ant Design Table
        const eventsWithKeys = data.map(event => {
          // Try to get the creator ID from different possible fields
          const creatorId = event.createdBy || (event.creator?.id) || null;
          
          return {
            ...event,
            key: event.id,
            createdBy: creatorId // Ensure createdBy is set
          };
        });
        
        console.log('Setting events with creator IDs:', eventsWithKeys.map(e => ({
          id: e.id,
          title: e.title,
          createdBy: e.createdBy,
          creator: e.creator
        })));
        
        setEvents(eventsWithKeys);
        
        console.log('[fetchEvents] Events set successfully');
      } else {
        console.error('Expected array but got:', data);
        setEvents([]);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      message.error(`Не удалось загрузить мероприятия: ${errorMessage}`);
      console.error('Error fetching events:', error);
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
    setFilteredEvents(filterEventsByCategories(events, selectedCategories));
  }, [events, selectedCategories]);

  // Получение всех уникальных категорий
  const getAllCategories = (): string[] => {
    // Статический список всех возможных категорий в системе
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

  useEffect(() => {
    fetchEvents();
  }, [user]); // Добавляем user в зависимости чтобы перезагружать мероприятия при изменении статуса авторизации

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
      setActionError({ code: 401, message: 'Требуется авторизация для удаления мероприятия' });
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
          await deleteEvent(id);
          message.success('Мероприятие успешно удалено');
          fetchEvents();
          setActionError(null); // Сбрасываем ошибку при успехе
        } catch (error: any) {
          console.error('Error deleting event:', error);
          
          // Обрабатываем разные типы ошибок
          if (error.response) {
            const { status, data } = error.response;
            setActionError({ 
              code: status, 
              message: data.message || 'Не удалось удалить мероприятие' 
            });
          } else if (error.request) {
            setActionError({ 
              code: 0, 
              message: 'Ошибка сети. Проверьте подключение к интернету' 
            });
          } else {
            setActionError({ 
              code: 500, 
              message: 'Внутренняя ошибка приложения' 
            });
          }
        }
      },
    });
  };

  const handleEdit = (event: Event) => {
    // Проверяем авторизацию пользователя
    if (!user) {
      setActionError({ code: 401, message: 'Требуется авторизация для редактирования мероприятия' });
      return;
    }

    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    // Проверяем авторизацию пользователя
    if (!user) {
      setActionError({ code: 401, message: 'Требуется авторизация для создания мероприятия' });
      return;
    }

    setEditingEvent(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  const handleSubmitSuccess = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
    fetchEvents();
  };


  return (
    <div className={styles.eventsContainer}>
      {/* Отображение ошибок действий */}
      {actionError && (
        <Alert
          message={`Ошибка ${actionError.code}`}
          description={actionError.message}
          type="error"
          closable
          onClose={() => setActionError(null)}
          style={{ marginBottom: 16 }}
        />
      )}

      <div className={styles.header}>
        <h1>
          {user ? 'Мои мероприятия' : 'Все мероприятия'}
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
              marginLeft: '-0.75rem',
              marginRight: '-0.75rem',
              alignItems: 'stretch'
            }}
          >
            {filteredEvents.map(event => (
              <div
                key={event.id}
                style={{
                  flex: '0 0 calc(25% - 1.5rem)',
                  minWidth: '270px',
                  paddingLeft: '0.75rem',
                  paddingRight: '0.75rem',
                  paddingTop: '0.75rem',
                  paddingBottom: '0.75rem',
                  marginBottom: '1.5rem',
                  boxSizing: 'border-box'
                }}
              >
                <EventCard
                  event={event}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  userEmail={event.createdBy ? userEmails[event.createdBy] : undefined}
                  isLoadingEmail={event.createdBy ? loadingEmails[event.createdBy] : false}
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
        event={editingEvent}
      />
    </div>
  );
};

export default EventsPage;
