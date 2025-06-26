export interface MongooseError extends Error {
    code?: number;
    keyPattern?: Record<string, string>;
    keyValue?: Record<string, string>;
    errors?: Record<string, { message: string }>;
}

export interface ValidationError extends Error {
    errors: Record<string, { message: string }>;
}

export interface FileBuffer {
    buffer: Buffer;
    mimetype: string;
    name: string;
    file: File;
}

export interface UploadResult {
    url: string;
    publicId: string;
}

export interface ProductData {
    name?: string;
    sku?: string;
    slug?: string;
    description?: string;
    price?: number;
    category?: string;
    image?: string;
    imageId?: string;
    images?: string[];
    imageIds?: string[];
    color?: string | string[];
    size?: string | string[];
    weight?: string;
    dimensions?: string;
    material?: string;
    warranty?: string;
    stock?: number;
    quantity?: number;
    active?: boolean;
    [key: string]: string | string[] | number | boolean | undefined;
    parent?: string;
    discountPrice?: number;
    sold?: number;
    featured?: boolean;
    bestseller?: boolean;
    new?: boolean;
    sale?: boolean;
    _id?: string;
    removeImages?: string[];
}

export interface CategoryData {
    name?: string;
    slug?: string;
    description?: string;
    image?: string;
    imageId?: string;
    active?: boolean;
    [key: string]: string | string[] | number | boolean | undefined;

} 