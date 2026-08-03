// ==========================================
// 🛣️ WORKER ROUTES
// Location: backend/routes/workerRoutes.js
// ==========================================
const express = require('express');
const router = express.Router();
// ✅ CHANGED: labourController -> workerController
const { getMyProfileAndStats } = require('../controllers/workerController');
const verifyToken = require('../middleware/authMiddleware');

// Worker ki profile fetch karne ka route (Tumhare paas jo bhi route tha, usi hisab se likha hai)
router.get('/profile', verifyToken, getMyProfileAndStats);

module.exports = router;