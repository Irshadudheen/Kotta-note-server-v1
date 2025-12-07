/**
 * Validation helper functions
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email format
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format (basic validation)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid phone format
 */
const isValidPhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid URL format
 */
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate MongoDB ObjectId format
 * @param {string} id - ID to validate
 * @returns {boolean} True if valid ObjectId format
 */
const isValidObjectId = (id) => {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
};

/**
 * Validate required fields
 * @param {Object} data - Data object to validate
 * @param {Array} requiredFields - Array of required field names
 * @returns {Object} Validation result with isValid and missingFields
 */
const validateRequiredFields = (data, requiredFields) => {
  const missingFields = requiredFields.filter(field => {
    const value = data[field];
    return value === undefined || value === null || value === '';
  });
  
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
};

/**
 * Sanitize string input
 * @param {string} input - Input string to sanitize
 * @returns {string} Sanitized string
 */
const sanitizeString = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

/**
 * Validate string length
 * @param {string} str - String to validate
 * @param {number} minLength - Minimum length
 * @param {number} maxLength - Maximum length
 * @returns {boolean} True if string length is within bounds
 */
const validateStringLength = (str, minLength = 0, maxLength = Infinity) => {
  if (typeof str !== 'string') return false;
  return str.length >= minLength && str.length <= maxLength;
};

/**
 * Validate numeric range
 * @param {number} num - Number to validate
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {boolean} True if number is within range
 */
const validateNumericRange = (num, min = -Infinity, max = Infinity) => {
  if (typeof num !== 'number' || isNaN(num)) return false;
  return num >= min && num <= max;
};

/**
 * Validate date format (ISO 8601)
 * @param {string} dateString - Date string to validate
 * @returns {boolean} True if valid date format
 */
const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date) && dateString === date.toISOString();
};

/**
 * Validate array of values against allowed values
 * @param {Array} array - Array to validate
 * @param {Array} allowedValues - Array of allowed values
 * @returns {boolean} True if all array values are in allowed values
 */
const validateArrayValues = (array, allowedValues) => {
  if (!Array.isArray(array)) return false;
  return array.every(value => allowedValues.includes(value));
};

export {
  isValidEmail,
  isValidPhone,
  isValidUrl,
  isValidObjectId,
  validateRequiredFields,
  sanitizeString,
  validateStringLength,
  validateNumericRange,
  isValidDate,
  validateArrayValues
};
