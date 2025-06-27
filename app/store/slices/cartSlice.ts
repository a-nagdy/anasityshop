import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios, { AxiosError } from 'axios';

// Cart Item interface (matching API response structure)
export interface CartItem {
    _id?: string;
    cartItemKey: string;
    product: {
        _id: string;
        name: string;
        image: string;
        price: number;
        discountPrice?: number;
        status: string;
        quantity: number;
        slug?: string;
    };
    quantity: number;
    variants?: {
        color?: string | null;
        size?: string | null;
    };
    // Legacy fields for backward compatibility
    color?: string;
    size?: string;
    price: number;
    totalPrice: number;
}

// Cart state interface
interface CartState {
    items: CartItem[];
    isOpen: boolean;
    loading: boolean;
    updating: string | null; // Track which item is being updated
    error: string | null;
    totalItems: number;
    totalPrice: number;
    lastUpdated: string | null;
}

// Initial state
const initialState: CartState = {
    items: [],
    isOpen: false,
    loading: false,
    updating: null,
    error: null,
    totalItems: 0,
    totalPrice: 0,
    lastUpdated: null,
};

// Async thunks for cart operations

// Fetch cart from server
export const fetchCart = createAsyncThunk(
    'cart/fetchCart',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get('/api/cart');
            const cartData = response.data.data || { items: [] };
            return cartData;
        } catch (error) {
            const err = error as AxiosError<{ message: string }>;
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch cart');
        }
    }
);

// Add item to cart
export const addToCart = createAsyncThunk(
    'cart/addToCart',
    async (
        payload: {
            productId: string;
            quantity: number;
            color?: string;
            size?: string;
        },
        { rejectWithValue }
    ) => {
        try {
            const response = await axios.post('/api/cart', payload);
            return response.data.data;
        } catch (error) {
            const err = error as AxiosError<{ message: string }>;
            return rejectWithValue(err.response?.data?.message || 'Failed to add to cart');
        }
    }
);

// Update cart item quantity
export const updateCartItem = createAsyncThunk(
    'cart/updateCartItem',
    async (
        payload: { cartItemKey: string; productId: string; quantity: number; color?: string; size?: string },
        { rejectWithValue }
    ) => {
        try {
            const response = await axios.put(`/api/cart/${payload.productId}`, {
                quantity: payload.quantity,
                color: payload.color || '',
                size: payload.size || '',
            });
            return { ...response.data.data, cartItemKey: payload.cartItemKey };
        } catch (error) {
            const err = error as AxiosError<{ message: string }>;
            return rejectWithValue(err.response?.data?.message || 'Failed to update cart');
        }
    }
);

// Remove item from cart
export const removeFromCart = createAsyncThunk(
    'cart/removeFromCart',
    async (payload: { cartItemKey: string; productId: string; color?: string; size?: string }, { rejectWithValue }) => {
        try {
            const params = new URLSearchParams();
            if (payload.color) params.append('color', payload.color);
            if (payload.size) params.append('size', payload.size);

            const url = `/api/cart/${payload.productId}${params.toString() ? `?${params.toString()}` : ''}`;
            await axios.delete(url);
            return { cartItemKey: payload.cartItemKey };
        } catch (error) {
            const err = error as AxiosError<{ message: string }>;
            return rejectWithValue(err.response?.data?.message || 'Failed to remove from cart');
        }
    }
);

// Clear entire cart
export const clearCart = createAsyncThunk(
    'cart/clearCart',
    async (_, { rejectWithValue }) => {
        try {
            await axios.delete('/api/cart');
            return true;
        } catch (error) {
            const err = error as AxiosError<{ message: string }>;
            return rejectWithValue(err.response?.data?.message || 'Failed to clear cart');
        }
    }
);

// Helper function to calculate cart totals
const calculateCartTotals = (items: CartItem[]) => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + (item.totalPrice || item.price * item.quantity), 0);
    return { totalItems, totalPrice };
};

// Cart slice
const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        // UI state management
        openCart: (state) => {
            state.isOpen = true;
        },
        closeCart: (state) => {
            state.isOpen = false;
        },
        toggleCart: (state) => {
            state.isOpen = !state.isOpen;
        },
        // Clear errors
        clearError: (state) => {
            state.error = null;
        },
        // Set updating state for optimistic updates
        setUpdating: (state, action: PayloadAction<string | null>) => {
            state.updating = action.payload;
        },
        // Local state updates for immediate UI feedback
        updateLocalQuantity: (state, action: PayloadAction<{ cartItemKey: string; quantity: number }>) => {
            const { cartItemKey, quantity } = action.payload;
            const item = state.items.find(item => item.cartItemKey === cartItemKey);
            if (item) {
                item.quantity = quantity;
                item.totalPrice = quantity * (item.product.discountPrice || item.product.price);
                const totals = calculateCartTotals(state.items);
                state.totalItems = totals.totalItems;
                state.totalPrice = totals.totalPrice;
            }
        },
        // Remove item locally for immediate UI feedback
        removeLocalItem: (state, action: PayloadAction<{ cartItemKey: string }>) => {
            const { cartItemKey } = action.payload;
            state.items = state.items.filter(item => item.cartItemKey !== cartItemKey);
            const totals = calculateCartTotals(state.items);
            state.totalItems = totals.totalItems;
            state.totalPrice = totals.totalPrice;
        },
    },
    extraReducers: (builder) => {
        // Fetch cart
        builder
            .addCase(fetchCart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCart.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.items || [];
                const totals = calculateCartTotals(state.items);
                state.totalItems = totals.totalItems;
                state.totalPrice = totals.totalPrice;
                state.lastUpdated = new Date().toISOString();
            })
            .addCase(fetchCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Add to cart
        builder
            .addCase(addToCart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addToCart.fulfilled, (state, action) => {
                state.loading = false;
                // Refresh cart data after successful add
                console.log('Add to cart response:', action.payload);
                if (action.payload?.items) {
                    state.items = action.payload.items;
                    const totals = calculateCartTotals(state.items);
                    state.totalItems = totals.totalItems;
                    state.totalPrice = totals.totalPrice;
                }
                state.lastUpdated = new Date().toISOString();
            })
            .addCase(addToCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Update cart item
        builder
            .addCase(updateCartItem.pending, (state) => {
                state.error = null;
            })
            .addCase(updateCartItem.fulfilled, (state, action) => {
                state.updating = null;
                // Update with server response
                if (action.payload?.items) {
                    state.items = action.payload.items;
                    const totals = calculateCartTotals(state.items);
                    state.totalItems = totals.totalItems;
                    state.totalPrice = totals.totalPrice;
                }
                state.lastUpdated = new Date().toISOString();
            })
            .addCase(updateCartItem.rejected, (state, action) => {
                state.updating = null;
                state.error = action.payload as string;
                // Optionally revert optimistic update here
            });

        // Remove from cart
        builder
            .addCase(removeFromCart.pending, (state) => {
                state.error = null;
            })
            .addCase(removeFromCart.fulfilled, (state, action) => {
                state.updating = null;
                // Remove item from state using cart item key
                const { cartItemKey } = action.payload;
                state.items = state.items.filter(item => item.cartItemKey !== cartItemKey);
                const totals = calculateCartTotals(state.items);
                state.totalItems = totals.totalItems;
                state.totalPrice = totals.totalPrice;
                state.lastUpdated = new Date().toISOString();
            })
            .addCase(removeFromCart.rejected, (state, action) => {
                state.updating = null;
                state.error = action.payload as string;
            });

        // Clear cart
        builder
            .addCase(clearCart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(clearCart.fulfilled, (state) => {
                state.loading = false;
                state.items = [];
                state.totalItems = 0;
                state.totalPrice = 0;
                state.lastUpdated = new Date().toISOString();
            })
            .addCase(clearCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const {
    openCart,
    closeCart,
    toggleCart,
    clearError,
    setUpdating,
    updateLocalQuantity,
    removeLocalItem,
} = cartSlice.actions;

export default cartSlice.reducer; 