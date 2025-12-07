import mongoose from 'mongoose';

const requestLogSchema = new mongoose.Schema({
  // Request details
  requestId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  method: {
    type: String,
    required: true,
    enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    trim: true
  },
  endpoint: {
    type: String,
    required: true,
    trim: true
  },
  originalUrl: {
    type: String,
    required: true,
    trim: true
  },
  ip: {
    type: String,
    required: true,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  referer: {
    type: String,
    trim: true
  },
  headers: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  query: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  params: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  body: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Response details
  statusCode: {
    type: Number,
    required: true
  },
  responseHeaders: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  responseBody: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  responseSize: {
    type: Number,
    default: 0
  },
  
  // Timing and performance
  requestTime: {
    type: Date,
    required: true
  },
  responseTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in milliseconds
    required: true
  },
  
  // User context (if available)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  userType: {
    type: String,
    enum: ['employee', 'employer', 'admin', 'authenticated', 'anonymous'],
    default: 'anonymous'
  },
  
  // Error details (if any)
  error: {
    message: String,
    stack: String,
    code: String
  },
  
  // Additional metadata
  sessionId: {
    type: String,
    trim: true
  },
  apiVersion: {
    type: String,
    default: 'v1'
  },
  environment: {
    type: String,
    default: process.env.NODE_ENV || 'development'
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});



// Virtual for formatted duration
requestLogSchema.virtual('formattedDuration').get(function() {
  if (this.duration < 1000) {
    return `${this.duration}ms`;
  } else if (this.duration < 60000) {
    return `${(this.duration / 1000).toFixed(2)}s`;
  } else {
    return `${(this.duration / 60000).toFixed(2)}m`;
  }
});

// Static method to clean old logs (optional)
requestLogSchema.statics.cleanOldLogs = async function(daysToKeep = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  const result = await this.deleteMany({
    requestTime: { $lt: cutoffDate }
  });
  
  return result;
};

const RequestLog = mongoose.model('RequestLog', requestLogSchema);

export default RequestLog;
