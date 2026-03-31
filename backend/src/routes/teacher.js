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
      by: ['class'], _count: { _all: true }
    });
    const languageStats = await prisma.student.groupBy({
      by: ['language'], _count: { _all: true }
    });
    const topStudents = await prisma.leaderboard.findMany({
      orderBy: { score: 'desc' }, take: 10,
      include: { student: { include: { user: { select: { name: true } } } } }
    });
    const weakStudents = await prisma.leaderboard.findMany({
      orderBy: { score: 'asc' }, take: 5,
      where: { score: { lt: 50 } },
      include: { student: { include: { user: { select: { name: true } } } } }
    });
    res.json({ success: true, data: { classStats, languageStats, topStudents, weakStudents } });
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
      where, include: { student: { include: { user: { select: { name: true } } } } },
      orderBy: { score: 'desc' }, take: 20
    });
    res.json({ success: true, data: board });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/teacher/remarks/add
router.post('/remarks/add', async (req, res) => {
  try {
    const { studentId, subjectId, remarkText } = req.body;
    if (!studentId || !subjectId || !remarkText) {
      return res.status(400).json({ success: false, message: 'All fields required' });
    }
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

// GET /api/teacher/subjects/all
router.get('/subjects/all', async (req, res) => {
  try {
    const subjects = await prisma.subject.findMany({
      orderBy: [{ class: 'asc' }, { id: 'asc' }]
    });
    res.json({ success: true, data: subjects });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/teacher/chapters/:subjectId
router.get('/chapters/:subjectId', async (req, res) => {
  try {
    const chapters = await prisma.chapter.findMany({
      where: { subjectId: parseInt(req.params.subjectId) },
      orderBy: { order: 'asc' }
    });
    res.json({ success: true, data: chapters });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/teacher/quiz/create
router.post('/quiz/create', async (req, res) => {
  try {
    const { subjectId, chapterId, title, description, timerMinutes, classLevel, language } = req.body;
    if (!subjectId || !title) {
      return res.status(400).json({ success: false, message: 'Subject and title required' });
    }
    const teacher = req.user.teacher;

    // Get subject to check if language subject
    const subject = await prisma.subject.findUnique({ where: { id: parseInt(subjectId) } });
    let quizLanguage = language || 'en';
    if (subject?.isLang) {
      if (subject.name.toLowerCase() === 'hindi') quizLanguage = 'hi';
      else if (subject.name.toLowerCase() === 'english') quizLanguage = 'en';
      else if (subject.name.toLowerCase() === 'punjabi') quizLanguage = 'pa';
    }

    const quiz = await prisma.quiz.create({
      data: {
        subjectId: parseInt(subjectId),
        chapterId: chapterId ? parseInt(chapterId) : null,
        teacherId: teacher.id,
        title,
        description: description || null,
        timerMinutes: timerMinutes ? parseInt(timerMinutes) : null,
        classLevel: parseInt(classLevel) || 1,
        isPublished: false
      }
    });
    res.status(201).json({ success: true, message: 'Quiz created!', data: { ...quiz, language: quizLanguage } });
  } catch (e) {
    console.error('Create quiz error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/teacher/questions/add — SINGLE UNIFIED ROUTE
router.post('/questions/add', async (req, res) => {
  try {
    const {
      quizId, questionType, question,
      option1, option2, option3, option4,
      correctAnswer, matchPairs, marks, order
    } = req.body;

    if (!quizId || !question) {
      return res.status(400).json({ success: false, message: 'Quiz ID and question text are required' });
    }

    const validTypes = ['MCQ', 'FILL_IN_BLANK', 'DESCRIPTIVE', 'MATCH_THE_FOLLOWING'];
    const qType = validTypes.includes(questionType) ? questionType : 'MCQ';

    const q = await prisma.question.create({
      data: {
        quizId: parseInt(quizId),
        questionType: qType,
        question: question.trim(),
        option1: option1 ? option1.trim() : null,
        option2: option2 ? option2.trim() : null,
        option3: option3 ? option3.trim() : null,
        option4: option4 ? option4.trim() : null,
        correctAnswer: correctAnswer ? correctAnswer.trim() : null,
        matchPairs: matchPairs ? matchPairs.trim() : null,
        marks: parseInt(marks) || 1,
        order: parseInt(order) || 1
      }
    });

    res.status(201).json({ success: true, message: 'Question added!', data: q });
  } catch (e) {
    console.error('Add question error:', e.message, e);
    res.status(500).json({ success: false, message: 'Server error: ' + e.message });
  }
});

// DELETE /api/teacher/quiz/:quizId — delete quiz
router.delete('/quiz/:quizId', async (req, res) => {
  try {
    const teacher = req.user.teacher;
    const quiz = await prisma.quiz.findUnique({ where: { id: parseInt(req.params.quizId) } });
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
    if (quiz.teacherId !== teacher.id) return res.status(403).json({ success: false, message: 'Not authorized' });
    await prisma.quiz.delete({ where: { id: parseInt(req.params.quizId) } });
    res.json({ success: true, message: 'Quiz deleted!' });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/teacher/quiz/:quizId — edit quiz
router.put('/quiz/:quizId', async (req, res) => {
  try {
    const { title, description, timerMinutes } = req.body;
    const updated = await prisma.quiz.update({
      where: { id: parseInt(req.params.quizId) },
      data: {
        title: title || undefined,
        description: description !== undefined ? description : undefined,
        timerMinutes: timerMinutes ? parseInt(timerMinutes) : null
      }
    });
    res.json({ success: true, message: 'Quiz updated!', data: updated });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/teacher/quiz/publish/:quizId
router.post('/quiz/publish/:quizId', async (req, res) => {
  try {
    const quiz = await prisma.quiz.update({
      where: { id: parseInt(req.params.quizId) },
      data: { isPublished: true }
    });
    res.json({ success: true, message: 'Quiz published! Students can now take it.', data: quiz });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/teacher/my-quizzes
router.get('/my-quizzes', async (req, res) => {
  try {
    const teacher = req.user.teacher;
    const quizzes = await prisma.quiz.findMany({
      where: { teacherId: teacher.id },
      include: {
        subject: true,
        chapter: true,
        questions: true,
        _count: { select: { questions: true, attempts: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: quizzes });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/teacher/quiz/:quizId/attempts
router.get('/quiz/:quizId/attempts', async (req, res) => {
  try {
    const attempts = await prisma.quizAttempt.findMany({
      where: { quizId: parseInt(req.params.quizId) },
      include: {
        student: { include: { user: { select: { name: true } } } },
        answers: {
          include: { question: true },
          orderBy: { id: 'asc' }
        }
      },
      orderBy: { submittedAt: 'desc' }
    });
    res.json({ success: true, data: attempts });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/teacher/answer/review
router.put('/answer/review', async (req, res) => {
  try {
    const { answerId, marksObtained, isCorrect, teacherComment } = req.body;

    const answer = await prisma.studentAnswer.update({
      where: { id: parseInt(answerId) },
      data: {
        marksObtained: parseInt(marksObtained) || 0,
        isCorrect: isCorrect,
        teacherComment: teacherComment || null,
        teacherReviewed: true
      }
    });

    // Recalculate attempt totals
    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: answer.attemptId },
      include: {
        answers: true,
        quiz: { include: { questions: true } }
      }
    });

    const totalMarks = attempt.quiz.questions.reduce((sum, q) => sum + q.marks, 0);
    const earnedMarks = attempt.answers.reduce((sum, a) => sum + a.marksObtained, 0);
    const percentage = totalMarks > 0 ? Math.round((earnedMarks / totalMarks) * 100) : 0;
    const stars = percentage >= 90 ? 3 : percentage >= 60 ? 2 : percentage >= 30 ? 1 : 0;

    await prisma.quizAttempt.update({
      where: { id: answer.attemptId },
      data: { earnedMarks, percentage, stars }
    });

    res.json({ success: true, message: 'Answer reviewed!', data: answer });
  } catch (e) {
    console.error('Review error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/teacher/attempt/finalize/:attemptId
router.put('/attempt/finalize/:attemptId', async (req, res) => {
  try {
    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: parseInt(req.params.attemptId) },
      include: {
        answers: true,
        quiz: { include: { questions: true } }
      }
    });

    if (!attempt) return res.status(404).json({ success: false, message: 'Attempt not found' });

    const totalMarks = attempt.quiz.questions.reduce((sum, q) => sum + q.marks, 0);
    const earnedMarks = attempt.answers.reduce((sum, a) => sum + a.marksObtained, 0);
    const percentage = totalMarks > 0 ? Math.round((earnedMarks / totalMarks) * 100) : 0;
    const stars = percentage >= 90 ? 3 : percentage >= 60 ? 2 : percentage >= 30 ? 1 : 0;
    const badges = percentage === 100 ? 1 : 0;

    await prisma.quizAttempt.update({
      where: { id: parseInt(req.params.attemptId) },
      data: { earnedMarks, totalMarks, percentage, stars, isReviewed: true }
    });

    // Update leaderboard
    await prisma.leaderboard.upsert({
      where: { studentId: attempt.studentId },
      update: {
        score: { increment: earnedMarks },
        stars: { increment: stars },
        badges: { increment: badges }
      },
      create: {
        studentId: attempt.studentId,
        class: 1,
        score: earnedMarks,
        stars,
        badges
      }
    });

    res.json({
      success: true,
      message: `✅ Marks awarded! Student scored ${earnedMarks}/${totalMarks} (${percentage}%)`,
      data: { earnedMarks, totalMarks, percentage, stars }
    });
  } catch (e) {
    console.error('Finalize error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/teacher/question/:questionId
router.delete('/question/:questionId', async (req, res) => {
  try {
    await prisma.question.delete({ where: { id: parseInt(req.params.questionId) } });
    res.json({ success: true, message: 'Question deleted!' });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;