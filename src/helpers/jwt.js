import jwt from 'jsonwebtoken';
import { JWT_CONFIG } from '../constants/common.constants.js';
import { ENV_CONFIG } from '../config/env.config.js';

export const generateAccessToken = (payload, expiresIn = JWT_CONFIG.ACCESS_TOKEN_EXPIRES_IN) => {
  try {
    const secret = ENV_CONFIG.JWT_ACCESS_SECRET
    return jwt.sign(payload, secret, { expiresIn });
  } catch (error) {
    console.log(error);
    
    throw new Error('Access token generation failed');
  }
};

export const generateRefreshToken = (payload, expiresIn = JWT_CONFIG.REFRESH_TOKEN_EXPIRES_IN) => {
  try {
    const secret = ENV_CONFIG.JWT_REFRESH_SECRET
    return jwt.sign(payload, secret, { expiresIn });
  } catch (error) {
    throw new Error('Refresh token generation failed');
  }
};

export const generateTokenPair = (payload) => {
  try {
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    
    return {
      accessToken,
      refreshToken
    };
  } catch (error) {
    console.log(error);
    
    throw new Error('Token pair generation failed');
  }
};

export const generateToken = (payload, expiresIn = JWT_CONFIG.EXPIRES_IN) => {
  return generateAccessToken(payload, expiresIn);
};

export const verifyAccessToken = (token) => {
  try {
    const secret = ENV_CONFIG.JWT_ACCESS_SECRET
    return jwt.verify(token, secret);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Access token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid access token');
    } else {
      throw new Error('Access token verification failed');
    }
  }
};

export const verifyRefreshToken = (token) => {
  try {
    const secret = ENV_CONFIG.JWT_REFRESH_SECRET
    return jwt.verify(token, secret);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Refresh token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid refresh token');
    } else {
      throw new Error('Refresh token verification failed');
    }
  }
};

export const verifyToken = (token) => {
  return verifyAccessToken(token);
};

export const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    throw new Error('Token decoding failed');
  }
};

export const extractTokenFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7); 
};
