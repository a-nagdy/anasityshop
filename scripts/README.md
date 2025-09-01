# Database Scripts

This directory contains database-related scripts for the Anasity Shop application.

## Seed Data Script

The `seed-data.js` script populates your MongoDB database with sample categories and products for development and testing purposes.

### Features

- **Comprehensive Categories**: Creates a hierarchical category structure with parent and child categories
- **Realistic Products**: Adds 15+ sample products across different categories
- **Database Clearing**: Safely removes existing data before seeding
- **Error Handling**: Provides detailed logging and error messages
- **Auto-generated Fields**: Automatically creates SKUs, slugs, and handles relationships

### Usage

#### Basic Usage

```bash
node scripts/seed-data.js
```

#### Using npm script (recommended)

```bash
npm run seed
```

### Sample Data Included

#### Categories (5 Parent + 8 Subcategories)

- **Electronics**
  - Smartphones
  - Laptops
  - Audio & Headphones
- **Clothing**
  - Men's Clothing
  - Women's Clothing
  - Shoes & Accessories
- **Home & Garden**
  - Furniture
  - Kitchen & Dining
- **Sports & Fitness**
- **Books & Media**

#### Products (15+ Items)

- **Electronics**: iPhone 15 Pro Max, Samsung Galaxy S24, MacBook Pro, Dell XPS, AirPods Pro, Sony Headphones
- **Clothing**: Premium T-shirts, Jeans, Dresses, Blazers
- **Home**: Coffee Tables, Office Chairs
- **Sports**: Yoga Mats

### Features of Generated Data

#### Products Include:

- ✅ Realistic prices with discounts
- ✅ Multiple color and size variants
- ✅ Professional product descriptions
- ✅ High-quality Unsplash images
- ✅ Stock quantities and inventory tracking
- ✅ Auto-generated SKUs and slugs
- ✅ Featured product flags
- ✅ Detailed specifications (weight, dimensions, materials)

#### Categories Include:

- ✅ Parent-child relationships
- ✅ SEO-friendly slugs
- ✅ Professional descriptions
- ✅ Category images

### Environment Setup

Make sure your `.env` file contains the MongoDB connection string:

```env
MONGODB_URI=mongodb://localhost:27017/anasityshop
# or your MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/anasityshop
```

### Script Output

The script provides detailed logging:

```
🚀 Starting database seeding...
🧹 Clearing existing data...
✅ Database cleared
🌱 Seeding categories...
✅ Created parent category: Electronics
✅ Created parent category: Clothing
✅ Created subcategory: Smartphones
✅ Created subcategory: Laptops
🌱 Seeding products...
✅ Created product: iPhone 15 Pro Max
✅ Created product: Samsung Galaxy S24 Ultra
🎉 Database seeding completed successfully!

📊 Summary:
📁 Categories created: 13
📦 Products created: 15
👋 Disconnected from MongoDB
```

### Safety Features

- **Clear Before Seed**: Removes all existing categories and products
- **Relationship Integrity**: Maintains proper category-product relationships
- **Error Handling**: Continues processing even if individual items fail
- **Validation**: Uses the same validation as your application models

### Customization

To modify the sample data:

1. **Edit Categories**: Modify `categoriesData` and `subcategoriesData` arrays
2. **Edit Products**: Modify `productsData` array
3. **Add New Fields**: Update the schemas if you've added custom fields
4. **Change Images**: Replace Unsplash URLs with your own images

### Troubleshooting

#### Common Issues:

1. **Connection Error**: Check your `MONGODB_URI` in `.env`
2. **Permission Error**: Ensure MongoDB user has read/write permissions
3. **Validation Error**: Check that your models match the schema in the script

#### Reset Database:

```bash
node scripts/seed-data.js
```

This will clear all existing data and reseed fresh sample data.

### Integration with Development

This script is perfect for:

- 🔧 **Development Setup**: Get a fully populated database quickly
- 🧪 **Testing**: Consistent test data across environments
- 🎯 **Demos**: Professional sample data for presentations
- 📱 **Frontend Development**: Rich data to test UI components

### Next Steps After Seeding

1. **Browse Categories**: Visit `/categories` to see the category structure
2. **View Products**: Check `/products` or category pages to see products
3. **Test Features**: Try searching, filtering, and adding products to cart
4. **Admin Panel**: Use the admin dashboard to manage the seeded data

---

**Note**: This script is designed for development environments. For production, consider using a more controlled data migration approach.
