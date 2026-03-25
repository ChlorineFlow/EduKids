const express = require('express');
const prisma = require('../config/prisma');
const { authenticate, requireRole } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();
router.use(authenticate, requireRole('TEACHER'));

// GET /api/teacher/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const teacher = req.user.teacher;
    const quizCount = await prisma.quiz.count({ where: { teacherId: teacher.id } });
    const remarkCount = await prisma.remark.count({ where: { teacherId: teacher.id } });

    const students = await prisma.student.findMany({
      include: { user: { select: { name: true, email: true } }, leaderboard: true }
    });

    res.json({
      success: true,
      data: { stats: { quizCount, remarkCount, studentCount: students.length }, students: students.slice(0, 5) }
    });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/teacher/students
router.get('/students', async (req, res) => {
  try {
    const { classFilter } = req.query;
    const where = classFilter ? { class: parseInt(classFilter) } : {};

    const students = await prisma.student.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        leaderboard: true,
        progress: { include: { subject: true } },
        remarks: { include: { teacher: { include: { user: { select: { name: true } } } } } }
      },
      orderBy: { class: 'asc' }
    });

    res.json({ success: true, data: students });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/teacher/analytics
router.get('/analytics', async (req, res) => {
  try {
    const classStats = await prisma.student.groupBy({
      by: ['class'],
      _count: { _all: true }
    });

    const languageStats = await prisma.student.groupBy({
      by: ['language'],
      _count: { _all: true }
    });

    const topStudents = await prisma.leaderboard.findMany({
      orderBy: { score: 'desc' },
      take: 10,
      include: {
        student: { include: { user: { select: { name: true } } } }
      }
    });

    const weakStudents = await prisma.leaderboard.findMany({
      orderBy: { score: 'asc' },
      take: 5,
      where: { score: { lt: 50 } },
      include: {
        student: { include: { user: { select: { name: true } } } }
      }
    });

    res.json({ success: true, data: { classStats, languageStats, topStudents, weakStudents } });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/teacher/quiz/create
router.post('/quiz/create', [
  body('subjectId').isInt(),
  body('title').trim().isLength({ min: 3 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ success: false, errors: errors.array() });

    const { subjectId, chapterId, title } = req.body;
    const teacher = req.user.teacher;

    const quiz = await prisma.quiz.create({
      data: {
        subjectId: parseInt(subjectId),
        chapterId: chapterId ? parseInt(chapterId) : null,
        teacherId: teacher.id,
        title
      }
    });

    res.status(201).json({ success: true, message: 'Quiz created!', data: quiz });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/teacher/questions/add
router.post('/questions/add', [
  body('quizId').isInt(),
  body('question').trim().isLength({ min: 5 }),
  body('option1').trim().notEmpty(),
  body('option2').trim().notEmpty(),
  body('option3').trim().notEmpty(),
  body('option4').trim().notEmpty(),
  body('correctAnswer').trim().notEmpty(),
  body('marks').optional().isInt({ min: 1 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ success: false, errors: errors.array() });

    const { quizId, question, option1, option2, option3, option4, correctAnswer, marks } = req.body;

    const q = await prisma.question.create({
      data: {
        quizId: parseInt(quizId),
        question, option1, option2, option3, option4, correctAnswer,
        marks: marks ? parseInt(marks) : 1
      }
    });

    res.status(201).json({ success: true, message: 'Question added!', data: q });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/teacher/remarks/add
router.post('/remarks/add', [
  body('studentId').isInt(),
  body('subjectId').isInt(),
  body('remarkText').trim().isLength({ min: 5 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ success: false, errors: errors.array() });

    const { studentId, subjectId, remarkText } = req.body;
    const teacher = req.user.teacher;

    const remark = await prisma.remark.create({
      data: {
        studentId: parseInt(studentId),
        subjectId: parseInt(subjectId),
        teacherId: teacher.id,
        remarkText
      },
      include: {
        student: { include: { user: { select: { name: true } } } },
        subject: true
      }
    });

    res.status(201).json({ success: true, message: 'Remark added!', data: remark });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/teacher/leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const { classFilter } = req.query;
    const where = classFilter ? { class: parseInt(classFilter) } : {};

    const board = await prisma.leaderboard.findMany({
      where,
      include: { student: { include: { user: { select: { name: true } } } } },
      orderBy: { score: 'desc' },
      take: 20
    });

    res.json({ success: true, data: board });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
