const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { generateOTP, sendOTPEmail } = require('../services/emailService');
const {
  studentSignupValidation,
  teacherSignupValidation,
  loginValidation,
  otpValidation,
} = require('../middleware/validation');

const router = express.Router();

// POST /api/auth/signup/student
router.post('/signup/student', studentSignupValidation, async (req, res) => {
  try {
    const { name, age, dob, parentName, email, phone, password } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'STUDENT',
        verified: false,
        student: {
          create: {
            age: parseInt(age),
            dob: new Date(dob),
            parentName,
            phone,
            class: 1,
            language: 'en',
          }
        }
      },
      include: { student: true }
    });

    // Generate and send OTP
    const otp = generateOTP();
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await prisma.otpVerification.deleteMany({ where: { email } });
    await prisma.otpVerification.create({ data: { email, otp, expiry } });

    try {
      await sendOTPEmail(email, otp, name);
    } catch (emailErr) {
      console.error('Email send failed:', emailErr.message);
      // In development, return OTP in response
      if (process.env.NODE_ENV !== 'production') {
        return res.status(201).json({
          success: true,
          message: 'Account created. OTP sent (dev mode: check response)',
          devOtp: otp,
          userId: user.id
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Account created! Please check your email for OTP verification.',
      userId: user.id
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ success: false, message: 'Server error during signup' });
  }
});

// POST /api/auth/signup/teacher
router.post('/signup/teacher', teacherSignupValidation, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name, email,
        password: hashedPassword,
        role: 'TEACHER',
        verified: false,
        teacher: { create: {} }
      },
      include: { teacher: true }
    });

    const otp = generateOTP();
    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.otpVerification.deleteMany({ where: { email } });
    await prisma.otpVerification.create({ data: { email, otp, expiry } });

    try {
      await sendOTPEmail(email, otp, name);
    } catch (e) {
      if (process.env.NODE_ENV !== 'production') {
        return res.status(201).json({ success: true, message: 'Teacher registered', devOtp: otp });
      }
    }

    res.status(201).json({ success: true, message: 'Teacher account created! Check email for OTP.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', otpValidation, async (req, res) => {
  try {
    const { email, otp } = req.body;

    const record = await prisma.otpVerification.findFirst({
      where: { email },
      orderBy: { createdAt: 'desc' }
    });

    if (!record) {
      return res.status(400).json({ success: false, message: 'No OTP found for this email' });
    }

    if (new Date() > record.expiry) {
      await prisma.otpVerification.delete({ where: { id: record.id } });
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    await prisma.user.update({
      where: { email },
      data: { verified: true }
    });

    await prisma.otpVerification.delete({ where: { id: record.id } });

    // Initialize leaderboard for student
    const user = await prisma.user.findUnique({
      where: { email },
      include: { student: true }
    });

    if (user?.student) {
      await prisma.leaderboard.upsert({
        where: { studentId: user.student.id },
        create: { studentId: user.student.id, class: user.student.class, score: 0, stars: 0, badges: 0 },
        update: {}
      });
    }

    res.json({ success: true, message: 'Email verified successfully! You can now login.' });
  } catch (error) {
    console.error('OTP verify error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/auth/resend-otp
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email required' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ success: false, message: 'Email not found' });
    if (user.verified) return res.status(400).json({ success: false, message: 'Email already verified' });

    const otp = generateOTP();
    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.otpVerification.deleteMany({ where: { email } });
    await prisma.otpVerification.create({ data: { email, otp, expiry } });

    try {
      await sendOTPEmail(email, otp, user.name);
    } catch (e) {
      if (process.env.NODE_ENV !== 'production') {
        return res.json({ success: true, message: 'OTP resent (dev)', devOtp: otp });
      }
    }

    res.json({ success: true, message: 'OTP resent to your email' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', loginValidation, async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { student: true, teacher: true, admin: true }
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.verified) {
      return res.status(403).json({ 
        success: false, 
        message: 'Please verify your email first',
        needsVerification: true,
        email 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/auth/me
const { authenticate } = require('../middleware/auth');
router.get('/me', authenticate, async (req, res) => {
  const { password: _, ...user } = req.user;
  res.json({ success: true, user });
});

module.exports = router;
