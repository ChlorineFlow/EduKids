const express = require('express');
const prisma = require('../config/prisma');
const { authenticate, requireRole } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();
router.use(authenticate, requireRole('ADMIN'));

// GET /api/admin/overview
router.get('/overview', async (req, res) => {
  try {
    const [students, teachers, subjects, quizzes, contents] = await Promise.all([
      prisma.student.count(),
      prisma.teacher.count(),
      prisma.subject.count(),
      prisma.quiz.count(),
      prisma.content.count()
    ]);

    const recentStudents = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      include: { student: true },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    res.json({ success: true, data: { stats: { students, teachers, subjects, quizzes, contents }, recentStudents } });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const { role } = req.query;
    const where = role ? { role: role.toUpperCase() } : {};
    const users = await prisma.user.findMany({
      where,
      include: { student: true, teacher: true },
      orderBy: { createdAt: 'desc' }
    });
    const usersWithoutPasswords = users.map(({ password, ...u }) => u);
    res.json({ success: true, data: usersWithoutPasswords });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/admin/subjects/add
router.post('/subjects/add', [
  body('name').trim().isLength({ min: 2 }),
  body('class').isInt({ min: 1, max: 6 }),
  body('isLang').optional().isBoolean(),
  body('icon').optional().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ success: false, errors: errors.array() });

    const { name, nameHi, namePa, class: classLevel, isLang, icon } = req.body;
    const subject = await prisma.subject.create({
      data: {
        name, nameHi: nameHi || '', namePa: namePa || '',
        class: parseInt(classLevel),
        isLang: isLang || false,
        icon: icon || '📚'
      }
    });

    res.status(201).json({ success: true, message: 'Subject added!', data: subject });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/admin/chapters/add
router.post('/chapters/add', [
  body('subjectId').isInt(),
  body('title').trim().isLength({ min: 3 }),
  body('order').optional().isInt({ min: 1 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ success: false, errors: errors.array() });

    const { subjectId, title, titleHi, titlePa, order } = req.body;
    const chapter = await prisma.chapter.create({
      data: {
        subjectId: parseInt(subjectId),
        title, titleHi: titleHi || '', titlePa: titlePa || '',
        order: order ? parseInt(order) : 1
      }
    });

    res.status(201).json({ success: true, message: 'Chapter added!', data: chapter });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/admin/content/add
router.post('/content/add', [
  body('chapterId').isInt(),
  body('text').trim().isLength({ min: 5 }),
  body('language').isIn(['en', 'hi', 'pa']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ success: false, errors: errors.array() });

    const { chapterId, text, videoUrl, language } = req.body;
    const content = await prisma.content.create({
      data: {
        chapterId: parseInt(chapterId),
        text, videoUrl: videoUrl || null, language
      }
    });

    res.status(201).json({ success: true, message: 'Content added!', data: content });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    // Find if user is a teacher
    const teacher = await prisma.teacher.findUnique({
      where: { userId }
    });

    // If teacher exists, delete their quizzes first
    if (teacher) {
      // Delete all quiz attempts and answers linked to teacher's quizzes
      const quizzes = await prisma.quiz.findMany({
        where: { teacherId: teacher.id }
      });

      for (const quiz of quizzes) {
        // Delete student answers for this quiz's attempts
        await prisma.studentAnswer.deleteMany({
          where: { attempt: { quizId: quiz.id } }
        });
        // Delete quiz attempts
        await prisma.quizAttempt.deleteMany({
          where: { quizId: quiz.id }
        });
        // Delete questions
        await prisma.question.deleteMany({
          where: { quizId: quiz.id }
        });
      }

      // Delete all quizzes by this teacher
      await prisma.quiz.deleteMany({
        where: { teacherId: teacher.id }
      });

      // Delete remarks by this teacher
      await prisma.remark.deleteMany({
        where: { teacherId: teacher.id }
      });
    }

    // Now safely delete the user (cascades to teacher record)
    await prisma.user.delete({ where: { id: userId } });

    res.json({ success: true, message: 'User and all related data deleted successfully' });
  } catch (e) {
    console.error('Delete user error:', e);
    res.status(500).json({ success: false, message: 'Server error: ' + e.message });
  }
});
// GET /api/admin/subjects/all — get ALL subjects across all classes
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

// GET /api/admin/content/chapter/:chapterId
router.get('/content/chapter/:chapterId', async (req, res) => {
  try {
    const contents = await prisma.content.findMany({
      where: { chapterId: parseInt(req.params.chapterId) },
      orderBy: { language: 'asc' }
    });
    res.json({ success: true, data: contents });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/admin/content/:id
router.put('/content/:id', async (req, res) => {
  try {
    const { text, videoUrl, language } = req.body;
    if (!text) return res.status(400).json({ success: false, message: 'Text required' });
    const updated = await prisma.content.update({
      where: { id: parseInt(req.params.id) },
      data: { text, videoUrl: videoUrl || null, language }
    });
    res.json({ success: true, message: 'Updated!', data: updated });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/admin/content/:id
router.delete('/content/:id', async (req, res) => {
  try {
    await prisma.content.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true, message: 'Deleted!' });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
// GET /api/admin/chapters/subject/:subjectId — get chapters for any subject
router.get('/chapters/subject/:subjectId', async (req, res) => {
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
module.exports = router;
