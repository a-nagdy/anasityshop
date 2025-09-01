import { CategoryService } from '@/app/services/categoryService';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { CategoryResponse, CreateCategoryRequest, UpdateCategoryRequest } from '../../types/api';
import { Category, CategoryState } from '../../types/categoryTypes';

// Helper function to transform CategoryResponse to Category
const transformCategoryResponse = (categoryResponse: CategoryResponse): Category => {
  return {
    _id: categoryResponse._id,
    name: categoryResponse.name,
    slug: categoryResponse.slug,
    description: categoryResponse.description,
    image: categoryResponse.image,
    active: categoryResponse.active,
    parent: categoryResponse.parent?._id || null,
    createdAt: categoryResponse.createdAt,
    updatedAt: categoryResponse.updatedAt,
    products: categoryResponse.productCount,
  };
};

// Helper function to transform Category to CreateCategoryRequest
const transformToCreateRequest = (categoryData: Partial<Category>): CreateCategoryRequest => {
  if (!categoryData.name) {
    throw new Error('Category name is required');
  }

  return {
    name: categoryData.name,
    description: categoryData.description,
    parent: categoryData.parent || undefined,
    image: categoryData.image,
    active: categoryData.active ?? true,
    featured: false, // Default value since local Category doesn't have this
  };
};

// Helper function to transform Category to UpdateCategoryRequest
const transformToUpdateRequest = (id: string, categoryData: Partial<Category>): UpdateCategoryRequest => {
  return {
    id,
    name: categoryData.name,
    description: categoryData.description,
    parent: categoryData.parent || undefined,
    image: categoryData.image,
    active: categoryData.active,
    featured: false, // Default value since local Category doesn't have this
  };
};

// Initial state
const initialState: CategoryState = {
  categories: [],
  currentCategory: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
};

// Get all categories
export const fetchCategories = createAsyncThunk(
  'categories/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const categoriesResponse = await CategoryService.getCategories();
      const categories = Array.isArray(categoriesResponse)
        ? categoriesResponse.map(transformCategoryResponse)
        : [];
      return { categories };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch categories';
      return rejectWithValue(errorMessage);
    }
  }
);

// Get category by ID
export const fetchCategoryById = createAsyncThunk(
  'categories/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const categoryResponse = await CategoryService.getCategory(id);
      return transformCategoryResponse(categoryResponse);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch category';
      return rejectWithValue(errorMessage);
    }
  }
);

// Create a new category
export const createCategory = createAsyncThunk(
  'categories/create',
  async (categoryData: Partial<Category>, { rejectWithValue }) => {
    try {
      const createRequest = transformToCreateRequest(categoryData);
      const categoryResponse = await CategoryService.createCategory(createRequest);
      toast.success('Category created successfully!');
      return transformCategoryResponse(categoryResponse);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create category';
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// Update a category
export const updateCategory = createAsyncThunk(
  'categories/update',
  async ({ id, data }: { id: string; data: Partial<Category> }, { rejectWithValue }) => {
    try {
      const updateRequest = transformToUpdateRequest(id, data);
      const categoryResponse = await CategoryService.updateCategory(id, updateRequest);
      toast.success('Category updated successfully!');
      return transformCategoryResponse(categoryResponse);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update category';
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// Delete a category
export const deleteCategory = createAsyncThunk(
  'categories/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await CategoryService.deleteCategory(id);
      toast.success('Category deleted successfully!');
      return id;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete category';
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
