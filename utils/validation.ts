import mongoose from 'mongoose';
import xss from 'xss';

export interface ValidationRule {
    required?: boolean;
    type?: 'string' | 'number' | 'boolean' | 'email' | 'objectId' | 'array';
    min?: number;
    max?: number;
    pattern?: RegExp;
    custom?: (value: unknown) => boolean | string;
}

export interface ValidationSchema {
    [key: string]: ValidationRule;
}

export class Validator {
    static validate(data: unknown, schema: ValidationSchema): { isValid: boolean; errors: Record<string, string> } {
        const errors: Record<string, string> = {};

        for (const [field, rules] of Object.entries(schema)) {
            const value = (data as Record<string, unknown>)[field];

            // Check required fields
            if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
                errors[field] = `${field} is required`;
                continue;
            }

            // Skip validation if field is not provided and not required
            if (!value && !rules.required) continue;

            // Type validation
            switch (rules.type) {
                case 'string':
                    if (typeof value !== 'string') {
                        errors[field] = `${field} must be a string`;
                    }
                    break;
                case 'number':
                    if (typeof value !== 'number' || isNaN(value)) {
                        errors[field] = `${field} must be a valid number`;
                    }
                    break;
                case 'boolean':
                    if (typeof value !== 'boolean') {
                        errors[field] = `${field} must be a boolean`;
                    }
                    break;
                case 'email':
                    if (typeof value !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                        errors[field] = `${field} must be a valid email address`;
                    }
                    break;
                case 'objectId':
                    if (!mongoose.Types.ObjectId.isValid(value as string)) {
                        errors[field] = `${field} must be a valid ObjectId`;
                    }
                    break;
                case 'array':
                    if (!Array.isArray(value)) {
                        errors[field] = `${field} must be an array`;
                    }
                    break;
            }

            // Length validation
            if (typeof value === 'string') {
                if (rules.min && value.length < rules.min) {
                    errors[field] = `${field} must be at least ${rules.min} characters long`;
                }
                if (rules.max && value.length > rules.max) {
                    errors[field] = `${field} must be no more than ${rules.max} characters long`;
                }
            }

            // Number range validation
            if (typeof value === 'number') {
                if (rules.min !== undefined && value < rules.min) {
                    errors[field] = `${field} must be at least ${rules.min}`;
                }
                if (rules.max !== undefined && value > rules.max) {
                    errors[field] = `${field} must be no more than ${rules.max}`;
                }
            }

            // Pattern validation
            if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
                errors[field] = `${field} format is invalid`;
            }

            // Custom validation
            if (rules.custom) {
                const customResult = rules.custom(value);
                if (typeof customResult === 'string') {
                    errors[field] = customResult;
                } else if (!customResult) {
                    errors[field] = `${field} is invalid`;
                }
            }
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }

    static sanitizeInput(input: unknown): unknown {
        if (typeof input === 'string') {
            return xss(input.trim());
        }
        if (typeof input === 'object' && input !== null) {
            const sanitized: Record<string, unknown> = {};
            for (const [key, value] of Object.entries(input)) {
                sanitized[key] = this.sanitizeInput(value);
            }
            return sanitized;
        }
        if (Array.isArray(input)) {
            return input.map(item => this.sanitizeInput(item));
        }
        return input;
    }

    static validatePassword(password: string): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }
        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }
        if (!/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }
        if (!/\d/.test(password)) {
            errors.push('Password must contain at least one number');
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push('Password must contain at least one special character');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}