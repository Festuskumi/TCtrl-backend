import jwt from 'jsonwebtoken';

const adminVerify = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];

    // Check header presence
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Access denied: No token provided' });
    }

    // Extract token
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'Token missing in request' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_CODE);

    // Ensure decoded has admin details
    if (!decoded.email || decoded.email !== process.env.ADMIN_MAIL) {
      return res.status(403).json({ success: false, message: 'Unauthorized: Not an admin' });
    }

    req.admin = decoded; // Save admin info for downstream use
    next();

  } catch (err) {
    console.error('❌ Admin token verification failed:', err.message);
    return res.status(401).json({ success: false, message: 'Invalid or expired admin token' });
  }
};

export default adminVerify;
