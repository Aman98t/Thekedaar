// ==========================================
// 🔑 USER CONTROLLER (Password Reset Logic)
// Location: backend/controllers/userController.js
// ==========================================
const bcrypt = require('bcrypt'); // ✅ NAYA: Bcrypt import kiya
const User = require('../models/User'); 

const resetPasswordByAuthority = async (req, res) => {
  try {
    const { userId } = req.params; 
    const { newPassword } = req.body; 

    if (!newPassword) {
      return res.status(400).json({ success: false, message: "New password is required" });
    }

    // ✅ NAYA: Naye password ko hash kar rahe hain
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        password: hashedPassword, // ✅ NAYA: Hashed password save kiya
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