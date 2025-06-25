import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware, isAdmin } from '../../../middleware/authMiddleware';
import connectToDatabase from '../../../utils/db';
import Settings from '../models/Settings';

// GET all settings or specific setting by name
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const url = new URL(req.url);
    const name = url.searchParams.get('name');
    if (name) {
      // Get specific setting
      const setting = await Settings.findOne({ name });
      // console.log(setting)
      
      if (!setting) {
        return NextResponse.json(
          { message: `Setting '${name}' not found` },
          { status: 404 }
        );
      }
      
      return NextResponse.json(setting);
    } else {
      // Get all settings
      const settings = await Settings.find({});
      return NextResponse.json(settings);
    }
  } catch (error: unknown) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}

// Create or update a setting - Admin only
export async function POST(req: NextRequest) {
  return authMiddleware(req, async (req, user) => {
    // Check if user is admin
    const adminCheckResult = isAdmin(user);
    if (adminCheckResult) return adminCheckResult;
    
    try {
      await connectToDatabase();
      
      const data = await req.json();
      const { name, value } = data;
      
      if (!name || value === undefined) {
        return NextResponse.json(
          { message: 'Name and value are required' },
          { status: 400 }
        );
      }
      
      // Update or create setting
      const setting = await Settings.findOneAndUpdate(
        { name },
        { name, value },
        { new: true, upsert: true }
      );
      
      return NextResponse.json(setting);
    } catch (error: unknown) {
      console.error('Error saving setting:', error);
      return NextResponse.json(
        { message: error instanceof Error ? error.message : 'An error occurred' },
        { status: 500 }
      );
    }
  });
}
