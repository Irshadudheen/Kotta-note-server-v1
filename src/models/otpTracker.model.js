import mongoose from 'mongoose';

const otpTrackerSchema = new mongoose.Schema({
  mobileNumber: {
    type: Number,
    required: [true, 'Mobile number is required'],
    trim: true
  },
  otp: {
    type: String,
    required: [true, 'OTP is required'],
    trim: true
  },
  expiresAt: {
    type: Date,
    required: [true, 'Expiration time is required'],
    default: () => new Date(Date.now() + 10 * 60 * 1000) 
  }
}, {
  timestamps: true, 
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const OtpTracker = mongoose.model('OtpTracker', otpTrackerSchema);

export default OtpTracker;
