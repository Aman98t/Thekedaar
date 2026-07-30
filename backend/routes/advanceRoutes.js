// Location: backend/routes/advanceRoutes.js
const express = require('express');
const router = express.Router();
const Advance = require('../models/Advance');

// ==========================================
// 1. ISSUE ADVANCE (Thekedaar paise dega)
// ==========================================
router.post('/issue', async (req, res) => {
  try {
    const { workerId, workerName, siteId, amount, date } = req.body;

    const newAdvance = new Advance({
      workerId,
      workerName,
      siteId,
      amount,
      date
    });

    await newAdvance.save();
    res.status(201).json({ message: "Paise khate me save ho gaye!", advance: newAdvance });
  } catch (error) {
    res.status(500).json({ message: "Error issuing advance", error: error.message });
  }
});

// ==========================================
// 2. GET SITE ADVANCES (Thekedaar ke dashboard ke liye)
// ==========================================
router.get('/site/:siteId', async (req, res) => {
  try {
    // .sort({ createdAt: -1 }) se naye paise sabse upar dikhenge
    const advances = await Advance.find({ siteId: req.params.siteId }).sort({ createdAt: -1 });
    res.status(200).json(advances);
  } catch (error) {
    res.status(500).json({ message: "Error fetching advances", error: error.message });
  }
});

// ==========================================
// 3. GET WORKER ADVANCES (Labour ke dashboard ke liye)
// ==========================================
router.get('/worker/:workerId', async (req, res) => {
  try {
    const advances = await Advance.find({ workerId: req.params.workerId }).sort({ createdAt: -1 });
    res.status(200).json(advances);
  } catch (error) {
    res.status(500).json({ message: "Error fetching worker advances", error: error.message });
  }
});

module.exports = router;