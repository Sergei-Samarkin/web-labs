import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { login, register, logout, getCurrentUser, type User, type LoginData, type RegisterData } from '../../api/authService'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  isError: boolean
  errorMessage: string | null
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isError: false,
  errorMessage: null,
}

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginData, { rejectWithValue }) => {
    try {
      const response = await login(credentials)
      return response
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Login failed')
    }
  }
)

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: RegisterData, { rejectWithValue }) => {
    try {
      const response = await register(userData)
      return response
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Registration failed')
    }
  }
)

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await logout()
      return null
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Logout failed')
    }
  }
)

export const checkAuthStatus = createAsyncThunk(
  'auth/checkStatus',
  async (_, { rejectWithValue }) => {
    try {
      const user = getCurrentUser()
      if (user) {
        return user
      }
      return rejectWithValue('No user found')
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Auth check failed')
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.isError = false
      state.errorMessage = null
    },
    resetAuth: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.isLoading = false
      state.isError = false
      state.errorMessage = null
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true
        state.isError = false
        state.errorMessage = null
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<{ token: string; refreshToken: string; user: User }>) => {
        state.isLoading = false
        state.isAuthenticated = true
        state.user = action.payload.user
        state.token = action.payload.token
        state.isError = false
        state.errorMessage = null
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.errorMessage = action.payload as string
        state.isAuthenticated = false
        state.user = null
        state.token = null
      })

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true
        state.isError = false
        state.errorMessage = null
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<{ token: string; refreshToken: string; user: User }>) => {
        state.isLoading = false
        state.isAuthenticated = true
        state.user = action.payload.user
        state.token = action.payload.token
        state.isError = false
        state.errorMessage = null
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.errorMessage = action.payload as string
        state.isAuthenticated = false
        state.user = null
        state.token = null
      })

    // Logout
    builder
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.user = null
        state.token = null
        state.isError = false
        state.errorMessage = null
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false
        // Even if logout fails on server, clear local state
        state.isAuthenticated = false
        state.user = null
        state.token = null
        state.isError = true
        state.errorMessage = action.payload as string
      })

    // Check auth status
    builder
      .addCase(checkAuthStatus.pending, (state) => {
        state.isLoading = true
      })
      .addCase(checkAuthStatus.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false
        state.isAuthenticated = true
        state.user = action.payload
        state.isError = false
        state.errorMessage = null
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.user = null
        state.token = null
        state.isError = false
        state.errorMessage = null
      })
  },
})

export const { clearError, resetAuth } = authSlice.actions
export default authSlice.reducer
