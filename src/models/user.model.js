import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  authType: {
    type: String,
    required: [true, 'Auth Type is required'],
    enum: ['google', 'phone'],
    trim: true
  },
  userType: {
    type: String,
    required: [true, 'User Type is required'],
    enum: ['student', 'teacher', 'admin'],
    trim: true,
    maxlength: [50, 'User type cannot exceed 50 characters'],
  },
  email: {
    type: String,
    sparse: true, // Allow multiple null values
    lowercase: true,
    trim: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please provide a valid email address',
    ],
  },
  phone: {
    type: String,
   
    sparse: true, // Allow multiple null values
    trim: true,
    match: [
      /^[0-9]{10}$/,
      'Phone number must be exactly 10 digits'
    ],
  },
  googleId: {
    type: String,
    sparse: true, // Allow multiple null values
    trim: true,
    maxlength: [50, 'Google Id cannot exceed 50 characters']
  },
  password: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false, // Don't include password in queries by default
  },
  lastLoggedInAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: ['active', 'blocked', 'inactive', 'deleted'],
    default: 'active'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new) and exists
  if (!this.isModified('password') || !this.password) return next();

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Custom validation for authType specific requirements
userSchema.pre('validate', function(next) {
  if (this.authType === 'google') {
    if (!this.googleId) {
      return next(new Error('Google ID is required for Google authentication'));
    }
    if (!this.email) {
      return next(new Error('Email is required for Google authentication'));
    }
  } else if (this.authType === 'phone') {
    if (!this.phone) {
      return next(new Error('Phone number is required for phone authentication'));
    }
    if (!this.password) {
      return next(new Error('Password is required for phone authentication'));
    }
  }
  next();
});


const User = mongoose.model('User', userSchema);

export default User;
