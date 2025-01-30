import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { CallbackError } from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot be more than 50 characters'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please provide a valid email address',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  studyPreferences: {
    subjects: [String],
    learningStyle: String,
    dailyGoal: Number,
  },
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  try {
    if (!this.isModified('password')) return next();
    
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as CallbackError);
  }
});

// Method to check if password is correct
userSchema.methods.correctPassword = async function(
  candidatePassword: string,
  userPassword: string
) {
  try {
    return await bcrypt.compare(candidatePassword, userPassword);
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
  }
};

// Clean up the model between hot reloads in development
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User; 