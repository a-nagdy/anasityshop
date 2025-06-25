import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { getCookie } from 'cookies-next';
import { toast } from 'react-toastify';
import { Category, CategoryState } from '../../types/categoryTypes';

// Initial state
const initialState: CategoryState = {
  categories: [],
  currentCategory: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
};

// Get all categories
export const fetchCategories = createAsyncThunk('categories/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(`/api/categories`);
    // console.log('Successfully fetched categories:', response.data);
    return response.data;
  } catch (error: unknown) {
    const errorMessage = axios.isAxiosError(error) ? error.response?.data?.message || 'Failed to fetch categories' : 'Failed to fetch categories';
    return rejectWithValue(errorMessage);
  }
});

// Get category by ID
export const fetchCategoryById = createAsyncThunk(
  'categories/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/categories/${id}`);
      return response.data;
    } catch (error: unknown) {
      const errorMessage = axios.isAxiosError(error) ? error.response?.data?.message || 'Failed to fetch category' : 'Failed to fetch category';
      return rejectWithValue(errorMessage);
    }
  }
);

// Create a new category
export const createCategory = createAsyncThunk(
  'categories/create',
  async (categoryData: Partial<Category>, { rejectWithValue }) => {
    const token = getCookie('auth_token');

    try {
      const response = await axios.post(
        `/api/categories`,
        categoryData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      toast.success('Category created successfully!');
      return response.data;
    } catch (error: unknown) {
      const errorMessage = axios.isAxiosError(error) ? error.response?.data?.message || 'Failed to create category' : 'Failed to create category';
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// Update a category
export const updateCategory = createAsyncThunk(
  'categories/update',
  async ({ id, data }: { id: string; data: Partial<Category> }, { rejectWithValue }) => {
    const token = getCookie('auth_token');

    try {
      const response = await axios.put(
        `/api/categories/${id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      toast.success('Category updated successfully!');
      return response.data;
    } catch (error: unknown) {
      const errorMessage = axios.isAxiosError(error) ? error.response?.data?.message || 'Failed to update category' : 'Failed to update category';
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// Delete a category
export const deleteCategory = createAsyncThunk(
  'categories/delete',
  async (id: string, { rejectWithValue }) => {
    const token = getCookie('auth_token');

    try {
      await axios.delete(`/api/categories/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success('Category deleted successfully!');
      return id;
    } catch (error: unknown) {
      const errorMessage = axios.isAxiosError(error) ? error.response?.data?.message || 'Failed to delete category' : 'Failed to delete category';
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// Create the slice
const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearCategoryError: (state) => {
      state.error = null;
    },
    clearCurrentCategory: (state) => {
      state.currentCategory = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all categories
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action: PayloadAction<{ categories: Category[] }>) => {
        state.isLoading = false;
        state.categories = action.payload.categories;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch category by ID
    builder
      .addCase(fetchCategoryById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategoryById.fulfilled, (state, action: PayloadAction<Category>) => {
        state.isLoading = false;
        state.currentCategory = action.payload;
      })
      .addCase(fetchCategoryById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create category
    builder
      .addCase(createCategory.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action: PayloadAction<Category>) => {
        state.isSubmitting = false;
        state.categories = [action.payload, ...state.categories];
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      });

    // Update category
    builder
      .addCase(updateCategory.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action: PayloadAction<Category>) => {
        state.isSubmitting = false;
        state.currentCategory = action.payload;
        state.categories = state.categories.map((category) =>
          category._id === action.payload._id ? action.payload : category
        );
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      });

    // Delete category
    builder
      .addCase(deleteCategory.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action: PayloadAction<string>) => {
        state.isSubmitting = false;
        state.categories = state.categories.filter((category) => category._id !== action.payload);
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCategoryError, clearCurrentCategory } = categorySlice.actions;
export default categorySlice.reducer;
