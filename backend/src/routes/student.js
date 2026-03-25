const express = require('express');
const prisma = require('../config/prisma');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// All student routes require authentication
router.use(authenticate, requireRole('STUDENT'));

// GET /api/student/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const student = req.user.student;
    const leaderboard = await prisma.leaderboard.findUnique({
      where: { studentId: student.id }
    });

    const progress = await prisma.progress.findMany({
      where: { studentId: student.id },
      include: { subject: true }
    });

    const totalAnswers = await prisma.studentAnswer.count({
      where: { studentId: student.id }
    });

    const correctAnswers = await prisma.studentAnswer.count({
      where: { studentId: student.id, marksObtained: { gt: 0 } }
    });

    res.json({
      success: true,
      data: {
        student: { ...student, name: req.user.name, email: req.user.email },
        leaderboard,
        progress,
        stats: { totalAnswers, correctAnswers, accuracy: totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0 }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/student/subjects
router.get('/subjects', async (req, res) => {
  try {
    const student = req.user.student;
    const subjects = await prisma.subject.findMany({
      where: { class: student.class },
      include: {
        _count: { select: { chapters: true } }
      }
    });

    res.json({ success: true, data: subjects });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/student/chapters/:subjectId
router.get('/chapters/:subjectId', async (req, res) => {
  try {
    const chapters = await prisma.chapter.findMany({
      where: { subjectId: parseInt(req.params.subjectId) },
      orderBy: { order: 'asc' }
    });

    res.json({ success: true, data: chapters });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/student/content/:chapterId
router.get('/content/:chapterId', async (req, res) => {
  try {
    const student = req.user.student;
    const chapter = await prisma.chapter.findUnique({
      where: { id: parseInt(req.params.chapterId) },
      include: { subject: true }
    });

    if (!chapter) return res.status(404).json({ success: false, message: 'Chapter not found' });

    // Language logic: language subjects are never translated
    let language = student.language;
    if (chapter.subject.isLang) {
      // For Hindi subject, use hi; for English, use en
      if (chapter.subject.name.toLowerCase() === 'hindi') language = 'hi';
      else if (chapter.subject.name.toLowerCase() === 'english') language = 'en';
    }

    const content = await prisma.content.findMany({
      where: { chapterId: parseInt(req.params.chapterId), language }
    });

    // Fallback to English if no content in selected language
    let finalContent = content;
    if (content.length === 0) {
      finalContent = await prisma.content.findMany({
        where: { chapterId: parseInt(req.params.chapterId), language: 'en' }
      });
    }

    // Update progress
    await prisma.progress.upsert({
      where: { studentId_subjectId: { studentId: student.id, subjectId: chapter.subjectId } },
      update: { completionPercentage: { increment: 5 }, updatedAt: new Date() },
      create: { studentId: student.id, subjectId: chapter.subjectId, completionPercentage: 10 }
    });

    res.json({ success: true, data: finalContent, language });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/student/quizzes/:subjectId
router.get('/quizzes/:subjectId', async (req, res) => {
  try {
    const student = req.user.student;
    const quizzes = await prisma.quiz.findMany({
      where: { subjectId: parseInt(req.params.subjectId) },
      include: {
        teacher: { include: { user: { select: { name: true } } } },
        _count: { select: { questions: true } }
      }
    });

    res.json({ success: true, data: quizzes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/student/quiz/:quizId
router.get('/quiz/:quizId', async (req, res) => {
  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: parseInt(req.params.quizId) },
      include: {
        questions: true,
        subject: true
      }
    });

    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

    // Hide correct answers
    const questions = quiz.questions.map(q => {
      const { correctAnswer, ...rest } = q;
      return rest;
    });

    res.json({ success: true, data: { ...quiz, questions } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/student/quiz/attempt
router.post('/quiz/attempt', async (req, res) => {
  try {
    const student = req.user.student;
    const { quizId, answers } = req.body; // answers: [{questionId, answer}]

    if (!quizId || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: 'Invalid request' });
    }

    const questions = await prisma.question.findMany({
      where: { quizId: parseInt(quizId) }
    });

    let totalMarks = 0;
    let earnedMarks = 0;
    const results = [];

    for (const ans of answers) {
      const question = questions.find(q => q.id === ans.questionId);
      if (!question) continue;

      const isCorrect = question.correctAnswer === ans.answer;
      const marksObtained = isCorrect ? question.marks : 0;

      totalMarks += question.marks;
      earnedMarks += marksObtained;

      await prisma.studentAnswer.create({
        data: {
          studentId: student.id,
          questionId: question.id,
          answer: ans.answer,
          marksObtained
        }
      });

      results.push({
        questionId: question.id,
        yourAnswer: ans.answer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        marksObtained
      });
    }

    const percentage = totalMarks > 0 ? Math.round((earnedMarks / totalMarks) * 100) : 0;
    const stars = percentage >= 90 ? 3 : percentage >= 60 ? 2 : percentage >= 30 ? 1 : 0;

    // Update leaderboard
    await prisma.leaderboard.upsert({
      where: { studentId: student.id },
      update: {
        score: { increment: earnedMarks },
        stars: { increment: stars }
      },
      create: { studentId: student.id, class: student.class, score: earnedMarks, stars }
    });

    // Award badge if 100%
    if (percentage === 100) {
      await prisma.leaderboard.update({
        where: { studentId: student.id },
        data: { badges: { increment: 1 } }
      });
    }

    res.json({
      success: true,
      data: {
        results,
        summary: { totalMarks, earnedMarks, percentage, stars, badges: percentage === 100 ? 1 : 0 }
      }
    });
  } catch (error) {
    console.error('Quiz attempt error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/student/remarks
router.get('/remarks', async (req, res) => {
  try {
    const student = req.user.student;
    const remarks = await prisma.remark.findMany({
      where: { studentId: student.id },
      include: {
        subject: true,
        teacher: { include: { user: { select: { name: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: remarks });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/student/settings
router.put('/settings', async (req, res) => {
  try {
    const student = req.user.student;
    const { language, class: classLevel } = req.body;

    const updateData = {};
    if (language && ['en', 'hi', 'pa'].includes(language)) updateData.language = language;
    if (classLevel && classLevel >= 1 && classLevel <= 6) updateData.class = parseInt(classLevel);

    const updated = await prisma.student.update({
      where: { id: student.id },
      data: updateData
    });

    res.json({ success: true, message: 'Settings updated', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/student/leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const student = req.user.student;
    const board = await prisma.leaderboard.findMany({
      where: { class: student.class },
      include: { student: { include: { user: { select: { name: true } } } } },
      orderBy: { score: 'desc' },
      take: 10
    });

    res.json({ success: true, data: board });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
