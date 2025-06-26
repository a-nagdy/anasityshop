import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios, { AxiosError } from 'axios';
import { getCookie } from 'cookies-next';

// Define user type
export type User = {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    avatar?: string;
    active: boolean;
    verified: boolean;
    isVerified: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    lastLogin?: string;
};

// Define the auth state
interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

// Initial state
const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
};

// Login thunk
export const loginUser = createAsyncThunk(
    'auth/login',
    async (credentials: { email: string; password: string }, { rejectWithValue }) => {
        try {
            const response = await axios.post(
                "/api/auth/login",
                credentials
            );

            const { user, token } = response.data.data; // Extract from data.data

            // Check if user has admin role
            if (user.role !== 'admin' && user.role !== 'super-admin') {
                return rejectWithValue('You don\'t have permission to access the admin area');
            }

            // Store token in cookies - removed since server already sets the cookie
            // setCookie('auth_token', token, {
            //     maxAge: 60 * 60 * 24 * 7, // 1 week
            //     path: '/',
            // });

            // console.log(response);
            // console.log(user);
            // console.log(token);
            // console.log(response.data);

            return { user, token };
        } catch (error) {
            const err = error as AxiosError;
            if (err.response?.status === 401) {
                return rejectWithValue('Invalid email or password');
            }
            return rejectWithValue('An error occurred. Please try again.');
        }
    }
);

interface AuthResponse {
    user: User;
    token: string;
}

// Check auth status thunk
export const checkAuthStatus = createAsyncThunk(
    'auth/check',
    async (_, { rejectWithValue }) => {
        try {
            const token = getCookie('auth_token');

            if (!token) {
                return rejectWithValue('No token found');
            }

            // In a real implementation, you would make an API call to validate the token
            // For now, we'll just simulate it

            const response = await axios.get(
                "/api/auth/me",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // Extract user from response
            const user = response.data.user;

            return { user, token } as AuthResponse;
        } catch (error) {
            console.error('Auth check failed:', error);
            return rejectWithValue('Authentication failed');
        }
    }
);

// Logout thunk
export const logoutUser = createAsyncThunk(
    'auth/logout',
    async () => {
        // Clear the auth token cookie
        document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        return true;
    }
);

// Create the auth slice
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearErrors: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Login cases
        builder
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.error = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = false;
                state.error = action.payload as string;
            });

        // Check auth status cases
        builder
            .addCase(checkAuthStatus.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(checkAuthStatus.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.error = null;
            })
            .addCase(checkAuthStatus.rejected, (state) => {
                state.isLoading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.error = null; // Don't show error for auth check
            });

        // Logout cases
        builder
            .addCase(logoutUser.fulfilled, (state) => {
                state.isAuthenticated = false;
                state.user = null;
                state.error = null;
            });
    },
});

export const { clearErrors } = authSlice.actions;
export default authSlice.reducer; 