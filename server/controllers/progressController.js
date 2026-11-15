const asyncHandler = require('../utils/asyncHandler');
const FlashcardSet = require('../models/FlashcardSet');
const QuizResult = require('../models/QuizResult');
const StudyPlan = require('../models/StudyPlan');

// GET /api/progress/summary
const getSummary = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [flashcardCount, quizCount, planCount, recentQuizzes] = await Promise.all([
    FlashcardSet.countDocuments({ user: userId }),
    QuizResult.countDocuments({ user: userId }),
    StudyPlan.countDocuments({ user: userId }),
    QuizResult.find({ user: userId, completed: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title topic score totalQuestions createdAt'),
  ]);

  const avgScore =
    recentQuizzes.length > 0
      ? Math.round(
          recentQuizzes.reduce(
            (sum, q) => sum + (q.score / q.totalQuestions) * 100,
            0
          ) / recentQuizzes.length
        )
      : 0;

  res.status(200).json({
    status: 'success',
    data: {
      flashcardSets: flashcardCount,
      quizzesTaken: quizCount,
      studyPlans: planCount,
      averageScore: avgScore,
      recentQuizzes,
    },
  });
});

// GET /api/progress/flashcards
const getFlashcardSets = asyncHandler(async (req, res) => {
  const sets = await FlashcardSet.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .select('title subject cards modelUsed createdAt');

  res.status(200).json({ status: 'success', data: sets });
});

// GET /api/progress/quizzes
const getQuizResults = asyncHandler(async (req, res) => {
  const quizzes = await QuizResult.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .select('title topic score totalQuestions completed createdAt');

  res.status(200).json({ status: 'success', data: quizzes });
});

// GET /api/progress/plans
const getStudyPlans = asyncHandler(async (req, res) => {
  const plans = await StudyPlan.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .select('planTitle subjects totalDays createdAt');

  res.status(200).json({ status: 'success', data: plans });
});

// PATCH /api/progress/quiz/:id/submit
const submitQuiz = asyncHandler(async (req, res) => {
  const { answers } = req.body;

  const quiz = await QuizResult.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!quiz) {
    res.statusCode = 404;
    throw new Error('Quiz not found');
  }

  if (quiz.completed) {
    res.statusCode = 400;
    throw new Error('Quiz already submitted');
  }

  if (!Array.isArray(answers) || answers.length !== quiz.questions.length) {
    res.statusCode = 400;
    throw new Error(`Expected ${quiz.questions.length} answers`);
  }

  let score = 0;
  quiz.questions.forEach((q, i) => {
    if (answers[i] === q.correctIndex) score++;
  });

  quiz.userAnswers = answers;
  quiz.score = score;
  quiz.completed = true;
  await quiz.save();

  res.status(200).json({
    status: 'success',
    data: {
      score,
      totalQuestions: quiz.questions.length,
      percentage: Math.round((score / quiz.questions.length) * 100),
      review: quiz.questions.map((q, index) => ({
        question: q.question,
        options: q.options,
        correctIndex: q.correctIndex,
        userAnswer: answers[index],
        explanation: q.explanation,
        isCorrect: answers[index] === q.correctIndex
      }))
    },
  });
});

module.exports = {
  getSummary,
  getFlashcardSets,
  getQuizResults,
  getStudyPlans,
  submitQuiz,
};