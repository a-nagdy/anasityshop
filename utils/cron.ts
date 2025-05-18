import mongoose from 'mongoose';
import cron from 'node-cron';
import connectToDatabase from './db';
import { determineProductStatus } from './productStatus';

// Schedule product status updates
export const scheduleProductStatusUpdates = () => {
  // Run every day at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('Running product status update cron job...');
    
    try {
      await connectToDatabase();
      
      const Product = mongoose.models.Product;
      if (!Product) {
        console.error('Product model not found');
        return;
      }
      
      // Find all products
      const products = await Product.find({});
      
      // Update each product's status
      for (const product of products) {
        const newStatus = determineProductStatus(product.quantity, product.active);
        
        // Only update if status has changed
        if (product.status !== newStatus) {
          await Product.findByIdAndUpdate(
            product._id,
            { status: newStatus },
            { new: true }
          );
          console.log(`Updated product ${product._id} status to ${newStatus}`);
        }
      }
      
      console.log('Product status update completed');
    } catch (error) {
      console.error('Error updating product statuses:', error);
    }
  });
  
  console.log('Product status update cron job scheduled');
};

// Initialize cron jobs
export const initCronJobs = () => {
  scheduleProductStatusUpdates();
}; 