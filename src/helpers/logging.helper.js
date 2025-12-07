/**
 * Helper functions for request logging
 */

/**
 * Get client IP address from request
 */
export function getClientIP(req) {
  return req.ip || 
         req.connection?.remoteAddress || 
         req.socket?.remoteAddress ||
         (req.connection?.socket ? req.connection.socket.remoteAddress : null) ||
         req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
         req.headers['x-real-ip'] ||
         'unknown';
}

/**
 * Sanitize headers by removing sensitive information

 */
export function sanitizeHeaders(headers, sensitiveFields) {
  const sanitized = {};
  
  for (const [key, value] of Object.entries(headers)) {
    const lowerKey = key.toLowerCase();
    if (sensitiveFields.some(field => lowerKey.includes(field.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

/**
 * Sanitize request body by handling FormData and other formats
 */
export function sanitizeRequestBody(req, sensitiveFields, maxSize) {
  const contentType = req.get('Content-Type') || '';
  
  // Handle FormData/multipart requests
  if (contentType.includes('multipart/form-data')) {
    return sanitizeFormData(req, sensitiveFields, maxSize);
  }
  
  // Handle URL-encoded data
  if (contentType.includes('application/x-www-form-urlencoded')) {
    return sanitizeBody(req.body, sensitiveFields, maxSize);
  }
  
  // Handle JSON and other formats
  return sanitizeBody(req.body, sensitiveFields, maxSize);
}

/**
 * Sanitize FormData from request
 */
export function sanitizeFormData(req, sensitiveFields, maxSize) {
  try {
    const formData = {};
    
    // Extract form fields
    if (req.body && typeof req.body === 'object') {
      for (const [key, value] of Object.entries(req.body)) {
        const lowerKey = key.toLowerCase();
        if (sensitiveFields.some(field => lowerKey.includes(field.toLowerCase()))) {
          formData[key] = '[REDACTED]';
        } else {
          formData[key] = value;
        }
      }
    }
    
    // Extract file information
    if (req.files) {
      formData._files = Array.isArray(req.files) 
        ? req.files.map(file => ({
            fieldname: file.fieldname,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size
          }))
        : Object.values(req.files).map(file => ({
            fieldname: file.fieldname,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size
          }));
    }
    
    // Check size and truncate if necessary
    const bodyString = JSON.stringify(formData);
    if (bodyString.length > maxSize) {
      return {
        ...formData,
        _truncated: true,
        _originalSize: bodyString.length,
        _maxSize: maxSize
      };
    }
    
    return formData;
  } catch (error) {
    return '[FORM_DATA_ERROR]';
  }
}

/**
 * Sanitize response body by handling Buffer and other formats
 */
export function sanitizeResponseBody(body, sensitiveFields, maxSize) {
  // Handle Buffer responses
  if (Buffer.isBuffer(body)) {
    try {
      // Try to parse as JSON first
      const jsonString = body.toString('utf8');
      const parsed = JSON.parse(jsonString);
      return sanitizeBody(parsed, sensitiveFields, maxSize);
    } catch (error) {
      // If not JSON, return buffer info
      return {
        _type: 'Buffer',
        _size: body.length,
        _preview: body.length > 0 ? body.slice(0, 100).toString('utf8') : '',
        _truncated: body.length > 100
      };
    }
  }
  
  // Handle string responses
  if (typeof body === 'string') {
    try {
      // Try to parse as JSON
      const parsed = JSON.parse(body);
      return sanitizeBody(parsed, sensitiveFields, maxSize);
    } catch (error) {
      // If not JSON, return string with size limit
      if (body.length > maxSize) {
        return {
          _type: 'string',
          _content: body.substring(0, maxSize),
          _truncated: true,
          _originalSize: body.length,
          _maxSize: maxSize
        };
      }
      return body;
    }
  }
  
  // Handle object responses
  return sanitizeBody(body, sensitiveFields, maxSize);
}

/**
 * Sanitize body by removing sensitive information and limiting size
 */
export function sanitizeBody(body, sensitiveFields, maxSize) {
  if (!body || typeof body !== 'object') {
    return body;
  }

  try {
    let sanitized = JSON.parse(JSON.stringify(body));
    
    // Remove sensitive fields
    sanitized = removeSensitiveFields(sanitized, sensitiveFields);
    
    // Check size and truncate if necessary
    const bodyString = JSON.stringify(sanitized);
    if (bodyString.length > maxSize) {
      return {
        ...sanitized,
        _truncated: true,
        _originalSize: bodyString.length,
        _maxSize: maxSize
      };
    }
    
    return sanitized;
  } catch (error) {
    return '[INVALID_JSON]';
  }
}

/**
 * Recursively remove sensitive fields from object
 */
export function removeSensitiveFields(obj, sensitiveFields) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => removeSensitiveFields(item, sensitiveFields));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    if (sensitiveFields.some(field => lowerKey.includes(field.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = removeSensitiveFields(value, sensitiveFields);
    }
  }

  return sanitized;
}

/**
 * Extract API version from URL
 */
export function extractApiVersion(url) {
  const match = url.match(/\/api\/(v\d+)/);
  return match ? match[1] : 'v1';
}
