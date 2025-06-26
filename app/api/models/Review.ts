import mongoose from 'mongoose';
import connectToDatabase from '../../../utils/db';

interface IUser {
    _id: string;
    firstName: string;
    lastName: string;
}

interface IReview {
    product: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId | IUser;
    rating: number;
    comment: string;
    title?: string;
    status: 'pending' | 'approved' | 'rejected';
    adminNotes?: string;
    reviewedBy?: mongoose.Types.ObjectId;
    reviewedAt?: Date;
    helpful: number;
    verified: boolean;
    createdAt: Date;
    updatedAt: Date;
}

interface IReviewMethods {
    userDisplayName: string;
}

interface IReviewStatics {
    calculateAverageRating(productId: string): Promise<{ averageRating: number; totalReviews: number }>;
}

type ReviewModel = mongoose.Model<IReview, Record<string, never>, IReviewMethods> & IReviewStatics;

const reviewSchema = new mongoose.Schema<IReview, ReviewModel, IReviewMethods>(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: [true, 'Review must belong to a product'],
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Review must belong to a user'],
        },
        rating: {
            type: Number,
            required: [true, 'Review must have a rating'],
            min: [1, 'Rating must be at least 1'],
            max: [5, 'Rating cannot exceed 5'],
        },
        comment: {
            type: String,
            required: [true, 'Review must have a comment'],
            trim: true,
            maxlength: [1000, 'Review comment cannot exceed 1000 characters'],
        },
        title: {
            type: String,
            trim: true,
            maxlength: [100, 'Review title cannot exceed 100 characters'],
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
        adminNotes: {
            type: String,
            trim: true,
            maxlength: [500, 'Admin notes cannot exceed 500 characters'],
        },
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Admin who reviewed this review
        },
        reviewedAt: {
            type: Date,
        },
        helpful: {
            type: Number,
            default: 0,
        },
        verified: {
            type: Boolean,
            default: false, // Whether the reviewer actually purchased the product
        },
    },
    {
        timestamps: true,
        strict: true,
    }
);

// Indexes for better performance
reviewSchema.index({ product: 1, status: 1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ status: 1, createdAt: -1 });

// Compound index to prevent duplicate reviews from same user for same product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Virtual for getting user's display name
reviewSchema.virtual('userDisplayName').get(function (this: IReview) {
    if (this.user && typeof this.user === 'object' && 'firstName' in this.user) {
        return `${this.user.firstName} ${this.user.lastName}`;
    }
    return 'Anonymous';
});

// Static method to calculate average rating for a product
reviewSchema.statics.calculateAverageRating = async function (productId: string) {
    const stats = await this.aggregate([
        {
            $match: {
                product: new mongoose.Types.ObjectId(productId),
                status: 'approved'
            }
        },
        {
            $group: {
                _id: '$product',
                averageRating: { $avg: '$rating' },
                totalReviews: { $sum: 1 }
            }
        }
    ]);

    if (stats.length > 0) {
        const { averageRating, totalReviews } = stats[0];
        // Update the product with new rating
        await mongoose.models.Product.findByIdAndUpdate(productId, {
            totalRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
            reviewCount: totalReviews
        });

        return { averageRating, totalReviews };
    } else {
        // No approved reviews, reset product rating
        await mongoose.models.Product.findByIdAndUpdate(productId, {
            totalRating: 0,
            reviewCount: 0
        });

        return { averageRating: 0, totalReviews: 0 };
    }
};

// Post-save hook to update product rating
reviewSchema.post('save', async function () {
    if (this.status === 'approved') {
        const Model = this.constructor as ReviewModel;
        await Model.calculateAverageRating(this.product.toString());
    }
});

// Post-remove hook to update product rating
reviewSchema.post('findOneAndDelete', async function (doc) {
    if (doc && doc.status === 'approved') {
        const Model = this.model as ReviewModel;
        await Model.calculateAverageRating(doc.product.toString());
    }
});

// Post-update hook to update product rating when status changes
reviewSchema.post('findOneAndUpdate', async function (doc) {
    if (doc) {
        const Model = this.model as ReviewModel;
        await Model.calculateAverageRating(doc.product.toString());
    }
});

// Make sure to connect to the database
connectToDatabase();

// Don't re-create the model if it already exists
const Review = (mongoose.models.Review as ReviewModel) || mongoose.model<IReview, ReviewModel>('Review', reviewSchema);

export default Review; 