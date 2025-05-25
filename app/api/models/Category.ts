import mongoose from 'mongoose';
import connectToDatabase from '../../../utils/db';

// Create Category model schema
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      unique: true,
      maxlength: [32, "Category name should be under 32 characters"],
    },
    slug: {
      type: String,
      lowercase: true,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null
    },
    hasChildren: {
      type: Boolean,
      default: false
    },
    image: {
      type: String,
    },
    imageId: {
      type: String,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Pre-save middleware to create slug from name if not provided
categorySchema.pre('save', function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Update parent's hasChildren status when a category is created or updated
categorySchema.pre('save', async function (next) {
  // If this is a new category with a parent or the parent field has been modified
  if ((this.isNew || this.isModified('parent')) && this.parent) {
    try {
      // Update the parent category's hasChildren field to true
      await mongoose.model('Category').findByIdAndUpdate(
        this.parent,
        { hasChildren: true }
      );
    } catch (error) {
      console.error('Error updating parent category:', error);
    }
  }
  next();
});

// Handle parent updates when a category is deleted
categorySchema.pre('findOneAndDelete', async function (next) {
  try {
    // Get the category that is being deleted
    const categoryToDelete = await this.model.findOne(this.getFilter());
    
    if (categoryToDelete && categoryToDelete.parent) {
      // Check if the parent has other children
      const siblingCount = await this.model.countDocuments({ parent: categoryToDelete.parent, _id: { $ne: categoryToDelete._id } });
      
      // If no other children, update the parent's hasChildren to false
      if (siblingCount === 0) {
        await mongoose.model('Category').findByIdAndUpdate(
          categoryToDelete.parent,
          { hasChildren: false }
        );
      }
    }
  } catch (error) {
    console.error('Error updating parent category on delete:', error);
  }
  next();
});

// Virtual field to get product count - only if Product model exists
categorySchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'category',
  count: true,
  // This ensures the virtual works even if the Product model isn't registered yet
  options: { allowDiskUse: true }
});

// Helper method to check if Product model exists before trying to populate
categorySchema.methods.hasProductModel = function() {
  return !!mongoose.models.Product;
};

// Make sure to connect to the database
connectToDatabase();

// Don't re-create the model if it already exists
const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

export default Category; 