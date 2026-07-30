// ==========================================
// 👷 LABOUR CONTROLLER (Worker Self-Service)
// Location: backend/controllers/labourController.js
// ==========================================
const User = require('../models/User');
// Agar Attendance aur Advance models hain, unhe bhi import kar sakte ho
// const Attendance = require('../models/Attendance');

const getMyProfileAndStats = async (req, res) => {
  try {
    const labourId = req.user.userId; // JWT Token se aayi logged-in labour ki ID

    const labourProfile = await User.findById(labourId).select('-password');
    if (!labourProfile) {
      return res.status(404).json({ success: false, message: "Labour profile not found" });
    }

    // Yahan hum future me Labour ki total attendance aur advance balance query karke bhejenge
    res.status(200).json({
      success: true,
      profile: labourProfile,
      stats: {
        dailyWage: labourProfile.dailyWage || 0,
        skill: labourProfile.skill || 'Helper',
        status: labourProfile.status || 'Active'
      }
    });
  } catch (error) {
    console.error("Error fetching labour stats:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { getMyProfileAndStats };