import Settings, { WebsiteThemeSettings } from '@/app/api/models/Settings';
import connectToDatabase from '@/utils/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
    try {
        await connectToDatabase();

        let settings = await Settings.findOne({ name: 'website-theme' });

        if (!settings) {
            // Create default settings if they don't exist
            const defaultTheme: WebsiteThemeSettings = {
                // Primary Colors
                primaryColor: '#00f5ff',
                secondaryColor: '#8b5cf6',
                accentColor: '#ec4899',

                // Button Colors
                buttonPrimaryColor: '#00f5ff',
                buttonSecondaryColor: '#8b5cf6',
                buttonHoverColor: '#00d9ff',
                buttonTextColor: '#ffffff',

                // Header Colors
                headerBackgroundColor: 'rgba(10, 10, 15, 0.95)',
                headerTextColor: '#ffffff',
                headerBorderColor: 'rgba(0, 245, 255, 0.2)',

                // Footer Colors
                footerBackgroundColor: 'rgba(10, 10, 15, 0.98)',
                footerTextColor: '#ffffff',
                footerLinkColor: '#00f5ff',

                // Background Colors
                backgroundColor: '#0a0a0f',
                surfaceColor: 'rgba(255, 255, 255, 0.05)',

                // Text Colors
                textPrimaryColor: '#ffffff',
                textSecondaryColor: '#a1a1aa',

                // Border and Shadow
                borderColor: 'rgba(255, 255, 255, 0.1)',
                shadowColor: 'rgba(0, 245, 255, 0.2)',

                // Effects
                animation3dEnabled: true,
                glassmorphismEnabled: true,
                particleEffectsEnabled: true
            };

            settings = new Settings({
                name: 'website-theme',
                value: defaultTheme
            });

            await settings.save();
        }

        return NextResponse.json({
            success: true,
            message: 'Website theme settings retrieved successfully',
            data: settings
        });
    } catch (error) {
        console.error('Error fetching website theme settings:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch website theme settings',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        await connectToDatabase();

        const body = await request.json();

        // Validate required fields
        const requiredFields = [
            'primaryColor', 'secondaryColor', 'accentColor',
            'buttonPrimaryColor', 'buttonSecondaryColor', 'buttonHoverColor', 'buttonTextColor',
            'headerBackgroundColor', 'headerTextColor', 'headerBorderColor',
            'footerBackgroundColor', 'footerTextColor', 'footerLinkColor',
            'backgroundColor', 'surfaceColor',
            'textPrimaryColor', 'textSecondaryColor',
            'borderColor', 'shadowColor'
        ];

        for (const field of requiredFields) {
            if (!body[field]) {
                return NextResponse.json(
                    {
                        success: false,
                        message: `Missing required field: ${field}`
                    },
                    { status: 400 }
                );
            }
        }

        let settings = await Settings.findOne({ name: 'website-theme' });

        if (settings) {
            settings.value = body;
            settings.updatedAt = new Date();
        } else {
            settings = new Settings({
                name: 'website-theme',
                value: body
            });
        }

        await settings.save();

        return NextResponse.json({
            success: true,
            message: 'Website theme settings updated successfully',
            data: settings
        });
    } catch (error) {
        console.error('Error updating website theme settings:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to update website theme settings',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
} 