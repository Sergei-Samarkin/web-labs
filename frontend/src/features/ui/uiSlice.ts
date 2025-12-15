import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface EventFilters {
  search: string
  dateRange: [Date | null, Date | null] | null
  category: string
  status: 'all' | 'upcoming' | 'past'
  sortBy: 'date' | 'name' | 'category'
  sortOrder: 'asc' | 'desc'
}

interface UIState {
  sidebarOpen: boolean
  theme: 'light' | 'dark'
  language: 'en' | 'ru'
  loading: boolean
  eventFilters: EventFilters
  currentPage: number
  itemsPerPage: number
  notifications: Array<{
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    message: string
    timestamp: number
  }>
}

const initialState: UIState = {
  sidebarOpen: true,
  theme: 'light',
  language: 'ru',
  loading: false,
  eventFilters: {
    search: '',
    dateRange: null,
    category: '',
    status: 'all',
    sortBy: 'date',
    sortOrder: 'asc',
  },
  currentPage: 1,
  itemsPerPage: 12,
  notifications: [],
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload
    },
    setLanguage: (state, action: PayloadAction<'en' | 'ru'>) => {
      state.language = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setEventFilters: (state, action: PayloadAction<Partial<EventFilters>>) => {
      state.eventFilters = { ...state.eventFilters, ...action.payload }
    },
    resetEventFilters: (state) => {
      state.eventFilters = {
        search: '',
        dateRange: null,
        category: '',
        status: 'all',
        sortBy: 'date',
        sortOrder: 'asc',
      }
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload
    },
    setItemsPerPage: (state, action: PayloadAction<number>) => {
      state.itemsPerPage = action.payload
    },
    addNotification: (state, action: PayloadAction<Omit<UIState['notifications'][0], 'id' | 'timestamp'>>) => {
      const notification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: Date.now(),
      }
      state.notifications.push(notification)
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload)
    },
    clearNotifications: (state) => {
      state.notifications = []
    },
  },
})

export const {
  toggleSidebar,
  setSidebarOpen,
  setTheme,
  setLanguage,
  setLoading,
  setEventFilters,
  resetEventFilters,
  setCurrentPage,
  setItemsPerPage,
  addNotification,
  removeNotification,
  clearNotifications,
} = uiSlice.actions

export default uiSlice.reducer
