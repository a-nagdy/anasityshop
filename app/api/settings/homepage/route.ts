import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware, isAdmin } from '../../../../middleware/authMiddleware';
import connectToDatabase from '../../../../utils/db';
import Settings from '../../models/Settings';
import { deleteFile } from '../../../../utils/fileUpload';
import { HeroBanner } from '@/app/types/homepageTypes';

// Get homepage settings
export async function GET() {
  try {
    await connectToDatabase();
    
    // Try to get homepage settings
    let homepageSettings = await Settings.findOne({ name: 'homepage' });
    // If not found, create default homepage settings
    if (!homepageSettings) {
      homepageSettings = await Settings.create({
        name: 'homepage',
        value: {
          heroBanners: [],
          categorySliders: [],
          productSliders: [],
          showFeaturedCategories: true,
          showNewArrivals: true,
          showBestsellers: true,
          backgroundColor: '#ffffff',
          accentColor: '#3b82f6',
          animation3dEnabled: true
        }
      });
    }
    
    return NextResponse.json(homepageSettings);
  } catch (error: unknown) {
    console.error('Error fetching homepage settings:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}

// Update homepage settings - Admin only
export async function PUT(req: NextRequest) {
  return authMiddleware(req, async (req, user) => {
    // Check if user is admin
    const adminCheckResult = isAdmin(user);
    if (adminCheckResult) return adminCheckResult;
    
    try {
      await connectToDatabase();
      
      const data = await req.json();
      
      // Get current settings to check for image removals
      const currentSettings = await Settings.findOne({ name: 'homepage' });
      
      // If there are hero banners being removed, delete their images
      if (currentSettings && currentSettings.value.heroBanners) {
        const currentBanners = currentSettings.value.heroBanners;
        const newBanners = data.heroBanners || [];
        
        // Find banners that are being removed
        const removedBanners = currentBanners.filter(
          (banner: HeroBanner) => !newBanners.some((newBanner: HeroBanner) => 
            newBanner._id && newBanner._id.toString() === banner._id.toString()
          )
        );
        
        // Delete images for removed banners
        for (const banner of removedBanners) {
          if (banner.image && banner.imageId) {
            try {
              await deleteFile(banner.image, banner.imageId);
            } catch (error) {
              console.error('Error deleting banner image:', error);
            }
          }
        }
      }
      
      // Update homepage settings
      const homepageSettings = await Settings.findOneAndUpdate(
        { name: 'homepage' },
        { name: 'homepage', value: data },
        { new: true, upsert: true }
      );
      
      return NextResponse.json(homepageSettings);
    } catch (error: unknown) {
      console.error('Error updating homepage settings:', error);
      return NextResponse.json(
        { message: error instanceof Error ? error.message : 'An error occurred' },
        { status: 500 }
      );
    }
  });
}
