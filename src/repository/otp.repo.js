import OtpTracker from '../models/otpTracker.model.js';
import { HTTP_STATUS, MESSAGES } from '../constants/index.js';

class OtpRepository {
  /**
   * Create a new OTP record
   */
  async createOtp(mobileNumber, otp) {
    try {
      // Delete any existing OTP for this mobile number
      await this.deleteOtpByMobile(mobileNumber);
      
      const otpData = {
        mobileNumber,
        otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
      };
      
      const otpRecord = new OtpTracker(otpData);
      const savedOtp = await otpRecord.save();
      
      return {
        success: true,
        data: savedOtp,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      };
    }
  }

  /**
   * Verify OTP for a mobile number
   */
  async verifyOtp(mobileNumber, otp) {
    try {
      const otpRecord = await OtpTracker.findOne({
        mobileNumber,
        otp,
        expiresAt: { $gt: new Date() } // OTP should not be expired
      });
      console.log(otpRecord,mobileNumber,otp,' the otp record, mobileNumber otp')
      if (!otpRecord) {
        return {
          success: false,
          error: MESSAGES.ERROR.INVALID_OTP,
          statusCode: HTTP_STATUS.BAD_REQUEST,
        };
      }

      // Delete the OTP after successful verification
      await this.deleteOtpByMobile(mobileNumber);

      return {
        success: true,
        data: otpRecord,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      };
    }
  }

  /**
   * Delete OTP by mobile number
   */
  async deleteOtpByMobile(mobileNumber) {
    try {
      await OtpTracker.deleteMany({ mobileNumber });
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      };
    }
  }

  /**
   * Check if OTP exists and is valid for a mobile number
   */
  async checkOtpExists(mobileNumber) {
    try {
      const otpRecord = await OtpTracker.findOne({
        mobileNumber,
        expiresAt: { $gt: new Date() }
      });

      return {
        success: true,
        data: !!otpRecord,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      };
    }
  }

  /**
   * Clean up expired OTPs
   */
  async cleanupExpiredOtps() {
    try {
      const result = await OtpTracker.deleteMany({
        expiresAt: { $lt: new Date() }
      });

      return {
        success: true,
        data: { deletedCount: result.deletedCount },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      };
    }
  }

  /**
   * Get OTP record by mobile number
   */
  async getOtpByMobile(mobileNumber) {
    try {
      const otpRecord = await OtpTracker.findOne({
        mobileNumber,
        expiresAt: { $gt: new Date() }
      });

      return {
        success: true,
        data: otpRecord,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      };
    }
  }
}

export default new OtpRepository();
