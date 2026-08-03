// ==========================================
// 👷 WORKER CONTROLLER (Worker Self-Service)
// Location: backend/controllers/workerController.js
// ==========================================
const User = require('../models/User');

const getMyProfileAndStats = async (req, res) => {
  try {
    const workerId = req.user.userId; // JWT Token se aayi logged-in worker ki ID

    const workerProfile = await User.findById(workerId).select('-password');
    if (!workerProfile) {
      return res.status(404).json({ success: false, message: "Worker profile not found" });
    }

    res.status(200).json({
      success: true,
      profile: workerProfile,
      stats: {
        dailyWage: workerProfile.dailyWage || 0,
        skill: workerProfile.skill || 'Helper',
        status: workerProfile.status || 'Active'
      }
    });
  } catch (error) {
    console.error("Error fetching worker stats:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { getMyProfileAndStats };