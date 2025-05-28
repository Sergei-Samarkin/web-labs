import { api } from './authService';

// Types
interface User {
  id: number;
  name: string;
  email: string;
}

export interface Event {
  id: number;
  title: string;
  description?: string;
  category: 'Концерт' | 'Лекция' | 'Выставка' | 'Встреча';
  date: Date;
  createdBy?: number | null;
  creator?: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEventData {
  title: string;
  description?: string;
  category: 'Концерт' | 'Лекция' | 'Выставка' | 'Встреча';
  date: Date;
}

// Using the same axios instance as authService to maintain consistency and interceptors

// Get all events
export const getEvents = async (): Promise<Event[]> => {
  console.log('getEvents: Making API call to /public');
  try {
    const response = await api.get<Event[]>('/public');
    console.log('getEvents: API response received', {
      status: response.status,
      statusText: response.statusText,
      data: response.data
    });
    
    // Ensure we always return an array, even if the response is null/undefined
    if (!response || !response.data) {
      console.error('Invalid response format:', response);
      return [];
    }
    
    const result = Array.isArray(response.data) ? response.data : [];
    console.log('getEvents: Returning', result.length, 'events');
    return result;
  } catch (error: unknown) {
    const errorInfo = {
      message: error instanceof Error ? error.message : 'Unknown error',
      response: (error as any)?.response ? {
        status: (error as any).response.status,
        data: (error as any).response.data
      } : 'No response'
    };
    console.error('Error in getEvents:', errorInfo);
    return [];
  }
};

// Get single event by ID
export const getEventById = async (id: number): Promise<Event> => {
  const response = await api.get<Event>(`/api/events/${id}`);
  return response.data;
};

// Create new event
export const createEvent = async (eventData: CreateEventData): Promise<Event> => {
  const response = await api.post<Event>('/api/events', eventData);
  return response.data;
};

// Update event
export const updateEvent = async (id: number, eventData: Partial<CreateEventData>): Promise<Event> => {
  const response = await api.put<Event>(`/api/events/${id}`, eventData);
  return response.data;
};

// Delete event
export const deleteEvent = async (id: number): Promise<void> => {
  await api.delete(`/events/${id}`);
};

export default {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};