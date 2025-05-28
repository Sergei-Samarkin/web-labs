import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
import { getEvents, deleteEvent } from '../../api/eventService';
import type { Event } from '../../api/eventService';
import { api } from '../../api/authService';
import styles from './Events.module.scss';
import { Button, Table, Space, Modal, message, Tag, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleFilled, MailOutlined, LoadingOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import EventForm from '../../components/EventForm/index';

interface UserEmailCache {
  [key: number]: string;
}

const { confirm } = Modal;

export const EventsPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [userEmails, setUserEmails] = useState<UserEmailCache>({});
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
      console.log('[fetchEvents] Calling getEvents()...');
      const data = await getEvents();
      console.log('[fetchEvents] getEvents response:', data);
      
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
        // Update user emails in the background
        updateUserEmails();
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

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDelete = (id: number) => {
    confirm({
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
        } catch (error) {
          message.error('Не удалось удалить мероприятие');
          console.error('Error deleting event:', error);
        }
      },
    });
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
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

  const columns: ColumnsType<Event> = [
    {
      title: 'Название',
      dataIndex: 'title',
      key: 'title',
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: 'Описание',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Дата',
      dataIndex: 'date',
      key: 'date',
      render: (date) => new Date(date).toLocaleString(),
      sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    },
    {
      title: 'Категория',
      dataIndex: 'category',
      key: 'category',
      filters: [
        { text: 'Концерт', value: 'Концерт' },
        { text: 'Лекция', value: 'Лекция' },
        { text: 'Выставка', value: 'Выставка' },
        { text: 'Встреча', value: 'Встреча' },
      ],
      onFilter: (value, record) => record.category === value,
    },
    {
      title: 'Создатель',
      dataIndex: 'createdBy',
      key: 'creator',
      render: (createdBy?: number) => {
        if (!createdBy) return null;
        
        const isLoading = loadingEmails[createdBy] === true;
        const email = userEmails[createdBy];
        
        if (isLoading) {
          return (
            <Tag icon={<LoadingOutlined spin />} color="processing">
              Загрузка...
            </Tag>
          );
        }
        
        return (
          <Tooltip title={email}>
            <Tag icon={<MailOutlined />} color="blue">
              {email || `user_${createdBy}@example.com`}
            </Tag>
          </Tooltip>
        );
      },
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            title="Редактировать"
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
            title="Удалить"
          />
        </Space>
      ),
    },
  ];

  return (
    <div className={styles.eventsContainer}>
      <div className={styles.header}>
        <h1>Мероприятия</h1>
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

      <div className={styles.tableContainer}>
        <Table
          columns={columns}
          dataSource={events}
          rowKey={(record) => record.id.toString()}
          loading={loading}
          pagination={{ pageSize: 10 }}
          className={styles.eventsTable}
        />
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
