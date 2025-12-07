import express from 'express';
import authController from '../controller/auth.controller.js';
import { 
  validateUserRegistration,
  validateUserLogin,
  validateOtpVerification,
  validateSendOtp,
  validateRefreshToken,
  validateForgotPassword,
  validateResetPassword,
} from '../middleware/validation.js';

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (Google auth or send OTP for phone auth)
 * @access  Public
 */
router.post('/register', validateUserRegistration, authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user (Google auth or phone with password)
 * @access  Public
 */
router.post('/login', validateUserLogin, authController.login);

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify OTP and complete phone registration
 * @access  Public
 */
router.post('/verify-otp', validateOtpVerification, authController.verifyOtp);


/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh access token using refresh token
 * @access  Public
 */
router.post('/refresh-token', validateRefreshToken, authController.refreshToken);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send OTP for password reset
 * @access  Public
 */
router.post('/forgot-password', validateForgotPassword, authController.forgotPassword);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with OTP verification
 * @access  Public
 */
router.post('/reset-password', validateResetPassword, authController.resetPassword);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout the user
 * @access  Public
 */
router.post('/logout', authController.logout)

export default router;
