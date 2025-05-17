// Define Category type
export type Category = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  imageId?: string;
  parent?: string | null;
  isActive: boolean;
  children?: Category[];
  createdAt?: string;
  updatedAt?: string;
  products?: number;
};

// Define the state
export interface CategoryState {
  categories: Category[];
  currentCategory: Category | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
}
export interface CategoryFormProps {
  initialData?: Partial<Category>;
  onSubmit: (formData: Partial<Category>) => void;
  isSubmitting: boolean;
  submitButtonText: string;
  parentCategories?: Category[];
}