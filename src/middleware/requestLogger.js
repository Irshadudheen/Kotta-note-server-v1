import { v4 as uuidv4 } from 'uuid';
import requestLogRepository from '../repository/requestLog.repo.js';
import {
  getClientIP,
  sanitizeHeaders,
  sanitizeRequestBody,
  sanitizeResponseBody
} from '../helpers/logging.helper.js';
import { ENV_CONFIG } from '../config/env.config.js';

/**
 * Comprehensive request logging middleware
 * Captures request and response details and stores them in the database
 */
const requestLogger = (options = {}) => {
  const {
    // Skip logging for certain paths
    skipPaths = ['/health', '/favicon.ico', '/robots.txt'],
    // Skip logging for certain methods
    skipMethods = ['OPTIONS'],
    // Maximum body size to log (in bytes)
    maxBodySize = 10000,
    // Maximum response size to log (in bytes)
    maxResponseSize = 10000,
    // Sensitive fields to exclude from logging
    sensitiveFields = ['password', 'token', 'authorization', 'cookie', 'secret'],
    // Whether to log request body
    logRequestBody = true,
    // Whether to log response body
    logResponseBody = true,
    // Whether to log headers
    logHeaders = true,
    // Custom function to extract user info from request
    getUserInfo = null
  } = options;

  return async (req, res, next) => {
    const startTime = Date.now();
    const requestId = uuidv4();

    // Skip logging for specified paths and methods
    if (skipPaths.some(path => req.path.includes(path)) ||
      skipMethods.includes(req.method)) {
      return next();
    }

    // Capture request details
    const requestTime = new Date();
    const requestData = {
      requestId,
      method: req.method,
      endpoint: req.route?.path || req.path,
      originalUrl: req.originalUrl,
      ip: getClientIP(req),
      query: req.query || {},
      params: req.params || {},
      body: logRequestBody ? sanitizeRequestBody(req, sensitiveFields, maxBodySize) : {},
      requestTime,
      environment: ENV_CONFIG.NODE_ENV || 'development'
    };

    // Extract user information if available
    if (req.user) {
      // Default user extraction from req.user (if auth middleware sets it)
      requestData.userId = req.user._id || req.user.id;
      requestData.userType = req.user.userType || 'anonymous';
    }

    // Extract session ID if available
    if (req.sessionID) {
      requestData.sessionId = req.sessionID;
    }

    // Store original response methods
    const originalSend = res.send;
    const originalJson = res.json;
    const originalEnd = res.end;

    let responseBody = '';
    let responseSize = 0;

    // Override response methods to capture response data
    res.send = function (data) {
      responseBody = data;
      responseSize = Buffer.byteLength(data, 'utf8');
      return originalSend.call(this, data);
    };

    res.json = function (data) {
      responseBody = data;
      responseSize = Buffer.byteLength(JSON.stringify(data), 'utf8');
      return originalJson.call(this, data);
    };

    res.end = function (data) {
      if (data) {
        responseBody = data;
        responseSize = Buffer.byteLength(data, 'utf8');
      }
      return originalEnd.call(this, data);
    };

    // Handle response finish event
    res.on('finish', async () => {
      try {
        const endTime = Date.now();
        const duration = endTime - startTime;
        console.log('requestData', req.user);
        // Prepare response data
        const responseData = {
          statusCode: res.statusCode,
          responseHeaders: logHeaders ? sanitizeHeaders(res.getHeaders(), sensitiveFields) : {},
          responseBody: logResponseBody ? sanitizeResponseBody(responseBody, sensitiveFields, maxResponseSize) : {},
          responseSize,
          responseTime: new Date(),
          duration,
          userId: req?.user?.id,
          userType: req?.user?.userType
        };

        // Add error information if status code indicates error
        if (res.statusCode >= 400) {
          responseData.error = {
            message: res.statusMessage || 'Unknown error',
            code: res.statusCode
          };
        }

        // Combine request and response data
        const logData = {
          ...requestData,
          ...responseData
        };

        // Save to database asynchronously (don't block response)
        setImmediate(async () => {
          try {
            await requestLogRepository.createLog(logData);
          } catch (error) {
            console.error('Failed to save request log:', error);
            // Don't throw error to avoid breaking the application
          }
        });

        // Log to console for development
        if (process.env.NODE_ENV === 'development') {
          console.log(`[${requestId}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
        }

      } catch (error) {
        console.error('Error in request logger:', error);
      }
    });

    // Handle response close event (for cases where finish might not fire)
    res.on('close', async () => {
      if (!res.finished) {
        try {
          const endTime = Date.now();
          const duration = endTime - startTime;

          const responseData = {
            statusCode: res.statusCode || 0,
            responseHeaders: logHeaders ? sanitizeHeaders(res.getHeaders(), sensitiveFields) : {},
            responseBody: logResponseBody ? sanitizeResponseBody(responseBody, sensitiveFields, maxResponseSize) : {},
            responseSize,
            responseTime: new Date(),
            duration
          };

          const logData = {
            ...requestData,
            ...responseData
          };

          setImmediate(async () => {
            try {
              await requestLogRepository.createLog(logData);
            } catch (error) {
              console.error('Failed to save request log:', error);
            }
          });
        } catch (error) {
          console.error('Error in request logger (close event):', error);
        }
      }
    });

    next();
  };
};


export default requestLogger;
