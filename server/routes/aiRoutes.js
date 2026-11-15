const express = require('express');
const { body } = require('express-validator');
const { explain, flashcards, quiz, plan } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router.post(
  '/explain',
  [body('question').trim().isLength({ min: 3 }).withMessage('Question must be at least 3 characters')],
  validate,
  explain
);

router.post(
  '/flashcards',
  [body('notes').trim().isLength({ min: 50 }).withMessage('Notes must be at least 50 characters')],
  validate,
  flashcards
);

router.post(
  '/quiz',
  [body('topic').trim().isLength({ min: 3 }).withMessage('Topic must be at least 3 characters')],
  validate,
  quiz
);

router.post(
  '/plan',
  [body('subjects').isArray({ min: 1 }).withMessage('At least one subject is required')],
  validate,
  plan
);

module.exports = router;