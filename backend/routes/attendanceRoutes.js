// Location: backend/routes/attendanceRoutes.js
const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');

// ==========================================
// 1. MARK ATTENDANCE (Haazri lagana ya hatana)
// ==========================================
router.post('/mark', async (req, res) => {
  try {
    const { workerId, siteId, date, status } = req.body;

    // Agar status null/empty hai, matlab thekedaar ne haazri hata di hai
    if (!status) {
      await Attendance.findOneAndDelete({ workerId, siteId, date });
      return res.status(200).json({ message: "Attendance hat gayi" });
    }

    // Upsert Trick: Agar is tareekh ki haazri pehle se hai, toh UPDATE karo. Agar nahi hai, toh CREATE karo.
    const record = await Attendance.findOneAndUpdate(
      { workerId, siteId, date }, // In teeno se record dhoondo
      { status },                 // Status update karo
      { new: true, upsert: true } // Upsert magic ✨
    );

    res.status(200).json({ message: "Attendance saved!", record });
  } catch (error) {
    res.status(500).json({ message: "Error marking attendance", error: error.message });
  }
});

// ==========================================
// 2. GET SITE ATTENDANCE (Kisi site ki poori haazri dekhna)
// ==========================================
router.get('/site/:siteId', async (req, res) => {
  try {
    const records = await Attendance.find({ siteId: req.params.siteId });
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: "Error fetching attendance", error: error.message });
  }
});

module.exports = router;
// ==========================================
// 3. GET SINGLE WORKER'S ATTENDANCE (Sirf majdoor ki haazri)
// ==========================================
router.get('/worker/:workerId', async (req, res) => {
    try {
      // Database se us worker ki saari haazri nikal lo
      const records = await Attendance.find({ workerId: req.params.workerId });
      res.status(200).json(records);
    } catch (error) {
      res.status(500).json({ message: "Error fetching attendance", error: error.message });
    }
  });