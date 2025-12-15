import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { getEvents, getMyEvents, createEvent, updateEvent, deleteEvent, participateInEvent, type Event, type CreateEventData } from '../../api/eventService'

interface EventsState {
  events: Event[]
  myEvents: Event[]
  isLoading: boolean
  isError: boolean
  errorMessage: string | null
  createEventLoading: boolean
  createEventError: string | null
  updateEventLoading: boolean
  updateEventError: string | null
  deleteEventLoading: boolean
  deleteEventError: string | null
  participateLoading: boolean
  participateError: string | null
}

const initialState: EventsState = {
  events: [],
  myEvents: [],
  isLoading: false,
  isError: false,
  errorMessage: null,
  createEventLoading: false,
  createEventError: null,
  updateEventLoading: false,
  updateEventError: null,
  deleteEventLoading: false,
  deleteEventError: null,
  participateLoading: false,
  participateError: null,
}

// Async thunks
export const fetchEvents = createAsyncThunk(
  'events/fetchEvents',
  async (_, { rejectWithValue }) => {
    try {
      const events = await getEvents()
      return events
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch events')
    }
  }
)

export const fetchMyEvents = createAsyncThunk(
  'events/fetchMyEvents',
  async (_, { rejectWithValue }) => {
    try {
      const events = await getMyEvents()
      return events
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch my events')
    }
  }
)

export const createEventAsync = createAsyncThunk(
  'events/createEvent',
  async (eventData: CreateEventData, { rejectWithValue }) => {
    try {
      const event = await createEvent(eventData)
      return event
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create event')
    }
  }
)

export const updateEventAsync = createAsyncThunk(
  'events/updateEvent',
  async ({ id, eventData }: { id: number; eventData: Partial<CreateEventData> }, { rejectWithValue }) => {
    try {
      const event = await updateEvent(id, eventData)
      return event
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update event')
    }
  }
)

export const deleteEventAsync = createAsyncThunk(
  'events/deleteEvent',
  async (id: number, { rejectWithValue }) => {
    try {
      await deleteEvent(id)
      return id
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete event')
    }
  }
)

export const participateInEventAsync = createAsyncThunk(
  'events/participateInEvent',
  async (eventId: number, { rejectWithValue }) => {
    try {
      await participateInEvent(eventId)
      return eventId
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to participate in event')
    }
  }
)

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    clearError: (state) => {
      state.isError = false
      state.errorMessage = null
    },
    clearCreateEventError: (state) => {
      state.createEventError = null
    },
    clearUpdateEventError: (state) => {
      state.updateEventError = null
    },
    clearDeleteEventError: (state) => {
      state.deleteEventError = null
    },
    clearParticipateError: (state) => {
      state.participateError = null
    },
    resetEvents: (state) => {
      state.events = []
      state.myEvents = []
      state.isLoading = false
      state.isError = false
      state.errorMessage = null
      state.createEventLoading = false
      state.createEventError = null
      state.updateEventLoading = false
      state.updateEventError = null
      state.deleteEventLoading = false
      state.deleteEventError = null
      state.participateLoading = false
      state.participateError = null
    },
  },
  extraReducers: (builder) => {
    // Fetch events
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.isLoading = true
        state.isError = false
        state.errorMessage = null
      })
      .addCase(fetchEvents.fulfilled, (state, action: PayloadAction<Event[]>) => {
        state.isLoading = false
        state.events = action.payload
        state.isError = false
        state.errorMessage = null
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.errorMessage = action.payload as string
      })

    // Fetch my events
    builder
      .addCase(fetchMyEvents.pending, (state) => {
        state.isLoading = true
        state.isError = false
        state.errorMessage = null
      })
      .addCase(fetchMyEvents.fulfilled, (state, action: PayloadAction<Event[]>) => {
        state.isLoading = false
        state.myEvents = action.payload
        state.isError = false
        state.errorMessage = null
      })
      .addCase(fetchMyEvents.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.errorMessage = action.payload as string
      })

    // Create event
    builder
      .addCase(createEventAsync.pending, (state) => {
        state.createEventLoading = true
        state.createEventError = null
      })
      .addCase(createEventAsync.fulfilled, (state, action: PayloadAction<Event>) => {
        state.createEventLoading = false
        state.events.push(action.payload)
        state.myEvents.push(action.payload)
        state.createEventError = null
      })
      .addCase(createEventAsync.rejected, (state, action) => {
        state.createEventLoading = false
        state.createEventError = action.payload as string
      })

    // Update event
    builder
      .addCase(updateEventAsync.pending, (state) => {
        state.updateEventLoading = true
        state.updateEventError = null
      })
      .addCase(updateEventAsync.fulfilled, (state, action: PayloadAction<Event>) => {
        state.updateEventLoading = false
        state.updateEventError = null
        
        // Update in events array
        const eventIndex = state.events.findIndex(event => event.id === action.payload.id)
        if (eventIndex !== -1) {
          state.events[eventIndex] = action.payload
        }
        
        // Update in myEvents array
        const myEventIndex = state.myEvents.findIndex(event => event.id === action.payload.id)
        if (myEventIndex !== -1) {
          state.myEvents[myEventIndex] = action.payload
        }
      })
      .addCase(updateEventAsync.rejected, (state, action) => {
        state.updateEventLoading = false
        state.updateEventError = action.payload as string
      })

    // Delete event
    builder
      .addCase(deleteEventAsync.pending, (state) => {
        state.deleteEventLoading = true
        state.deleteEventError = null
      })
      .addCase(deleteEventAsync.fulfilled, (state, action: PayloadAction<number>) => {
        state.deleteEventLoading = false
        state.deleteEventError = null
        
        // Remove from events array
        state.events = state.events.filter(event => event.id !== action.payload)
        
        // Remove from myEvents array
        state.myEvents = state.myEvents.filter(event => event.id !== action.payload)
      })
      .addCase(deleteEventAsync.rejected, (state, action) => {
        state.deleteEventLoading = false
        state.deleteEventError = action.payload as string
      })

    // Participate in event
    builder
      .addCase(participateInEventAsync.pending, (state) => {
        state.participateLoading = true
        state.participateError = null
      })
      .addCase(participateInEventAsync.fulfilled, (state, action: PayloadAction<number>) => {
        state.participateLoading = false
        state.participateError = null
        // Optionally update event to show participation
        const eventIndex = state.events.findIndex(event => event.id === action.payload)
        if (eventIndex !== -1) {
          // You could add a 'isParticipating' flag to the event interface if needed
          // For now, we just clear the loading state
        }
      })
      .addCase(participateInEventAsync.rejected, (state, action) => {
        state.participateLoading = false
        state.participateError = action.payload as string
      })
  },
})

export const {
  clearError,
  clearCreateEventError,
  clearUpdateEventError,
  clearDeleteEventError,
  clearParticipateError,
  resetEvents,
} = eventsSlice.actions

export default eventsSlice.reducer
