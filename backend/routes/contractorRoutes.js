// ==========================================
// 🛣️ CONTRACTOR ROUTES
// Location: backend/routes/contractorRoutes.js
// ==========================================
const express = require('express');
const router = express.Router();
// ✅ CHANGED: imports theek kar diye
const { createWorker, getMyWorkers, resetWorkerPassword } = require('../controllers/contractorController');
const verifyToken = require('../middleware/authMiddleware');
const verifyContractor = require('../middleware/contractorMiddleware');

router.put('/reset-password', verifyToken, verifyContractor, resetWorkerPassword);
router.post('/add-worker', verifyToken, verifyContractor, createWorker);
router.get('/workers', verifyToken, verifyContractor, getMyWorkers);

module.exports = router;