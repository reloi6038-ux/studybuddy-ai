const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema(
  {
    front: { type: String, required: true },
    back: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
  },
  { _id: false }
);

const flashcardSetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    subject: { type: String, default: 'general' },
    cards: { type: [cardSchema], default: [] },
    sourceNotesLength: { type: Number, default: 0 },
    modelUsed: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FlashcardSet', flashcardSetSchema);