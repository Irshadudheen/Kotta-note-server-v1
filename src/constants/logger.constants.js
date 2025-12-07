export const LOGGER_CONFIG = {
  // Skip logging for certain paths
  skipPaths: ['/health', '/favicon.ico', '/robots.txt'],
  // Skip logging for certain methods
  skipMethods: ['OPTIONS'],
  // Maximum body size to log (in bytes)
  maxBodySize: 10000,
  // Maximum response size to log (in bytes)
  maxResponseSize: 10000,
  // Sensitive fields to exclude from logging
  sensitiveFields: ['password', 'token', 'authorization', 'cookie', 'secret', 'apiKey'],
  // Whether to log request body
  logRequestBody: true,
  // Whether to log response body
  logResponseBody: true,
  // Whether to log headers
  logHeaders: false
};