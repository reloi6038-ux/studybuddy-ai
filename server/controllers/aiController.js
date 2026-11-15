const asyncHandler = require('../utils/asyncHandler');
const {
  explainConcept,
  generateFlashcards,
  generateQuiz,
  generateStudyPlan,
} = require('../services/aiService');
const FlashcardSet = require('../models/FlashcardSet');
const QuizResult = require('../models/QuizResult');
const StudyPlan = require('../models/StudyPlan');

const explain = asyncHandler(async (req, res) => {
  const { question, gradeLevel, subject } = req.body;

  if (!question || question.trim().length < 3) {
    res.statusCode = 400;
    throw new Error('Question is required (min 3 characters)');
  }

  const { data, model } = await explainConcept({
    question: question.trim(),
    gradeLevel: gradeLevel || req.user.gradeLevel || 'secondary',
    subject: subject || 'general',
  });

  res.status(200).json({ status: 'success', model, data });
});

const flashcards = asyncHandler(async (req, res) => {
  const { notes, subject, count } = req.body;

  if (!notes || notes.trim().length < 50) {
    res.statusCode = 400;
    throw new Error('Notes must be at least 50 characters long');
  }

  const cardCount = Math.min(Math.max(parseInt(count) || 10, 5), 20);

  const { data, model } = await generateFlashcards({
    notes: notes.trim(),
    subject: subject || 'general',
    count: cardCount,
  });

  const set = await FlashcardSet.create({
    user: req.user._id,
    title: `${subject || 'General'} — ${cardCount} cards`,
    subject: subject || 'general',
    cards: data.cards,
    sourceNotesLength: notes.length,
    modelUsed: model,
  });

  res.status(201).json({
    status: 'success',
    model,
    data: { id: set._id, title: set.title, cards: set.cards },
  });
});

const quiz = asyncHandler(async (req, res) => {
  const { topic, gradeLevel, questionCount } = req.body;

  if (!topic || topic.trim().length < 3) {
    res.statusCode = 400;
    throw new Error('Topic is required (min 3 characters)');
  }

  const count = Math.min(Math.max(parseInt(questionCount) || 5, 3), 10);

  const { data, model } = await generateQuiz({
    topic: topic.trim(),
    gradeLevel: gradeLevel || req.user.gradeLevel || 'secondary',
    questionCount: count,
  });

  const result = await QuizResult.create({
    user: req.user._id,
    title: data.title,
    topic: topic.trim(),
    questions: data.questions,
    totalQuestions: data.questions.length,
    modelUsed: model,
  });

  res.status(201).json({
    status: 'success',
    model,
    data: {
      id: result._id,
      title: result.title,
      questions: result.questions,
      totalQuestions: result.totalQuestions,
    },
  });
});

const plan = asyncHandler(async (req, res) => {
  const { subjects, examDate, hoursPerDay, weakTopics } = req.body;

  if (!Array.isArray(subjects) || subjects.length === 0) {
    res.statusCode = 400;
    throw new Error('At least one subject is required');
  }

  const { data, model } = await generateStudyPlan({
    subjects: subjects.filter(Boolean),
    examDate: examDate || null,
    hoursPerDay: Math.min(Math.max(parseFloat(hoursPerDay) || 2, 0.5), 8),
    weakTopics: Array.isArray(weakTopics) ? weakTopics.filter(Boolean) : [],
  });

  const saved = await StudyPlan.create({
    user: req.user._id,
    planTitle: data.planTitle,
    subjects,
    examDate: examDate ? new Date(examDate) : undefined,
    hoursPerDay: hoursPerDay || 2,
    weakTopics: weakTopics || [],
    totalDays: data.totalDays,
    dailyPlan: data.dailyPlan,
    modelUsed: model,
  });

  res.status(201).json({
    status: 'success',
    model,
    data: {
      id: saved._id,
      planTitle: saved.planTitle,
      totalDays: saved.totalDays,
      dailyPlan: saved.dailyPlan,
    },
  });
});

module.exports = { explain, flashcards, quiz, plan };