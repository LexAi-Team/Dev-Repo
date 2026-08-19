import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler.js';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

// Middleware to authenticate any logged-in user
export const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(new AppError('Authorization header is missing', 401, 'AUTH_HEADER_MISSING'));
  }

  // Expected format: Bearer <token>
  const token = authHeader.split(' ')[1];

  if (!token) {
    return next(new AppError('Access token missing from Authorization header', 401, 'TOKEN_MISSING'));
  }

  try {
    const decodedUser = jwt.verify(token, JWT_SECRET);
    req.user = decodedUser;
    next();
  } catch (err) {
    return next(new AppError('Invalid or expired access token', 403, 'INVALID_TOKEN'));
  }
};

// Middleware to restrict access to Citizens only
export const authorizeCitizen = (req, res, next) => {
  if (req.user && req.user.role === 'Citizen') {
    next();
  } else {
    next(new AppError('Access forbidden: Citizens only', 403, 'FORBIDDEN'));
  }
};

// Middleware to restrict access to Advocates only
export const authorizeAdvocate = (req, res, next) => {
  if (req.user && req.user.role === 'Advocate') {
    next();
  } else {
    next(new AppError('Access forbidden: Advocates only', 403, 'FORBIDDEN'));
  }
};
