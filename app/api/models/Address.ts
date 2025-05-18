import mongoose from 'mongoose';
import connectToDatabase from '../../../utils/db';

const addressSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User is required'],
        },
        fullName: {
            type: String,
            required: [true, 'Full name is required'],
            trim: true,
        },
        addressLine1: {
            type: String,
            required: [true, 'Address line 1 is required'],
            trim: true,
        },
        addressLine2: {
            type: String,
            trim: true,
        },
        city: {
            type: String,
            required: [true, 'City is required'],
            trim: true,
        },
        state: {
            type: String,
            required: [true, 'State/Province is required'],
            trim: true,
        },
        postalCode: {
            type: String,
            required: [true, 'Postal code is required'],
            trim: true,
        },
        country: {
            type: String,
            required: [true, 'Country is required'],
            trim: true,
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
            trim: true,
        },
        isDefault: {
            type: Boolean,
            default: false,
        },
        type: {
            type: String,
            enum: ['shipping', 'billing', 'both'],
            default: 'both',
        },
    },
    {
        timestamps: true,
    }
);

// Set address as default if it's the first one for a user
addressSchema.pre('save', async function (next) {
    if (this.isNew) {
        const addressCount = await mongoose.models.Address.countDocuments({ user: this.user });

        if (addressCount === 0) {
            this.isDefault = true;
        }
    }

    // If this address is being set as default, unset default on other addresses
    if (this.isDefault) {
        try {
            await mongoose.models.Address.updateMany(
                { user: this.user, _id: { $ne: this._id } },
                { $set: { isDefault: false } }
            );
        } catch (error) {
            console.error('Error updating other addresses:', error);
        }
    }

    next();
});

// Make sure to connect to the database
connectToDatabase();

// Don't re-create the model if it already exists
const Address = mongoose.models.Address || mongoose.model('Address', addressSchema);

export default Address; 