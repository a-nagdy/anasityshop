import { logger } from '../../utils/logger';
import { BaseService } from './baseService';

export interface UploadResponse {
    url: string;
    publicId: string;
    folder: string;
    format: string;
    bytes: number;
    width?: number;
    height?: number;
}

export interface UploadProgress {
    loaded: number;
    total: number;
    percentage: number;
}

export class UploadService extends BaseService {
    private static instance: UploadService;

    constructor() {
        super();
    }

    static getInstance(): UploadService {
        if (!UploadService.instance) {
            UploadService.instance = new UploadService();
        }
        return UploadService.instance;
    }

    /**
     * Upload a single file to Cloudinary
     */
    static async uploadFile(
        file: File,
        folder: string = 'general',
        onProgress?: (progress: UploadProgress) => void
    ): Promise<UploadResponse> {
        const service = UploadService.getInstance();

        service.validateRequired({ file, folder }, ['file', 'folder']);
        logger.business(`Uploading file: ${file.name} to folder: ${folder}`, 'UploadService', {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            folder
        });

        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);

        return service.measurePerformance(
            'uploadFile',
            () => service.uploadWithProgress<UploadResponse>(
                '/api/upload',
                formData,
                onProgress,
                {
                    context: 'UploadService.uploadFile',
                    timeout: 60000, // 60 seconds for file uploads
                }
            )
        );
    }

    /**
     * Upload multiple files to Cloudinary
     */
    static async uploadMultipleFiles(
        files: File[],
        folder: string = 'general',
        onProgress?: (fileIndex: number, progress: UploadProgress) => void
    ): Promise<UploadResponse[]> {
        logger.business(`Uploading ${files.length} files to folder: ${folder}`, 'UploadService', {
            fileCount: files.length,
            folder
        });

        const uploadPromises = files.map((file, index) =>
            UploadService.uploadFile(
                file,
                folder,
                onProgress ? (progress) => onProgress(index, progress) : undefined
            )
        );

        try {
            const results = await Promise.all(uploadPromises);
            logger.business(`Successfully uploaded ${results.length} files`, 'UploadService');
            return results;
        } catch (error) {
            logger.error('Failed to upload multiple files', 'UploadService', { fileCount: files.length }, error as Error);
            throw error;
        }
    }

    /**
     * Delete uploaded file by public ID
     */
    static async deleteFile(publicId: string): Promise<void> {
        const service = UploadService.getInstance();

        service.validateRequired({ publicId }, ['publicId']);
        logger.business(`Deleting file: ${publicId}`, 'UploadService', { publicId });

        return service.measurePerformance(
            'deleteFile',
            () => service.delete<void>(`/api/upload/${publicId}`, {
                context: 'UploadService.deleteFile',
            })
        );
    }

    /**
     * Upload with progress tracking
     */
    private async uploadWithProgress<T>(
        endpoint: string,
        formData: FormData,
        onProgress?: (progress: UploadProgress) => void,
        options: { context: string; timeout: number } = { context: 'UploadService', timeout: 30000 }
    ): Promise<T> {
        // Build the full URL properly
        const fullUrl = endpoint.startsWith('http')
            ? endpoint
            : `${window.location.origin}${endpoint}`;

        const requestId = this.generateRequestId();

        logger.apiRequest('POST', endpoint, { requestId, hasFile: true });

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            // Set timeout
            xhr.timeout = options.timeout;

            // Track upload progress
            if (onProgress) {
                xhr.upload.addEventListener('progress', (event) => {
                    if (event.lengthComputable) {
                        const progress: UploadProgress = {
                            loaded: event.loaded,
                            total: event.total,
                            percentage: Math.round((event.loaded / event.total) * 100)
                        };

                        logger.debug(`Upload progress: ${progress.percentage}%`, 'UploadService', {
                            requestId,
                            loaded: progress.loaded,
                            total: progress.total,
                            percentage: progress.percentage
                        });

                        onProgress(progress);
                    }
                });
            }

            // Handle completion
            xhr.onload = () => {
                const duration = Date.now() - Date.now(); // This would need proper timing
                logger.apiResponse('POST', endpoint, xhr.status, duration, { requestId });

                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const response = JSON.parse(xhr.responseText);

                        // Handle API response patterns (same as BaseService)
                        if (response.success && response.data) {
                            resolve(response.data as T);
                        } else if (response.url) {
                            // Direct upload response
                            resolve(response as T);
                        } else {
                            resolve(response as T);
                        }
                    } catch {
                        reject(new Error('Invalid response format'));
                    }
                } else {
                    try {
                        const errorResponse = JSON.parse(xhr.responseText);
                        reject(new Error(errorResponse.message || `Upload failed with status ${xhr.status}`));
                    } catch {
                        reject(new Error(`Upload failed with status ${xhr.status}`));
                    }
                }
            };

            // Handle errors
            xhr.onerror = () => {
                logger.error('Upload network error', 'UploadService', { requestId });
                reject(new Error('Network error during upload'));
            };

            xhr.ontimeout = () => {
                logger.error('Upload timeout', 'UploadService', { requestId, timeout: options.timeout });
                reject(new Error('Upload timeout'));
            };

            // Send request
            xhr.open('POST', fullUrl);

            // Add headers (excluding Content-Type for FormData)
            Object.entries(this.defaultHeaders).forEach(([key, value]) => {
                if (key.toLowerCase() !== 'content-type') {
                    xhr.setRequestHeader(key, value);
                }
            });

            xhr.send(formData);
        });
    }
} 