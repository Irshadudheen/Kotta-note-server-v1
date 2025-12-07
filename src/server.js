import './config/config.js';
import express from 'express';
import cors from 'cors';
import mongoDBConnector from './connectors/mongodb.js';
import routes from './routes/index.js';
import { HTTP_STATUS, LOGGER_CONFIG } from './constants/index.js';
import errorHandler from './middleware/error.js';
import rateLimiter from './middleware/ratelimt.js';
import requestLogger from './middleware/requestLogger.js';
import { ENV_CONFIG } from './config/env.config.js';

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
// Apply rate limiting to all requests
app.use(rateLimiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware - comprehensive logging to database
app.use(requestLogger(LOGGER_CONFIG));

// API routes
app.use('/api/v1', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Welcome to Kotta Server API',
    version: '1.0.0',
    documentation: '/api/health',
  });
});

// Global error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
  });
});

// Graceful shutdown handling
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  
  try {
    // Close database connection
    await mongoDBConnector.disconnect();
    console.log('✅ Database connection closed');
    
    // Close server
    server.close(() => {
      console.log('✅ HTTP server closed');
      process.exit(0);
    });
    
    // Force close after 10 seconds
    setTimeout(() => {
      console.log('⚠️ Forced shutdown');
      process.exit(1);
    }, 10000);
    
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

// Handle termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await mongoDBConnector.connect();
    
    // Start HTTP server
    const server = app.listen(PORT, () => {
      console.log('\n🚀 Server started successfully!');
      console.log(`📡 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 Database: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/kotta-db'}`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
      console.log(`❤️ Health Check: http://localhost:${PORT}/api/health`);
    
      console.log('\n✨ Ready to accept requests!\n');
      console.log(ENV_CONFIG);
      
    });
    
    return server;
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
const server = startServer();

export default app;
