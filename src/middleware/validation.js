import { body, validationResult } from 'express-validator';
import { HTTP_STATUS, MESSAGES } from '../constants/index.js';

/**
 * Middleware to handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: MESSAGES.ERROR.VALIDATION_ERROR,
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value,
      })),
    });
  }
  
  next();
};

/**
 * Validation rules for user registration
 */
const validateUserRegistration = [
  body('authType')
    .trim()
    .notEmpty()
    .withMessage('Auth Type is required')
    .isIn(['google', 'phone'])
    .withMessage('Auth Type must be either "google" or "phone"'),
    body('name').trim().notEmpty().withMessage('Name is required'),
  
  body('userType')
    .trim()
    .notEmpty()
    .withMessage('User Type is required')
    .isIn(['student', 'teacher', 'admin'])
    .withMessage('User Type must be either "student", "teacher", or "admin"'),
  
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('phone')
    .optional()
    .trim()
    .isLength({min: 10, max: 10})
    .withMessage('Phone number must be exactly 10 digits')
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone number must contain only digits'),
  
  body('googleId')
    .optional()
    .isString()
    .withMessage('Google ID must be a string')
    .isLength({ min: 1, max: 50 })
    .withMessage('Google ID must be between 1 and 50 characters'),
  
  body('googleToken')
    .optional()
    .isString()
    .withMessage('Google token must be a string'),

  // Custom validation for authType specific requirements
  body().custom((value, { req }) => {
    const { authType, email, phone, googleId, googleToken, password } = req.body;
    
    if (authType === 'google') {
      if (!googleToken) {
        throw new Error('Either Google ID or Google token is required for Google authentication');
      }
      if (!email) {
        throw new Error('Email is required for Google authentication');
      }
    } else if (authType === 'phone') {
      if (!phone) {
        throw new Error('Phone number is required for phone authentication');
      }
    }
    
    // Ensure at least one of phone or email is provided
    if (!phone && !email) {
      throw new Error('Either phone or email is required');
    }
    
    return true;
  }),

  handleValidationErrors,
];

/**
 * Validation rules for user login
 */
const validateUserLogin = [
  body('authType')
    .trim()
    .notEmpty()
    .withMessage('Auth Type is required')
    .isIn(['google', 'phone'])
    .withMessage('Auth Type must be either "google" or "phone"'),
  
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('phone')
    .optional()
    .trim()
    .isLength({min: 10, max: 10})
    .withMessage('Phone number must be exactly 10 digits')
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone number must contain only digits'),
  
  body('password')
    .optional()
    .notEmpty()
    .withMessage('Password is required'),
  
  
  body('googleToken')
    .optional()
    .isString()
    .withMessage('Google token must be a string'),

  // Custom validation for authType specific requirements
  body().custom((value, { req }) => {
    const { authType, email, phone, googleToken, password } = req.body;
    console.log('googleToken', googleToken);
    console.log('authType', authType);
    if (authType === 'google') {
      if (!googleToken) {
        throw new Error('Either Google ID or Google token is required for Google authentication');
      }
    } else if (authType === 'phone') {
      if (!phone) {
        throw new Error('Phone number is required for phone authentication');
      }
      if (!password) {
        throw new Error('Password is required for phone authentication');
      }
    }
    
    return true;
  }),
  
  handleValidationErrors,
];

/**
 * Validation rules for password update
 */
const validatePasswordUpdate = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  handleValidationErrors,
];


/**
 * Validation rules for OTP verification
 */
const validateOtpVerification = [
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .isLength({min: 10, max: 10})
    .withMessage('Phone number must be exactly 10 digits')
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone number must contain only digits'),
  
  body('otp')
    .trim()
    .notEmpty()
    .withMessage('OTP is required')
    .isLength({min: 4, max: 6})
    .withMessage('OTP must be between 4 and 6 digits')
    .matches(/^[0-9]+$/)
    .withMessage('OTP must contain only digits'),

   body('password')
    .notEmpty()
    .trim()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
   
   body('userType')
    .notEmpty()
    .withMessage('User type is required')
    .isIn(['employee', 'employer', 'admin'])
    .withMessage('User type must be either "employee", "employer", or "admin"'),
  
  handleValidationErrors,
];

/**
 * Validation rules for sending OTP
 */
const validateSendOtp = [
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .isLength({min: 10, max: 10})
    .withMessage('Phone number must be exactly 10 digits')
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone number must contain only digits'),
  
  handleValidationErrors,
];

/**
 * Validation rules for refresh token
 */
const validateRefreshToken = [
  body('refreshToken')
    .trim()
    .notEmpty()
    .withMessage('Refresh token is required'),
  
  handleValidationErrors,
];

/**
 * Validation rules for forgot password
 */
const validateForgotPassword = [
  body('phone')
    .optional()
    .trim()
    .isLength({min: 10, max: 10})
    .withMessage('Phone number must be exactly 10 digits')
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone number must contain only digits'),
  
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  // Custom validation to ensure at least one identifier is provided
  body().custom((value, { req }) => {
    const { phone, email } = req.body;
    
    if (!phone && !email) {
      throw new Error('Either phone or email is required');
    }
    
    return true;
  }),
  
  handleValidationErrors,
];

/**
 * Validation rules for reset password
 */
const validateResetPassword = [
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .isLength({min: 10, max: 10})
    .withMessage('Phone number must be exactly 10 digits')
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone number must contain only digits'),
  
  body('otp')
    .trim()
    .notEmpty()
    .withMessage('OTP is required')
    .isLength({min: 4, max: 6})
    .withMessage('OTP must be between 4 and 6 digits')
    .matches(/^[0-9]+$/)
    .withMessage('OTP must contain only digits'),
  
  body('newPassword')
    .trim()
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  handleValidationErrors,
];

/**
 * Validation rules for profile ID parameter
 */
const validateProfileId = [
  body('user_id')
    .isMongoId()
    .withMessage('Invalid user ID format'),
  
  handleValidationErrors,
];



export {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validatePasswordUpdate,
  validateOtpVerification,
  validateSendOtp,
  validateRefreshToken,
  validateForgotPassword,
  validateResetPassword,

};
