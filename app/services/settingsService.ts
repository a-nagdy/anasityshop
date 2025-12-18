import { logger } from '../../utils/logger';
import { BaseService } from './baseService';
import { getServiceConfig } from './config';

// Settings Types
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

export interface HeroBanner {
    _id?: string;
    title: string;
    subtitle: string;
    backgroundImage?: string;
    ctaText?: string;
    ctaLink?: string;
    active: boolean;
    order?: number;
    showButton?: boolean;
    showSecondaryButton?: boolean;
}

export interface Banner {
    _id?: string;
    title: string;
    subtitle?: string;
    description?: string;
    image: string;
    ctaText?: string;
    ctaLink?: string;
    active: boolean;
    order: number;
    layout: 'full-width' | 'split' | 'grid';
}

export interface CategorySlider {
    title: string;
    subtitle?: string;
    categories: string[];
    active: boolean;
}

export interface ProductSlider {
    title: string;
    subtitle?: string;
    products: string[];
    type: 'featured' | 'bestseller' | 'new' | 'sale' | 'custom';
    active: boolean;
}

export interface HomepageSettings {
    heroBanners: HeroBanner[];
    categorySliders: CategorySlider[];
    productSliders: ProductSlider[];
    banners: Banner[];
    showFeaturedCategories: boolean;
    showNewArrivals: boolean;
    showBestsellers: boolean;
    backgroundColor: string;
    accentColor: string;
    animation3dEnabled: boolean;
    emailConfig?: {
        gmailUser?: string;
        gmailAppPassword?: string;
    };
}

export interface UpdateHomepageSettingsRequest {
    heroBanners?: HeroBanner[];
    categorySliders?: CategorySlider[];
    productSliders?: ProductSlider[];
    banners?: Banner[];
    showFeaturedCategories?: boolean;
    showNewArrivals?: boolean;
    showBestsellers?: boolean;
    backgroundColor?: string;
    accentColor?: string;
    animation3dEnabled?: boolean;
    emailConfig?: {
        gmailUser?: string;
        gmailAppPassword?: string;
    };
}

export interface UpdateWebsiteThemeRequest {
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    backgroundColor?: string;
    textColor?: string;
    animation3dEnabled?: boolean;
    particleEffectsEnabled?: boolean;
    theme?: 'light' | 'dark' | 'auto';
}

export class SettingsService extends BaseService {
    private static instance: SettingsService;

    constructor() {
        super(getServiceConfig('settings'));
    }

    static getInstance(): SettingsService {
        if (!SettingsService.instance) {
            SettingsService.instance = new SettingsService();
        }
        return SettingsService.instance;
    }

    /**
     * Get homepage settings
     */
    static async getHomepageSettings(): Promise<HomepageSettings> {
        const service = SettingsService.getInstance();

        logger.business('Fetching homepage settings', 'SettingsService');

        return service.measurePerformance(
            'getHomepageSettings',
            () => service.get<HomepageSettings>('/settings/homepage', undefined, {
                context: 'SettingsService.getHomepageSettings',
            })
        );
    }

    /**
     * Update homepage settings
     */
    static async updateHomepageSettings(data: UpdateHomepageSettingsRequest): Promise<HomepageSettings> {
        const service = SettingsService.getInstance();

        const sanitizedData = service.sanitizeData(data as unknown as Record<string, unknown>);
        logger.business('Updating homepage settings', 'SettingsService', {
            updateFields: Object.keys(data)
        });

        return service.measurePerformance(
            'updateHomepageSettings',
            () => service.put<HomepageSettings>('/settings/homepage', sanitizedData, {
                context: 'SettingsService.updateHomepageSettings',
            })
        );
    }

    /**
     * Get website theme settings
     */
    static async getWebsiteTheme(): Promise<WebsiteThemeSettings> {
        const service = SettingsService.getInstance();

        logger.business('Fetching website theme settings', 'SettingsService');

        return service.measurePerformance(
            'getWebsiteTheme',
            () => service.get<WebsiteThemeSettings>('/settings/website-theme', undefined, {
                context: 'SettingsService.getWebsiteTheme',
            })
        );
    }

    /**
     * Update website theme settings
     */
    static async updateWebsiteTheme(data: UpdateWebsiteThemeRequest): Promise<WebsiteThemeSettings> {
        const service = SettingsService.getInstance();

        const sanitizedData = service.sanitizeData(data as unknown as Record<string, unknown>);
        logger.business('Updating website theme settings', 'SettingsService', {
            updateFields: Object.keys(data)
        });

        return service.measurePerformance(
            'updateWebsiteTheme',
            () => service.put<WebsiteThemeSettings>('/settings/website-theme', sanitizedData, {
                context: 'SettingsService.updateWebsiteTheme',
            })
        );
    }

    /**
     * Get all settings (combined)
     */
    static async getAllSettings(): Promise<{
        homepage: HomepageSettings;
        theme: WebsiteThemeSettings;
    }> {
        logger.business('Fetching all settings', 'SettingsService');

        const [homepage, theme] = await Promise.all([
            SettingsService.getHomepageSettings(),
            SettingsService.getWebsiteTheme(),
        ]);

        return { homepage, theme };
    }

    /**
     * Reset homepage settings to default
     */
    static async resetHomepageSettings(): Promise<HomepageSettings> {
        const service = SettingsService.getInstance();

        logger.business('Resetting homepage settings to default', 'SettingsService');

        return service.measurePerformance(
            'resetHomepageSettings',
            () => service.delete<HomepageSettings>('/settings/homepage', {
                context: 'SettingsService.resetHomepageSettings',
            })
        );
    }

    /**
     * Reset website theme to default
     */
    static async resetWebsiteTheme(): Promise<WebsiteThemeSettings> {
        const service = SettingsService.getInstance();

        logger.business('Resetting website theme to default', 'SettingsService');

        return service.measurePerformance(
            'resetWebsiteTheme',
            () => service.delete<WebsiteThemeSettings>('/settings/website-theme', {
                context: 'SettingsService.resetWebsiteTheme',
            })
        );
    }

    /**
     * Validate homepage settings
     */
    static validateHomepageSettings(settings: UpdateHomepageSettingsRequest): {
        valid: boolean;
        errors: string[];
    } {
        const errors: string[] = [];

        // Validate hero banners
        if (settings.heroBanners) {
            settings.heroBanners.forEach((banner, index) => {
                // Title and subtitle are now optional
                // Only validate CTA consistency: if link exists, text should too
                if (banner.ctaLink?.trim() && !banner.ctaText?.trim()) {
                    errors.push(`Hero banner ${index + 1}: CTA text is required when CTA link is provided`);
                }
                if (banner.ctaText?.trim() && !banner.ctaLink?.trim()) {
                    errors.push(`Hero banner ${index + 1}: CTA link is required when CTA text is provided`);
                }
            });
        }

        // Validate promotional banners
        if (settings.banners) {
            settings.banners.forEach((banner, index) => {
                // Title is now optional
                // Only validate CTA consistency: if link exists, text should too
                if (banner.ctaLink?.trim() && !banner.ctaText?.trim()) {
                    errors.push(`Promotional banner ${index + 1}: CTA text is required when CTA link is provided`);
                }
                if (banner.ctaText?.trim() && !banner.ctaLink?.trim()) {
                    errors.push(`Promotional banner ${index + 1}: CTA link is required when CTA text is provided`);
                }
            });
        }

        // Validate colors
        const colorFields = ['backgroundColor', 'accentColor'];
        colorFields.forEach(field => {
            const value = settings[field as keyof UpdateHomepageSettingsRequest] as string;
            if (value && !/^#[0-9A-F]{6}$/i.test(value)) {
                errors.push(`${field}: Must be a valid hex color code`);
            }
        });

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Validate website theme settings
     */
    static validateWebsiteTheme(theme: UpdateWebsiteThemeRequest): {
        valid: boolean;
        errors: string[];
    } {
        const errors: string[] = [];

        // Validate color fields
        const colorFields = ['primaryColor', 'secondaryColor', 'accentColor', 'backgroundColor', 'textColor'];
        colorFields.forEach(field => {
            const value = theme[field as keyof UpdateWebsiteThemeRequest] as string;
            if (value && !/^#[0-9A-F]{6}$/i.test(value)) {
                errors.push(`${field}: Must be a valid hex color code`);
            }
        });

        // Validate theme value
        if (theme.theme && !['light', 'dark', 'auto'].includes(theme.theme)) {
            errors.push('theme: Must be one of "light", "dark", or "auto"');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }
} 