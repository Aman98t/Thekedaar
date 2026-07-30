// ==========================================
// 🛡️ THEKEDAAR CHECK MIDDLEWARE
// Location: backend/middleware/thekedaarMiddleware.js
// ==========================================
const verifyThekedaar = (req, res, next) => {
    if (req.user && (req.user.role === 'thekedaar' || req.user.role === 'admin')) {
      // Admin bhi access kar sakta hai agar zaroorat pade, warna strict `thekedaar` rakh sakte hain
      next();
    } else {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied. Contractor privileges required." 
      });
    }
  };
  
  module.exports = verifyThekedaar;