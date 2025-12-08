import User from '../models/user.model.js';
import { HTTP_STATUS, MESSAGES } from '../constants/index.js';
import bcrypt from 'bcryptjs';

class UserRepository {
  /**
   * Create a new user
   */
  async createUser(userData) {
    try {
      
       const updatedUser = await User.findOneAndUpdate(
      { email: userData.email },   // condition to check existing user
      { $set: userData },          // update / insert these fields
      { new: true, upsert: true }  // new → returns updated doc, upsert → create if not exists
    );
    console.log(updatedUser,'the updated')
    return {
      success: true,
      data: updatedUser,
    };
    } catch (error) {
    console.log(error,'the error')
      if (error.code === 11000) {
        return {
          success: false,
          error: MESSAGES.ERROR.USER_ALREADY_EXISTS,
          statusCode: HTTP_STATUS.BAD_REQUEST,
        };
      }
      
      return {
        success: false,
        error: error.message,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      };
    }
  }

  /**
   * Find user by email
   */
  async findByEmailAndUserType(email, userType) {
  try {
    const user = await User.findOne({ email, userType });
    console.log(user,'the user data')
    return { success: true, data: user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

  async findByEmail(email) {
    try {
      const user = await User.findOne({ email: email.toLowerCase() });
      
      return {
        success: true,
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      };
    }
  }

  /**
   * Find user by ID
   */
  async findById(userId) {
    try {
      const user = await User.findById(userId).select('-password');
      return {
        success: true,
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      };
    }
  }

  /**
   * Find user by ID with password (for authentication)
   */
  async findByIdWithPassword(userId) {
    try {
      const user = await User.findById(userId);
      return {
        success: true,
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      };
    }
  }

  /**
   * Find user by email with password (for login)
   */
  async findByEmailWithPassword(email) {
    try {
      const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
      return {
        success: true,
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      };
    }
  }

  /**
   * Find user by phone number
   */
  async findByPhoneAndUserType(phone,userType) {
    try {
      const user = await User.findOne({ phone,userType });
      return {
        success: true,
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      };
    }
  }

  /**
   * Find user by phone with password (for login)
   */
  async findByPhoneWithPassword(phone) {
    try {
      const user = await User.findOne({ phone }).select('+password');
      return {
        success: true,
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      };
    }
  }

  /**
   * Find user by Google ID
   */

async findByGoogleIdAndUserType(googleId,userType) {
    try {
      const user = await User.findOne({ googleId,userType });
      return {
        success: true,
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async findByGoogleId(googleId) {
    try {
      const user = await User.findOne({ googleId });
      return {
        success: true,
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      };
    }
  }

  /**
   * Check if user exists by phone
   */
  async userExistsByPhone(phone) {
    try {
      const user = await User.findOne({ phone });
      return {
        success: true,
        data: !!user,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      };
    }
  }

  /**
   * Check if user exists by Google ID
   */
  async userExistsByGoogleId(googleId) {
    try {
      const user = await User.findOne({ googleId });
      return {
        success: true,
        data: !!user,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      };
    }
  }

  /**
   * Update user by ID
   */
  async updateById(userId, updateData) {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        updateData,
        { 
          new: true, 
          runValidators: true,
          select: '-password'
        }
      );
      
      if (!user) {
        return {
          success: false,
          error: MESSAGES.ERROR.USER_NOT_FOUND,
          statusCode: HTTP_STATUS.NOT_FOUND,
        };
      }

      return {
        success: true,
        data: user,
      };
    } catch (error) {
      if (error.code === 11000) {
        return {
          success: false,
          error: MESSAGES.ERROR.USER_ALREADY_EXISTS,
          statusCode: HTTP_STATUS.BAD_REQUEST,
        };
      }
      
      return {
        success: false,
        error: error.message,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      };
    }
  }

  /**
   * Delete user by ID
   */
  async deleteById(userId) {
    try {
      const user = await User.findByIdAndDelete(userId);
      
      if (!user) {
        return {
          success: false,
          error: MESSAGES.ERROR.USER_NOT_FOUND,
          statusCode: HTTP_STATUS.NOT_FOUND,
        };
      }

      return {
        success: true,
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      };
    }
  }

  /**
   * Get all users with pagination
   */
  async getAllUsers(page = 1, limit = 10, filters = {}) {
    try {
      const skip = (page - 1) * limit;
      
      const query = User.find(filters)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const [users, total] = await Promise.all([
        query.exec(),
        User.countDocuments(filters),
      ]);

      return {
        success: true,
        data: {
          users,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalUsers: total,
            hasNextPage: page < Math.ceil(total / limit),
            hasPrevPage: page > 1,
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      };
    }
  }

  /**
   * Update user's last login
   */
  async updateLastLogin(userId) {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { lastLoggedInAt: new Date() },
        { new: true, runValidators: true }
      );
      
      if (!user) {
        return {
          success: false,
          error: MESSAGES.ERROR.USER_NOT_FOUND,
          statusCode: HTTP_STATUS.NOT_FOUND,
        };
      }
      
      return {
        success: true,
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      };
    }
  }

  /**
   * Update user password
   */
  async updatePassword(userId, newPassword) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        return {
          success: false,
          error: MESSAGES.ERROR.USER_NOT_FOUND,
          statusCode: HTTP_STATUS.NOT_FOUND,
        };
      }

      user.password = newPassword;
      await user.save();
      
      return {
        success: true,
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      };
    }
  }

  /**
   * Check if user exists by email
   */
  async userExists(email) {
    try {
      const user = await User.findOne({ email: email.toLowerCase() });
      return {
        success: true,
        data: !!user,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      };
    }
  }

  /**
   * Compare password with hashed password
   */
  async comparePassword(candidatePassword, hashedPassword) {
    try {
      if (!hashedPassword) return false;
      return await bcrypt.compare(candidatePassword, hashedPassword);
    } catch (error) {
      return false;
    }
  }
}

export default new UserRepository();
