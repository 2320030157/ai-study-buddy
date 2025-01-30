import mongoose from 'mongoose';

const cardSchema = new mongoose.Schema({
  front: {
    type: String,
    required: [true, 'Front content is required'],
    trim: true,
  },
  back: {
    type: String,
    required: [true, 'Back content is required'],
    trim: true,
  },
});

const deckSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters long'],
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    cards: [cardSchema],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    lastStudied: {
      type: Date,
      default: null,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for better query performance
deckSchema.index({ user: 1, title: 1 });
deckSchema.index({ user: 1, subject: 1 });

export const Deck = mongoose.models.Deck || mongoose.model('Deck', deckSchema); 