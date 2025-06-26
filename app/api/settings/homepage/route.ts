import Settings from "@/app/api/models/Settings";
import { ApiResponseHelper } from "@/utils/apiResponse";
import connectToDatabase from "@/utils/db";
import { Validator } from "@/utils/validation";
import { NextRequest } from "next/server";

export async function GET() {
    try {
        await connectToDatabase();

        // Get homepage settings
        let homepageSettings = await Settings.findOne({ name: "homepage" });

        if (!homepageSettings) {
            // Create default homepage settings
            const defaultSettings = {
                name: "homepage",
                value: {
                    heroBanners: [
                        {
                            title: "ANASITY",
                            subtitle: "Future of E-Commerce",
                            backgroundImage: "",
                            ctaText: "Explore Store",
                            ctaLink: "/categories",
                            active: true,
                            order: 0,
                            showButton: true,
                            showSecondaryButton: true
                        }
                    ],
                    categorySliders: [
                        {
                            title: "Explore Categories",
                            subtitle: "Discover our premium collections",
                            categories: [],
                            active: true
                        }
                    ],
                    productSliders: [
                        {
                            title: "Featured Products",
                            subtitle: "Discover our top picks",
                            products: [],
                            type: "featured",
                            active: true
                        }
                    ],
                    banners: [],
                    showFeaturedCategories: true,
                    showNewArrivals: true,
                    showBestsellers: true,
                    backgroundColor: "#0a0a0f",
                    accentColor: "#00f5ff",
                    animation3dEnabled: true
                }
            };

            homepageSettings = await Settings.create(defaultSettings);
        }

        return Response.json(ApiResponseHelper.success(homepageSettings.value, "Homepage settings retrieved successfully"));
    } catch (error) {
        console.error("Error fetching homepage settings:", error);
        return Response.json(ApiResponseHelper.serverError("Internal server error"), { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate input
        const validation = Validator.validate(body, {
            heroBanners: { type: "array" },
            categorySliders: { type: "array" },
            productSliders: { type: "array" },
            banners: { type: "array" },
            showFeaturedCategories: { type: "boolean" },
            showNewArrivals: { type: "boolean" },
            showBestsellers: { type: "boolean" },
            backgroundColor: { type: "string" },
            accentColor: { type: "string" },
            animation3dEnabled: { type: "boolean" }
        });

        if (!validation.isValid) {
            return Response.json(ApiResponseHelper.validationError(validation.errors), { status: 400 });
        }

        await connectToDatabase();

        // Update or create homepage settings
        const homepageSettings = await Settings.findOneAndUpdate(
            { name: "homepage" },
            { value: body },
            {
                new: true,
                upsert: true,
                runValidators: true
            }
        );

        return Response.json(ApiResponseHelper.success(homepageSettings.value, "Homepage settings updated successfully"));
    } catch (error) {
        console.error("Error updating homepage settings:", error);
        return Response.json(ApiResponseHelper.serverError("Internal server error"), { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { section, data } = body;

        if (!section || !data) {
            return Response.json(ApiResponseHelper.error("Section and data are required"), { status: 400 });
        }

        await connectToDatabase();

        // Get current settings
        const homepageSettings = await Settings.findOne({ name: "homepage" });

        if (!homepageSettings) {
            return Response.json(ApiResponseHelper.notFound("Homepage settings"), { status: 404 });
        }

        // Update specific section
        const currentValue = homepageSettings.value;

        switch (section) {
            case "heroBanners":
                currentValue.heroBanners = data;
                break;
            case "categorySliders":
                currentValue.categorySliders = data;
                break;
            case "productSliders":
                currentValue.productSliders = data;
                break;
            case "banners":
                currentValue.banners = data;
                break;
            default:
                return Response.json(ApiResponseHelper.error("Invalid section"), { status: 400 });
        }

        // Save updated settings
        homepageSettings.value = currentValue;
        await homepageSettings.save();

        return Response.json(ApiResponseHelper.success(homepageSettings.value, `${section} updated successfully`));
    } catch (error) {
        console.error("Error updating homepage section:", error);
        return Response.json(ApiResponseHelper.serverError("Internal server error"), { status: 500 });
    }
} 