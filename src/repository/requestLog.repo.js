import RequestLog from '../models/requestLog.model.js';

class RequestLogRepository {
  /**
   * Create a new request log entry
   * @param {Object} logData - The log data to save
   * @returns {Promise<Object>} - The created log entry
   */
  async createLog(logData) {
    try {
      const log = new RequestLog(logData);
      return await log.save();
    } catch (error) {
      console.error('Error creating request log:', error);
      throw error;
    }
  }

  /**
   * Get logs by request ID
   * @param {string} requestId - The request ID
   * @returns {Promise<Object|null>} - The log entry or null
   */
  async getLogByRequestId(requestId) {
    try {
      return await RequestLog.findOne({ requestId });
    } catch (error) {
      console.error('Error fetching log by request ID:', error);
      throw error;
    }
  }

  /**
   * Get logs by user ID
   * @param {string} userId - The user ID
   * @param {Object} options - Query options (limit, skip, sort)
   * @returns {Promise<Array>} - Array of log entries
   */
  async getLogsByUserId(userId, options = {}) {
    try {
      const { limit = 50, skip = 0, sort = { requestTime: -1 } } = options;
      
      return await RequestLog.find({ userId })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('userId', 'email phone userType');
    } catch (error) {
      console.error('Error fetching logs by user ID:', error);
      throw error;
    }
  }

  /**
   * Get logs by endpoint
   * @param {string} endpoint - The endpoint pattern
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Array of log entries
   */
  async getLogsByEndpoint(endpoint, options = {}) {
    try {
      const { limit = 50, skip = 0, sort = { requestTime: -1 } } = options;
      
      return await RequestLog.find({ endpoint: new RegExp(endpoint, 'i') })
        .sort(sort)
        .skip(skip)
        .limit(limit);
    } catch (error) {
      console.error('Error fetching logs by endpoint:', error);
      throw error;
    }
  }

  /**
   * Get logs by status code
   * @param {number} statusCode - The HTTP status code
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Array of log entries
   */
  async getLogsByStatusCode(statusCode, options = {}) {
    try {
      const { limit = 50, skip = 0, sort = { requestTime: -1 } } = options;
      
      return await RequestLog.find({ statusCode })
        .sort(sort)
        .skip(skip)
        .limit(limit);
    } catch (error) {
      console.error('Error fetching logs by status code:', error);
      throw error;
    }
  }

  /**
   * Get logs by date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Array of log entries
   */
  async getLogsByDateRange(startDate, endDate, options = {}) {
    try {
      const { limit = 100, skip = 0, sort = { requestTime: -1 } } = options;
      
      return await RequestLog.find({
        requestTime: {
          $gte: startDate,
          $lte: endDate
        }
      })
        .sort(sort)
        .skip(skip)
        .limit(limit);
    } catch (error) {
      console.error('Error fetching logs by date range:', error);
      throw error;
    }
  }

  /**
   * Get error logs (status code >= 400)
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Array of error log entries
   */
  async getErrorLogs(options = {}) {
    try {
      const { limit = 50, skip = 0, sort = { requestTime: -1 } } = options;
      
      return await RequestLog.find({
        statusCode: { $gte: 400 }
      })
        .sort(sort)
        .skip(skip)
        .limit(limit);
    } catch (error) {
      console.error('Error fetching error logs:', error);
      throw error;
    }
  }

  /**
   * Get slow requests (duration > threshold)
   * @param {number} threshold - Duration threshold in milliseconds
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Array of slow request log entries
   */
  async getSlowRequests(threshold = 1000, options = {}) {
    try {
      const { limit = 50, skip = 0, sort = { duration: -1 } } = options;
      
      return await RequestLog.find({
        duration: { $gt: threshold }
      })
        .sort(sort)
        .skip(skip)
        .limit(limit);
    } catch (error) {
      console.error('Error fetching slow requests:', error);
      throw error;
    }
  }

  /**
   * Get API usage statistics
   * @param {Date} startDate - Start date for statistics
   * @param {Date} endDate - End date for statistics
   * @returns {Promise<Object>} - Statistics object
   */
  async getApiStatistics(startDate, endDate) {
    try {
      const matchStage = {
        requestTime: {
          $gte: startDate,
          $lte: endDate
        }
      };

      const stats = await RequestLog.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalRequests: { $sum: 1 },
            averageResponseTime: { $avg: '$duration' },
            minResponseTime: { $min: '$duration' },
            maxResponseTime: { $max: '$duration' },
            errorCount: {
              $sum: {
                $cond: [{ $gte: ['$statusCode', 400] }, 1, 0]
              }
            },
            successCount: {
              $sum: {
                $cond: [{ $lt: ['$statusCode', 400] }, 1, 0]
              }
            }
          }
        }
      ]);

      const methodStats = await RequestLog.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$method',
            count: { $sum: 1 },
            averageDuration: { $avg: '$duration' }
          }
        },
        { $sort: { count: -1 } }
      ]);

      const endpointStats = await RequestLog.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$endpoint',
            count: { $sum: 1 },
            averageDuration: { $avg: '$duration' },
            errorCount: {
              $sum: {
                $cond: [{ $gte: ['$statusCode', 400] }, 1, 0]
              }
            }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      return {
        overview: stats[0] || {
          totalRequests: 0,
          averageResponseTime: 0,
          minResponseTime: 0,
          maxResponseTime: 0,
          errorCount: 0,
          successCount: 0
        },
        methodStats,
        topEndpoints: endpointStats
      };
    } catch (error) {
      console.error('Error fetching API statistics:', error);
      throw error;
    }
  }

  /**
   * Clean old logs
   * @param {number} daysToKeep - Number of days to keep logs
   * @returns {Promise<Object>} - Deletion result
   */
  async cleanOldLogs(daysToKeep = 30) {
    try {
      return await RequestLog.cleanOldLogs(daysToKeep);
    } catch (error) {
      console.error('Error cleaning old logs:', error);
      throw error;
    }
  }

  /**
   * Get logs with advanced filtering
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Query options
   * @returns {Promise<Object>} - Paginated result with logs and metadata
   */
  async getLogsWithFilters(filters = {}, options = {}) {
    try {
      const {
        limit = 50,
        skip = 0,
        sort = { requestTime: -1 },
        page = 1
      } = options;

      const query = {};

      // Apply filters
      if (filters.method) query.method = filters.method;
      if (filters.statusCode) query.statusCode = filters.statusCode;
      if (filters.userId) query.userId = filters.userId;
      if (filters.endpoint) query.endpoint = new RegExp(filters.endpoint, 'i');
      if (filters.ip) query.ip = filters.ip;
      if (filters.minDuration) query.duration = { $gte: filters.minDuration };
      if (filters.maxDuration) {
        query.duration = { ...query.duration, $lte: filters.maxDuration };
      }
      if (filters.startDate || filters.endDate) {
        query.requestTime = {};
        if (filters.startDate) query.requestTime.$gte = new Date(filters.startDate);
        if (filters.endDate) query.requestTime.$lte = new Date(filters.endDate);
      }

      const [logs, total] = await Promise.all([
        RequestLog.find(query)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .populate('userId', 'email phone userType'),
        RequestLog.countDocuments(query)
      ]);

      return {
        logs,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasNext: skip + limit < total,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      console.error('Error fetching logs with filters:', error);
      throw error;
    }
  }
}

export default new RequestLogRepository();
