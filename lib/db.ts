import mongoose from 'mongoose';
import './server'; // Import server configuration

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-study-buddy';

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    return mongoose.connection;
  }

  try {
    // Optimize connection options for Vercel serverless environment
    const db = await mongoose.connect(MONGODB_URI, {
      connectTimeoutMS: 5000, // Reduced from 10s to 5s
      socketTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 5, // Reduced pool size for serverless
      minPoolSize: 1,
      maxIdleTimeMS: 5000,
      retryWrites: true,
    });

    isConnected = db.connections[0].readyState === 1;
    console.log('MongoDB connected successfully');

    // Single event handler for connection issues
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      isConnected = false;
    });

    return mongoose.connection;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    isConnected = false;
    throw error;
  }
};

// Clean up on app termination
if (process.env.NODE_ENV !== 'production') {
  process.on('SIGINT', async () => {
    try {
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
      }
      process.exit(0);
    } catch (err) {
      console.error('Error closing MongoDB connection:', err);
      process.exit(1);
    }
  });
}

export default connectDB;
