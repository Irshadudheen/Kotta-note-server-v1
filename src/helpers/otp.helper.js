/**
 * Generate a random OTP
 * @param {number} length - Length of the OTP (default: 6)
 * @returns {string} Generated OTP
 */
export const generateOtp = (length = 6) => {
  const digits = '123456789';
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  
  return otp;
};

/**
 * Generate OTP message for SMS
 * @param {string} otp - The OTP to include in the message
 * @returns {string} Formatted SMS message
 */
export const generateOtpMessage = (otp) => {
  return `Your IqraHire verification code is: ${otp}. This code will expire in 10 minutes. Do not share this code with anyone.`;
};

/**
 * Generate OTP message for registration
 * @param {string} otp - The OTP to include in the message
 * @returns {string} Formatted SMS message for registration
 */
export const generateRegistrationOtpMessage = (otp) => {
  return `Welcome to IqraHire! Your verification code is: ${otp}. This code will expire in 10 minutes. Do not share this code with anyone.`;
};

/**
 * Generate OTP message for password reset
 * @param {string} otp - The OTP to include in the message
 * @returns {string} Formatted SMS message for password reset
 */
export const generatePasswordResetOtpMessage = (otp) => {
  return `Your IqraHire password reset code is: ${otp}. This code will expire in 10 minutes. Do not share this code with anyone.`;
};
