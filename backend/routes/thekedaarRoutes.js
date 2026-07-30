// ==========================================
// 🛣️ THEKEDAAR ROUTES
// Location: backend/routes/thekedaarRoutes.js
// ==========================================
const express = require('express');
const router = express.Router();
const { createLabour, getMyLabours, resetLabourPassword } = require('../controllers/thekedaarController');
const verifyToken = require('../middleware/authMiddleware');
const verifyThekedaar = require('../middleware/thekedaarMiddleware');
// PUT /api/thekedaar/reset-password
router.put('/reset-password', verifyToken, verifyThekedaar, resetLabourPassword);
// POST /api/thekedaar/add-labour (Only Contractor can add)
router.post('/add-labour', verifyToken, verifyThekedaar, createLabour);

// GET /api/thekedaar/labours (Get contractor's own labours list)
router.get('/labours', verifyToken, verifyThekedaar, getMyLabours);

module.exports = router;