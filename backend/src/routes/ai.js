const express = require('express');
const { authenticate } = require('../middleware/auth');
const { askGemini, getQuizHint } = require('../services/geminiService');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Stricter rate limit for AI endpoints
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: { success: false, message: 'Too many AI requests. Please wait a moment.' }
});

// POST /api/ai/chat
router.post('/chat', authenticate, aiLimiter, [
  body('question').trim().isLength({ min: 2, max: 500 }).withMessage('Question must be 2-500 characters'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ success: false, errors: errors.array() });

    const { question, subject } = req.body;
    const student = req.user.student;
    const classLevel = student?.class || 3;
    const language = student?.language || 'en';

    const answer = await askGemini(question, classLevel, subject, language);

    res.json({ success: true, data: { question, answer, language } });
  } catch (error) {
    console.error('AI chat error:', error);
    if (error.message?.includes('GEMINI_API_KEY')) {
      return res.status(503).json({ success: false, message: 'AI assistant is not configured. Please add GEMINI_API_KEY.' });
    }
    res.status(500).json({ success: false, message: 'AI assistant is taking a break. Please try again!' });
  }
});

// POST /api/ai/hint
router.post('/hint', authenticate, aiLimiter, [
  body('question').trim().notEmpty(),
  body('options').isArray({ min: 2 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ success: false, errors: errors.array() });

    const { question, options } = req.body;
    const student = req.user.student;
    const classLevel = student?.class || 3;
    const language = student?.language || 'en';

    const hint = await getQuizHint(question, options, classLevel, language);

    res.json({ success: true, data: { hint } });
  } catch (error) {
    console.error('AI hint error:', error);
    res.status(500).json({ success: false, message: 'Could not get hint right now.' });
  }
});

module.exports = router;
