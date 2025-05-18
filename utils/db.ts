import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
}

interface Connection {
    isConnected?: number;
}

const connection: Connection = {};

async function connectToDatabase() {
    if (connection.isConnected) {
        return;
    }

    try {
        const db = await mongoose.connect(MONGODB_URI as string, {
            serverSelectionTimeoutMS: 10000, // 10s timeout
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        });

        connection.isConnected = db.connections[0].readyState;
        console.log('MongoDB Connected Successfully');
    } catch (error) {
        console.error('MongoDB Connection Error:', error);
    }
}

export default connectToDatabase; 