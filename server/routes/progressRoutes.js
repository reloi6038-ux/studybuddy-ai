const express = require('express');
const {
  getSummary,
  getFlashcardSets,
  getQuizResults,
  getStudyPlans,
  submitQuiz,
} = require('../controllers/progressController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/summary', getSummary);
router.get('/flashcards', getFlashcardSets);
router.get('/quizzes', getQuizResults);
router.get('/plans', getStudyPlans);
router.patch('/quiz/:id/submit', submitQuiz);

module.exports = router;