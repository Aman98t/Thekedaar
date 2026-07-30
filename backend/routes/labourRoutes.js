// ==========================================
// 🛣️ LABOUR ROUTES
// Location: backend/routes/labourRoutes.js
// ==========================================
const express = require('express');
const router = express.Router();
const { getMyProfileAndStats } = require('../controllers/labourController');
const verifyToken = require('../middleware/authMiddleware');

// GET /api/labour/my-summary
router.get('/my-summary', verifyToken, getMyProfileAndStats);

module.exports = router;