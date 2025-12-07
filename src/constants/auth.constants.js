export const MESSAGES = {
    SUCCESS: {
      USER_REGISTERED: 'User registered successfully',
      USER_LOGGED_IN: 'User logged in successfully',
      USER_LOGGED_OUT: 'User logged out successfully',
      OTP_SENT: 'OTP sent successfully',
      OTP_VERIFIED: 'OTP verified successfully',
      TOKENS_REFRESHED: 'Tokens refreshed successfully',
      PASSWORD_RESET: 'Password reset successfully',
    },
    ERROR: {
      INVALID_CREDENTIALS: 'Invalid phone or password',
      USER_ALREADY_EXISTS: 'User with this email or phone already exists',
      USER_NOT_FOUND: 'User not found',
      UNAUTHORIZED: 'Unauthorized access',
      INTERNAL_SERVER_ERROR: 'Internal server error',
      VALIDATION_ERROR: 'Validation error',
      PHONE_OR_EMAIL_REQUIRED: 'Either phone or email is required',
      INVALID_OTP: 'Invalid or expired OTP',
      OTP_NOT_SENT: 'Failed to send OTP',
      GOOGLE_AUTH_FAILED: 'Google authentication failed',
      INVALID_GOOGLE_ID: 'Invalid Google ID',
      INVALID_REFRESH_TOKEN: 'Invalid refresh token',
      REFRESH_TOKEN_EXPIRED: 'Refresh token has expired',
      ACCOUNT_INACTIVE: 'Account is inactive. Please contact support.',
      DUPLICATE_PHONE: 'Phone number already exists',
      DUPLICATE_EMAIL: 'Email already exists',
      DUPLICATE_GOOGLE_ID: 'Google ID already exists',
      PASSWORD_RESET_ONLY_FOR_PHONE: 'Password reset is only available for phone-based accounts',
      CURRENT_PASSWORD_INCORRECT: 'Current password is incorrect',
      PROFILE_NOT_FOUND: 'Profile not found',
      PROFILE_UPDATE_FAILED: 'Profile update failed',
      FILE_UPLOAD_FAILED: 'File upload failed',
      INVALID_FILE_TYPE: 'Invalid file type',
      FILE_SIZE_TOO_LARGE: 'File size too large',
      EMAIL_NOT_FOUND: 'Email not found',
      PHONE_NOT_FOUND: "Phone number not found"
      
    },
  };

export const USER_ROLES = {
    USER: 'user',
    ADMIN: 'admin',
    EMPLOYER: 'employer',
    EMPLOYEE: 'employee',
    // add more roles here
}

export const USER_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    // add more statuses here
}

export const AUTH_TYPES = {
    GOOGLE: 'google',
    PHONE: 'phone',
}
