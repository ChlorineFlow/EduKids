const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg }))
    });
  }
  next();
};

const studentSignupValidation = [
  body('name')
    .trim()
    .matches(/^[A-Za-z\s]+$/).withMessage('Name must contain only alphabets')
    .isLength({ min: 3 }).withMessage('Name must be at least 3 characters'),

  body('age')
    .isInt({ min: 5, max: 15 }).withMessage('Age must be between 5 and 15'),

  body('dob')
    .isDate().withMessage('Invalid date of birth')
    .custom((val) => {
      if (new Date(val) >= new Date()) throw new Error('Date of birth must be in the past');
      return true;
    }),

  body('parentName')
    .trim()
    .notEmpty().withMessage('Guardian name is required')
    .matches(/^[A-Za-z\s]+$/).withMessage('Guardian name must contain only alphabets'),

  body('email')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),

  body('phone')
    .matches(/^\d{10}$/).withMessage('Phone number must be exactly 10 digits'),

  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/\d/).withMessage('Password must contain at least one number'),

  handleValidationErrors
];

const loginValidation = [
  body('email').isEmail().withMessage('Invalid email format').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

const otpValidation = [
  body('email').isEmail().withMessage('Invalid email'),
  body('otp')
    .isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
    .isNumeric().withMessage('OTP must be numeric'),
  handleValidationErrors
];

const teacherSignupValidation = [
  body('name')
    .trim()
    .matches(/^[A-Za-z\s]+$/).withMessage('Name must contain only alphabets')
    .isLength({ min: 3 }).withMessage('Name must be at least 3 characters'),
  body('email').isEmail().withMessage('Invalid email format').normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/\d/).withMessage('Password must contain at least one number'),
  handleValidationErrors
];

module.exports = {
  studentSignupValidation,
  loginValidation,
  otpValidation,
  teacherSignupValidation,
  handleValidationErrors
};
