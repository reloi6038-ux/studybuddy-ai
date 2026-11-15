const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    subject: String,
    topic: String,
    durationMinutes: Number,
    type: { type: String, enum: ['learn', 'practice', 'review'] },
  },
  { _id: false }
);

const daySchema = new mongoose.Schema(
  {
    day: Number,
    date: String,
    focus: String,
    tasks: { type: [taskSchema], default: [] },
  },
  { _id: false }
);

const studyPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    planTitle: { type: String, required: true },
    subjects: { type: [String], default: [] },
    examDate: { type: Date },
    hoursPerDay: { type: Number, default: 2 },
    weakTopics: { type: [String], default: [] },
    totalDays: { type: Number, required: true },
    dailyPlan: { type: [daySchema], default: [] },
    modelUsed: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StudyPlan', studyPlanSchema);