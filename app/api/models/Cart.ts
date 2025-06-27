import mongoose from 'mongoose';
import connectToDatabase from '../../../utils/db';

const cartItemSchema = new mongoose.Schema(
    {
        cartItemKey: {
            type: String,
            required: [true, 'Cart item key is required'],
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: [true, 'Product is required'],
        },
        quantity: {
            type: Number,
            required: [true, 'Quantity is required'],
            min: [1, 'Quantity must be at least 1'],
        },
        variants: {
            color: {
                type: String,
                default: null,
            },
            size: {
                type: String,
                default: null,
            },
        },
        // Keep legacy fields for backward compatibility during migration
        color: {
            type: String,
        },
        size: {
            type: String,
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
        },
        totalPrice: {
            type: Number,
            required: [true, 'Total price is required'],
        },
    },
    { _id: false }
);

const cartSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User is required'],
        },
        items: [cartItemSchema],
        totalItems: {
            type: Number,
            default: 0,
        },
        totalPrice: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Calculate totals before saving
cartSchema.pre('save', function (next) {
    if (this.items && this.items.length > 0) {
        // Calculate total items
        this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);

        // Calculate total price
        this.totalPrice = this.items.reduce((total, item) => total + item.totalPrice, 0);
    } else {
        // Empty cart
        this.totalItems = 0;
        this.totalPrice = 0;
    }

    next();
});

// Make sure to connect to the database
connectToDatabase();

// Don't re-create the model if it already exists
const Cart = mongoose.models.Cart || mongoose.model('Cart', cartSchema);

export default Cart; 