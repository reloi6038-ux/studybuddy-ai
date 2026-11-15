const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    options: { type: [String], required: true },
    correctIndex: { type: Number, required: true },
    explanation: { type: String, default: '' },
  },
  { _id: false }
);

const quizResultSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    topic: { type: String, required: true },
    questions: { type: [questionSchema], default: [] },
    userAnswers: { type: [Number], default: [] },
    score: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    modelUsed: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('QuizResult', quizResultSchema);