import mongoose from 'mongoose';
import connectToDatabase from '../../../utils/db';

const orderItemSchema = new mongoose.Schema(
    {
        orderNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: [1, 'Quantity must be at least 1'],
        },
        price: {
            type: Number,
            required: true,
        },
        totalPrice: {
            type: Number,
            required: true,
        },
        color: String,
        size: String,
        image: String,
    },
    { _id: false }
);

const shippingSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: [true, 'Full name is required'],
        },
        address: {
            type: String,
            required: [true, 'Address is required'],
        },
        city: {
            type: String,
            required: [true, 'City is required'],
        },
        state: {
            type: String,
            required: [true, 'State is required'],
        },
        postalCode: {
            type: String,
            required: [true, 'Postal code is required'],
        },
        country: {
            type: String,
            required: [true, 'Country is required'],
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
        },
    },
    { _id: false }
);

const paymentSchema = new mongoose.Schema(
    {
        method: {
            type: String,
            required: [true, 'Payment method is required'],
            enum: ['credit_card', 'paypal', 'cash_on_delivery', 'bank_transfer'],
        },
        transactionId: String,
        status: {
            type: String,
            enum: ['pending', 'paid', 'failed'],
            default: 'pending',
        },
        details: {
            type: mongoose.Schema.Types.Mixed,
        },
    },
    { _id: false }
);

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        orderNumber: {
            type: String,
            unique: true,
        },
        items: [orderItemSchema],
        shipping: shippingSchema,
        payment: paymentSchema,
        itemsPrice: {
            type: Number,
            required: true,
        },
        shippingPrice: {
            type: Number,
            required: true,
        },
        taxPrice: {
            type: Number,
            required: true,
            default: 0,
        },
        totalPrice: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded', "failed", "completed"],
            default: 'pending',
        },
        isPaid: {
            type: Boolean,
            default: false,
        },
        paidAt: Date,
        isDelivered: {
            type: Boolean,
            default: false,
        },
        deliveredAt: Date,
        trackingNumber: String,
        notes: String,
    },
    {
        timestamps: true,
    }
);

// Generate order number before saving a new order
orderSchema.pre('save', async function (next) {
    // Only generate order number for new orders
    if (this.isNew) {
        const count = await mongoose.models.Order.countDocuments();
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        this.orderNumber = `ORD-${year}${month}${day}-${(count + 1).toString().padStart(5, '0')}`;
    }

    next();
});

// Make sure to connect to the database
connectToDatabase();

// Don't re-create the model if it already exists
const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

export default Order; 