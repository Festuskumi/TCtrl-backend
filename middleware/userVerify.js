import jwt from 'jsonwebtoken';
import usersModels from '../Models/userModels.js';

const userVerify = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_CODE);

    if (!decoded?.id) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token payload.',
      });
    }

    const user = await usersModels.findById(decoded.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before accessing this resource.',
      });
    }

    // ✅ Attach userId to request
    req.userId = user._id;
    next();
  } catch (error) {
    console.error('Auth Error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Session expired or token invalid. Please log in again.',
    });
  }
};

export default userVerify;
