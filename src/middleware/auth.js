
import { verifyAccessToken, extractTokenFromHeader } from '../helpers/jwt.js';
import { HTTP_STATUS, MESSAGES } from '../constants/index.js';

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);
    if (!token) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: MESSAGES.ERROR.UNAUTHORIZED,
      });
    }

    // Verify the token
    const decoded = verifyAccessToken(token);
    
    // Attach user info to request
    req.user = decoded;
    console.log('decoded',decoded);
    
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.message.includes('expired')) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Token has expired',
      });
    }
    
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: MESSAGES.ERROR.UNAUTHORIZED,
    });
  }
};



export {
  authenticateToken,

};
