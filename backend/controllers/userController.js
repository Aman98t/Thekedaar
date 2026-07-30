// ==========================================
// 🔑 USER CONTROLLER (Password Reset Logic)
// Location: backend/controllers/userController.js
// ==========================================
const bcrypt = require('bcrypt');
const User = require('../models/User'); // Apka User model (path check kar lena agar models folder alag ho)

// Admin ya Thekedaar dwara password reset karne ka function
const resetPasswordByAuthority = async (req, res) => {
  try {
    const { userId } = req.params; // Jiska password badalna hai uski ID
    const { newPassword } = req.body; // Naya password (jaise '123')

    if (!newPassword) {
      return res.status(400).json({ message: "New password is required" });
    }

    // 1. Password ko secure bcrypt hash me convert karo
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 2. Database me user ka password update karo
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { password: hashedPassword },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ 
      success: true, 
      message: `Password successfully reset for ${updatedUser.name}` 
    });

  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({ message: "Server error while resetting password" });
  }
};

module.exports = { resetPasswordByAuthority };