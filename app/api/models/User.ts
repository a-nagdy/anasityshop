import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import connectToDatabase from '../../../utils/db';

// Create User model schema
const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: [true, "First name is required"],
            trim: true,
        },
        lastName: {
            type: String,
            required: [true, "Last name is required"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password should be at least 6 characters"],
        },
        role: {
            type: String,
            enum: ["customer", "admin", "super-admin"],
            default: "customer",
        },
        phone: String,
        active: {
            type: Boolean,
            default: true,
        },
        image: String,
        imageId: String,
        verificationToken: String,
        verified: {
            type: Boolean,
            default: false,
        },
        resetPasswordToken: String,
        resetPasswordExpire: Date,
    },
    {
        timestamps: true,
    }
);

// Don't re-create the model if it already exists
 const User = mongoose.models.User || mongoose.model('User', userSchema);

// Create JWT token
export const createToken = async (id: string) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET environment variable is not set');
    }

    const token = await new SignJWT({ id })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('30d')
        .sign(new TextEncoder().encode(secret));

    return token;
};

// Set cookie with token for an existing response
export const setTokenCookie = (response: NextResponse, token: string) => {
    response.cookies.set({
        name: 'adminToken',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
    });
    return response;
};

// Hash password
export const hashPassword = async (password: string) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

// Compare password
export const comparePassword = async (password: string, hashedPassword: string) => {
    return bcrypt.compare(password, hashedPassword);
};

// Get user by ID
export const getUserById = async (id: string) => {
    await connectToDatabase();
    try {
        return await User.findById(id).select('-password');
    } catch (error) {
        console.error('Error fetching user by ID:', error);
        return null;
    }
};

// Get user by email
export const getUserByEmail = async (email: string) => {
    await connectToDatabase();
    try {
        return await User.findOne({ email });
    } catch (error) {
        console.error('Error fetching user by email:', error);
        return null;
    }
};

export default User; 