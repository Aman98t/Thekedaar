// ==========================================
// 🛡️ AUTHENTICATION MIDDLEWARE (Cookie + Header Support)
// Location: backend/middleware/authMiddleware.js
// ==========================================
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'buildhub_super_secret_key_2026';

const verifyToken = (req, res, next) => {
  // 1. Sabse pehle HTTPOnly Cookie mein token dhoondho (New Secure Way)
  let token = req.cookies.buildhub_token;

  // 2. Agar cookie nahi hai, toh Header mein dhoondho (Fallback for transition)
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Access denied. No valid token found." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { userId, role }
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: "Invalid or expired token." });
  }
};

module.exports = verifyToken;