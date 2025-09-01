import { ErrorCode } from '../../utils/errorHandler';

// Base API Response Types
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    timestamp: string;
    requestId?: string;
}

export interface ApiErrorResponse {
    success: false;
    error: {
        code: ErrorCode;
        message: string;
        details?: Record<string, unknown>;
        statusCode: number;
        timestamp: string;
        requestId?: string;
        stack?: string;
    };
    timestamp: string;
    requestId?: string;
}

export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: PaginationMeta;
}

// Product API Types
export interface ProductFilters {
    category?: string;
    search?: string;
    featured?: boolean;
    bestseller?: boolean;
    new?: boolean;
    sale?: boolean;
    status?: 'active' | 'inactive' | 'draft' | 'out_of_stock';
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    productIds?: string[];
}

export interface ProductSortOptions {
    price?: 1 | -1;
    createdAt?: 1 | -1;
    name?: 1 | -1;
    sold?: 1 | -1;
    featured?: 1 | -1;
}

export interface CreateProductRequest {
    name: string;
    description: string;
    price: number;
    category: string;
    quantity: number;
    sku?: string;
    discountPrice?: number;
    weight?: string;
    dimensions?: string;
    material?: string;
    warranty?: string;
    featured?: boolean;
    active?: boolean;
    images?: string[];
    color?: string;
    size?: string;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
    id: string;
}

export interface ProductResponse {
    _id: string;
    name: string;
    sku: string;
    slug: string;
    description: string;
    price: number;
    discountPrice?: number;
    finalPrice: number;
    hasDiscount: boolean;
    discountPercentage: number;
    image?: string;
    images: string[];
    category: {
        _id: string;
        name: string;
        slug: string;
    };
    status: string;
    quantity: number;
    sold: number;
    featured: boolean;
    weight?: string;
    dimensions?: string;
    material?: string;
    warranty?: string;
    ratings: number;
    totalRating: number;
    createdAt: string;
    active: boolean;
    color?: string;
    size?: string;
}

// Category API Types
export interface CategoryFilters {
    active?: boolean;
    parent?: string;
    parentOnly?: boolean;
    search?: string;
}

export interface CreateCategoryRequest {
    name: string;
    description?: string;
    parent?: string;
    image?: string;
    active?: boolean;
    featured?: boolean;
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {
    id: string;
}

export interface CategoryResponse {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    parent?: {
        _id: string;
        name: string;
        slug: string;
    };
    children: CategoryResponse[];
    image?: string;
    active: boolean;
    featured: boolean;
    productCount: number;
    createdAt: string;
    updatedAt: string;
}

// Order API Types
export interface OrderFilters {
    status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    isPaid?: boolean;
    user?: string;
    startDate?: string;
    endDate?: string;
}

export interface OrderItemRequest {
    product: string;
    quantity: number;
    price: number;
}

export interface CreateOrderRequest {
    items: OrderItemRequest[];
    shipping: {
        fullName: string;
        address: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        phone: string;
    };
    payment: {
        method: 'credit_card' | 'cash_on_delivery' | 'bank_transfer';
        cardNumber?: string;
        expiryDate?: string;
        cvv?: string;
        cardHolderName?: string;
    };
    itemsPrice: number;
    shippingPrice: number;
    taxPrice: number;
    totalPrice: number;
}

export interface UpdateOrderRequest {
    status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    isPaid?: boolean;
    paidAt?: string;
    deliveredAt?: string;
    trackingNumber?: string;
}

export interface OrderResponse {
    _id: string;
    orderNumber: string;
    user: {
        _id: string;
        name: string;
        email: string;
    };
    items: Array<{
        product: ProductResponse;
        quantity: number;
        price: number;
    }>;
    shipping: {
        fullName: string;
        address: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        phone: string;
    };
    payment: {
        method: string;
        status: string;
        details: Record<string, unknown>;
    };
    itemsPrice: number;
    shippingPrice: number;
    taxPrice: number;
    totalPrice: number;
    status: string;
    isPaid: boolean;
    paidAt?: string;
    deliveredAt?: string;
    trackingNumber?: string;
    createdAt: string;
    updatedAt: string;
}

export interface OrderTrackingResponse {
    orderNumber: string;
    status: string;
    trackingNumber?: string;
    estimatedDelivery?: string;
    currentLocation?: string;
    trackingHistory: Array<{
        status: string;
        location: string;
        timestamp: string;
        description: string;
    }>;
}

// User/Customer API Types
export interface UserFilters {
    role?: 'customer' | 'admin' | 'super_admin';
    active?: boolean;
    search?: string;
}

export interface CreateUserRequest {
    name: string;
    email: string;
    password: string;
    role?: 'customer' | 'admin';
    active?: boolean;
}

export interface UpdateUserRequest {
    name?: string;
    email?: string;
    password?: string;
    role?: 'customer' | 'admin' | 'super_admin';
    active?: boolean;
}

export interface UserResponse {
    _id: string;
    name: string;
    email: string;
    role: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    lastLogin?: string;
}

// Authentication API Types
export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    user: UserResponse;
    token: string;
    expiresIn: number;
}

// Cart API Types
export interface AddToCartRequest {
    productId: string;
    quantity: number;
}

export interface UpdateCartItemRequest {
    quantity: number;
}

export interface CartItemResponse {
    _id: string;
    product: ProductResponse;
    quantity: number;
    price: number;
    total: number;
}

export interface CartResponse {
    _id: string;
    user: string;
    items: CartItemResponse[];
    totalItems: number;
    totalPrice: number;
    createdAt: string;
    updatedAt: string;
}

// Review API Types
export interface ReviewFilters {
    product?: string;
    user?: string;
    rating?: number;
    approved?: boolean;
}

export interface CreateReviewRequest {
    product: string;
    rating: number;
    comment: string;
}

export interface UpdateReviewRequest {
    rating?: number;
    comment?: string;
    approved?: boolean;
}

export interface ReviewResponse {
    _id: string;
    product: {
        _id: string;
        name: string;
    };
    user: {
        _id: string;
        name: string;
    };
    rating: number;
    comment: string;
    approved: boolean;
    createdAt: string;
    updatedAt: string;
}

// Settings API Types
export interface WebsiteThemeSettings {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
    animation3dEnabled: boolean;
    particleEffectsEnabled: boolean;
    theme: 'light' | 'dark' | 'auto';
}

export interface HomepageSettings {
    hero: {
        title: string;
        subtitle: string;
        backgroundImage?: string;
        ctaText: string;
        ctaLink: string;
    };
    featuredCategories: string[];
    featuredProducts: string[];
    banners: Array<{
        id: string;
        title: string;
        description: string;
        image: string;
        link: string;
        active: boolean;
    }>;
}

export interface UpdateSettingsRequest {
    websiteTheme?: Partial<WebsiteThemeSettings>;
    homepage?: Partial<HomepageSettings>;
}

// Statistics API Types
export interface DashboardStats {
    totalOrders: number;
    totalRevenue: number;
    totalProducts: number;
    totalCustomers: number;
    recentOrders: OrderResponse[];
    topProducts: Array<{
        product: ProductResponse;
        totalSold: number;
        revenue: number;
    }>;
    salesChart: Array<{
        date: string;
        sales: number;
        orders: number;
    }>;
    categoryStats: Array<{
        category: CategoryResponse;
        productCount: number;
        totalSales: number;
    }>;
}

// File Upload Types
export interface FileUploadResponse {
    url: string;
    publicId: string;
    width?: number;
    height?: number;
    format: string;
    size: number;
}

export interface MultipleFileUploadResponse {
    files: FileUploadResponse[];
    errors?: Array<{
        filename: string;
        error: string;
    }>;
}

// Request Context Types
export interface RequestContext {
    user?: UserResponse;
    requestId: string;
    timestamp: string;
    ip: string;
    userAgent: string;
}

// Utility Types
export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface ApiEndpoint<TRequest = unknown, TResponse = unknown> {
    method: ApiMethod;
    path: string;
    request?: TRequest;
    response?: TResponse;
}

// Type Guards
export function isApiResponse<T>(obj: unknown): obj is ApiResponse<T> {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        'success' in obj &&
        typeof (obj as ApiResponse).success === 'boolean'
    );
}

export function isApiErrorResponse(obj: unknown): obj is ApiErrorResponse {
    return (
        isApiResponse(obj) &&
        !obj.success &&
        'error' in obj &&
        typeof obj.error === 'object'
    );
}

export function isPaginatedResponse<T>(obj: unknown): obj is PaginatedResponse<T> {
    return (
        isApiResponse(obj) &&
        'pagination' in obj &&
        typeof obj.pagination === 'object'
    );
} 