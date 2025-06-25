import { NextResponse } from 'next/server';
import connectToDatabase from '../../../utils/db';
import Category from '../models/Category';
import Product from '../models/Product';
import Settings from '../models/Settings';

export async function GET() {
    try {
        await connectToDatabase();


        // Fetch homepage settings
        const homepageSettings = await Settings.findOne({ name: 'homepage' });
        if (!homepageSettings) {
            return NextResponse.json({ error: 'Homepage settings not found' }, { status: 404 });
        }
        const { value: settings } = homepageSettings;
        const {
            heroBanners,
            categorySliders,
            productSliders,
            showFeaturedCategories,
            showNewArrivals,
            showBestsellers,
            backgroundColor,
            accentColor,
            animation3dEnabled
        } = settings;

        // Prepare data holders
        const enrichedCategorySliders = [];
        const enrichedProductSliders = [];

        // Fetch and enrich category sliders
        for (const slider of categorySliders) {
            if (!slider.active) continue;

            const categories = await Category.find({
                _id: { $in: slider.categories },
                active: true
            }).populate({
                path: 'products',
                options: { limit: 6 }
            });

            // Transform categories to include productsCount
            const transformedCategories = categories.map(category => {
                const { _id, name, slug, image, products } = category;
                return {
                    _id,
                    name,
                    slug,
                    image,
                    productsCount: products?.length || 0
                };
            });

            enrichedCategorySliders.push({
                ...slider,
                categories: transformedCategories
            });
        }

        // Fetch and enrich product sliders
        for (const slider of productSliders) {
            if (!slider.active) continue;

            let products;
            if (slider.type === 'custom' && slider.products?.length > 0) {
                products = await Product.find({
                    _id: { $in: slider.products }
                }).select('name slug price images status');
            } else if (slider.type === 'featured') {
                products = await Product.find({ featured: true })
                    .limit(12)
                    .select('name slug price images status');
            } else if (slider.type === 'bestseller') {
                products = await Product.find({ sold: { $gte: 10 } })
                    .limit(12)
                    .select('name slug price images status');
            } else if (slider.type === 'new') {
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                products = await Product.find({ createdAt: { $gte: thirtyDaysAgo } })
                    .limit(12)
                    .select('name slug price images status');
            }

            enrichedProductSliders.push({
                ...slider,
                products: products || []
            });
        }

        // Construct the final response
        const response = {
            heroBanners,
            categorySliders: enrichedCategorySliders,
            productSliders: enrichedProductSliders,
            settings: {
                showFeaturedCategories,
                showNewArrivals,
                showBestsellers,
                backgroundColor,
                accentColor,
                animation3dEnabled
            }
        };

        return NextResponse.json(response);
    } catch (error: unknown) {
        console.error('Error fetching homepage data:', error);
        return NextResponse.json(
            { message: error instanceof Error ? error.message : 'An error occurred' },
            { status: 500 }
        );
    }
} 