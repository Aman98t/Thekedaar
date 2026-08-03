// ==========================================
// 🔑 USER CONTROLLER (Password Reset Logic)
// Location: backend/controllers/userController.js
// ==========================================
const User = require('../models/User'); 

// Admin ya Contractor dvara password reset karne ka function
const resetPasswordByAuthority = async (req, res) => {
  try {
    const { userId } = req.params; 
    const { newPassword } = req.body; 

    if (!newPassword) {
      return res.status(400).json({ success: false, message: "New password is required" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        password: newPassword,         
        resetRequested: false          
      },
      { new: true } 
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ 
      success: true, 
      message: `Password successfully reset for ${updatedUser.name}!` 
    });

  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({ success: false, message: "Server error while resetting password" });
  }
};

module.exports = { resetPasswordByAuthority };