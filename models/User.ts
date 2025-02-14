import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  studyPreferences: {
    subjects: string[];
    dailyGoal: number;
    reminderTime: string;
  };
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot be more than 50 characters long']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    index: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Don't include password by default
  },
  studyPreferences: {
    subjects: {
      type: [String],
      default: []
    },
    dailyGoal: {
      type: Number,
      default: 30 // 30 minutes
    },
    reminderTime: {
      type: String,
      default: '09:00' // 9 AM
    }
  }
}, {
  timestamps: true
});

// Only hash the password if it has been modified (or is new)
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    // Normalize the password
    this.password = this.password.trim();
    
    // Generate salt and hash
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare password for login
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    // Normalize the candidate password
    candidatePassword = candidatePassword.trim();
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
};

// Ensure password is included when needed
userSchema.pre(/^find/, function(next) {
  // @ts-ignore
  if (this._conditions.email) {
    // @ts-ignore
    this.select('+password');
  }
  next();
});

export const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema); 