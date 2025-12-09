import userRepository from '../repository/user.repo.js';
import otpRepository from '../repository/otp.repo.js';
import { AUTH_TYPES, HTTP_STATUS, MESSAGES, USER_STATUS } from '../constants/index.js';
import { generateTokenPair, verifyRefreshToken } from '../helpers/jwt.js';
import { generateOtp, generateRegistrationOtpMessage, generatePasswordResetOtpMessage } from '../helpers/otp.helper.js';
import { verifyGoogleToken } from '../helpers/googleAuth.helper.js';

class AuthController {
   constructor() {
    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.verifyOtp = this.verifyOtp.bind(this);
    this.refreshToken = this.refreshToken.bind(this);
    this.forgotPassword = this.forgotPassword.bind(this);
    this.resetPassword = this.resetPassword.bind(this);
    this.changePassword = this.changePassword.bind(this);
    this.logout = this.logout.bind(this);
  }

  /**
   * Register a new user
   */
  async register(req, res) {
    try {
      const { authType, userType, googleToken } = req.body;
      let email, googleId, name;
      // Check for duplicate users

      if (authType === AUTH_TYPES.GOOGLE) {
        // Validate Google authentication
        if (googleToken) {
          // Verify Google token
          const tokenResult = await verifyGoogleToken(googleToken);
          if (!tokenResult.success) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
              success: false,
              message: MESSAGES.ERROR.GOOGLE_AUTH_FAILED,
            });
          }
          console.log(tokenResult,'the token result in register')
          googleId = tokenResult.data.uid;
          email = tokenResult.data.email;
          name = tokenResult.data.name;
        }
        console.log(email,'the email in register')
        if (email) {
          const existingEmailResult = await userRepository.findByEmailAndUserType(email,userType);
          if (existingEmailResult.success && existingEmailResult.data) {
           // Generate tokens
        const tokens = generateTokenPair({
          id: existingEmailResult.data._id,
          userType: existingEmailResult.data.userType,
          authType: existingEmailResult.data.authType
        });

        // Remove password from response
        const userResponse = existingEmailResult.data.toObject();
        delete userResponse.password;

        return res.status(HTTP_STATUS.OK).json({
          success: true,
          message: MESSAGES.SUCCESS.USER_REGISTERED,
          data: {
            user: userResponse,
            ...tokens,
          },
        });
          }
        }

        // For Google auth, register user directly
        const userData = {
          authType,
          userType,
          email,
          name,
          googleId,
          isEmailVerified: true
        };

        const result = await userRepository.createUser(userData);
        
        if (!result.success) {
          return res.status(result.statusCode).json({
            success: false,
            message: result.error,
          });
        }

        // Generate tokens
        const tokens = generateTokenPair({
          id: result.data._id,
          userType: result.data.userType,
          authType: result.data.authType
        });

        // Remove password from response
        const userResponse = result.data.toObject();
        delete userResponse.password;

        return res.status(HTTP_STATUS.CREATED).json({
          success: true,
          message: MESSAGES.SUCCESS.USER_REGISTERED,
          data: {
            user: userResponse,
            ...tokens,
          },
        });

      } 

    } catch (error) {
      console.error('Registration error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: MESSAGES.ERROR.INTERNAL_SERVER_ERROR,
        error: error.message,
      });
    }
  }

  /**
   * Login user
   */
  async login(req, res) {
    try {
      const { authType, email, phone, password, googleId, googleToken,userType } = req.body;

      let user = null;
      
      if (authType === 'google') {
        // Google authentication
        let validatedGoogleId = googleId;
        
        if (googleToken) {
          // Verify Google token
          const tokenResult = await verifyGoogleToken(googleToken);
          if (!tokenResult.success) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
              success: false,
              message: MESSAGES.ERROR.GOOGLE_AUTH_FAILED,
            });
          }
          
          validatedGoogleId = tokenResult.data.uid;
          
        }
        
        const result = await userRepository.findByGoogleIdAndUserType(validatedGoogleId,userType);
        console.log(authType,'the user type',result)
        console.log(result,'the result from userrepository')
        if (!result.success || !result.data) {
          return res.status(HTTP_STATUS.UNAUTHORIZED).json({
            success: false,
            message: MESSAGES.ERROR.EMAIL_NOT_FOUND,
          });
        }

        user = result.data;
      } else if (authType === 'phone') {
        // Phone authentication with password
        const result = await userRepository.findByPhoneWithPassword(phone,userType);
        
        if (!result.success || !result.data) {
          return res.status(HTTP_STATUS.UNAUTHORIZED).json({
            success: false,
            message: MESSAGES.ERROR.PHONE_NOT_FOUND,
          });
        }

        user = result.data;

        // Verify password
        const isPasswordValid = await userRepository.comparePassword(password, user.password);
        
        if (!isPasswordValid) {
          return res.status(HTTP_STATUS.UNAUTHORIZED).json({
            success: false,
            message: MESSAGES.ERROR.INVALID_CREDENTIALS,
          });
        }
      }

      // Check if user is active
      if (user.status !== 'active') {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: MESSAGES.ERROR.ACCOUNT_INACTIVE,
        });
      }

      // Update last login
      await userRepository.updateLastLogin(user._id);

      // Generate tokens
      const tokens = generateTokenPair({
        id: user._id,
        userType: user.userType,
        authType: user.authType
      });

      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.USER_LOGGED_IN,
        data: {
          user: userResponse,
          ...tokens,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: MESSAGES.ERROR.INTERNAL_SERVER_ERROR,
        error: error.message,
      });
    }
  }

  /**
   * Verify OTP and complete registration
   */
  async verifyOtp(req, res) {
    try {
      const { phone,email, otp, userType, password } = req.body;
      console.log(req.body)
      // Verify OTP
      const otpResult = await otpRepository.verifyOtp(phone, otp);
      
      if (!otpResult.success) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.ERROR.INVALID_OTP,
        });
      }

      // Check if user already exists
      const existingUserResult = await userRepository.findByPhoneAndUserType(phone,userType);
      if (existingUserResult.success && existingUserResult.data) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.ERROR.DUPLICATE_PHONE,
        });
      }

      // Create new user
      const userData = {
        authType: AUTH_TYPES.PHONE,
        userType,
        phone,
        password,
        email,
        isPhoneVerified: true
      };

      const result = await userRepository.createUser(userData);
      
      if (!result.success) {
        return res.status(result.statusCode).json({
          success: false,
          message: result.error,
        });
      }

      // Generate tokens
      const tokens = generateTokenPair({
        id: result.data._id,
        userType: result.data.userType,
        authType: result.data.authType
      });

      // Remove password from response
      const userResponse = result.data.toObject();
      delete userResponse.password;

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: MESSAGES.SUCCESS.USER_REGISTERED,
        data: {
          user: userResponse,
          ...tokens,
        },
      });
    } catch (error) {
      console.error('OTP verification error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: MESSAGES.ERROR.INTERNAL_SERVER_ERROR,
        error: error.message,
      });
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      // Verify refresh token
      const decoded = verifyRefreshToken(refreshToken);
      
      // Find user
      const result = await userRepository.findById(decoded.id);
      
      if (!result.success || !result.data) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: MESSAGES.ERROR.USER_NOT_FOUND,
        });
      }

      const user = result.data;

      // Check if user is active
      if (user.status !== USER_STATUS.ACTIVE) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: MESSAGES.ERROR.ACCOUNT_INACTIVE,
        });
      }

      // Update last login
      await userRepository.updateLastLogin(user._id);

      // Generate new tokens
      const tokens = generateTokenPair({
        id: user._id,
        userType: user.userType,
        authType: user.authType
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.TOKENS_REFRESHED,
        data: tokens,
      });
    } catch (error) {
      console.error('Refresh token error:', error);
      if (error.message.includes('expired')) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: MESSAGES.ERROR.REFRESH_TOKEN_EXPIRED,
        });
      }
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: MESSAGES.ERROR.INVALID_REFRESH_TOKEN,
      });
    }
  }

  /**
   * Forgot password - send OTP
   */
  async forgotPassword(req, res) {
    try {
      const { phone,userType } = req.body;

      let user = null;

      if (phone) {
        const result = await userRepository.findByPhoneAndUserType(phone,userType);
        if (result.success && result.data) {
          user = result.data;
        }
      }

      if (!user) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: MESSAGES.ERROR.USER_NOT_FOUND,
        });
      }

      if (user.authType !== AUTH_TYPES.PHONE) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.ERROR.PASSWORD_RESET_ONLY_FOR_PHONE,
        });
      }

      // Generate and store OTP
      const otp = generateOtp();
      const otpResult = await otpRepository.createOtp(user.phone, otp);
      
      if (!otpResult.success) {
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: MESSAGES.ERROR.OTP_NOT_SENT,
        });
      }

      // Send OTP via SMS
      try {
        const message = generatePasswordResetOtpMessage(otp);
        await sendWhatsapp(user.phone, message);
      } catch (smsError) {
        console.error('SMS sending failed:', smsError);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: MESSAGES.ERROR.OTP_NOT_SENT,
        });
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.OTP_SENT,
        data: {
          phone: user.phone,
          message: 'OTP sent successfully for password reset.'
        },
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: MESSAGES.ERROR.INTERNAL_SERVER_ERROR,
        error: error.message,
      });
    }
  }

  /**
   * Reset password with OTP verification
   */
  async resetPassword(req, res) {
    try {
      const { phone, otp, newPassword,userType } = req.body;
      
      // Verify OTP
      const otpResult = await otpRepository.verifyOtp(phone, otp);
      
      if (!otpResult.success) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.ERROR.INVALID_OTP,
        });
      }

      // Find user
      const result = await userRepository.findByPhoneAndUserType(phone,userType);
      
      if (!result.success || !result.data) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: MESSAGES.ERROR.USER_NOT_FOUND,
        });
      }

      // Update password
      const updateResult = await userRepository.updatePassword(result.data._id, newPassword);
      
      if (!updateResult.success) {
        return res.status(updateResult.statusCode).json({
          success: false,
          message: updateResult.error,
        });
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.PASSWORD_RESET,
      });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: MESSAGES.ERROR.INTERNAL_SERVER_ERROR,
        error: error.message,
      });
    }
  }

  /**
   * Change user password
   */
  async changePassword(req, res) {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;

      // Find user with password
      const result = await userRepository.findByIdWithPassword(userId);
      
      if (!result.success || !result.data) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: MESSAGES.ERROR.USER_NOT_FOUND,
        });
      }

      const user = result.data;

      // Verify current password
      const isCurrentPasswordValid = await userRepository.comparePassword(currentPassword, user.password);
      
      if (!isCurrentPasswordValid) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: MESSAGES.ERROR.CURRENT_PASSWORD_INCORRECT,
        });
      }

      // Update password
      const updateResult = await userRepository.updatePassword(userId, newPassword);
      
      if (!updateResult.success) {
        return res.status(updateResult.statusCode).json({
          success: false,
          message: updateResult.error,
        });
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: MESSAGES.ERROR.INTERNAL_SERVER_ERROR,
        error: error.message,
      });
    }
  }

  /**
   * Logout user
   */
  async logout(req, res) {
    try {

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.USER_LOGGED_OUT,
      });
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: MESSAGES.ERROR.INTERNAL_SERVER_ERROR,
        error: error.message,
      });
    }
  }
}

export default new AuthController();
