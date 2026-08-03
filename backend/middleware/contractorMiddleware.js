// ==========================================
// 🛡️ CONTRACTOR CHECK MIDDLEWARE
// Location: backend/middleware/contractorMiddleware.js
// ==========================================
const verifyContractor = (req, res, next) => {
  // ✅ CHANGED: 'thekedaar' -> 'contractor'
  if (req.user && (req.user.role === 'contractor' || req.user.role === 'admin')) {
    next();
  } else {
    return res.status(403).json({ 
      success: false, 
      message: "Access denied. Contractor privileges required." 
    });
  }
};

module.exports = verifyContractor;