# Kotta Note Server

A clean, scalable Express.js server with authentication, built following clean architecture principles.

## 🏗️ Project Structure

```
src/
├── connectors/          # Database connections
│   └── mongodb.js
├── constants/           # Application constants
│   └── index.js
├── routes/             # API routes
│   ├── auth.js
│   └── index.js
├── middleware/         # Custom middleware
│   ├── auth.js
│   └── validation.js
├── controller/         # Business logic controllers
│   └── authController.js
├── repository/         # Data access layer
│   └── userRepository.js
├── models/            # Database models
│   └── User.js
└── server.js          # Application entry point
```

## 🚀 Features

- **JWT Authentication**: Secure token-based authentication
- **User Management**: Registration, login, profile management
- **Input Validation**: Request validation using express-validator
- **Error Handling**: Comprehensive error handling middleware
- **MongoDB Integration**: Mongoose ODM with connection management
- **Security**: Password hashing with bcrypt, CORS configuration
- **Environment Configuration**: Environment-based configuration

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd kotta-server-v1
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy the example environment file
   cp config.env.example config.env
   
   # Edit config.env with your settings
   nano config.env
   ```

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   
   # Or use MongoDB Atlas (cloud)
   # Update MONGODB_URI in config.env
   ```

5. **Run the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 🔧 Configuration

Create a `config.env` file in the root directory:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/Kotta-db
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

**Happy Coding! 🎉**
