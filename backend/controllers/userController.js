// ==========================================
// 🔑 USER CONTROLLER (Password Reset Logic)
// Location: backend/controllers/userController.js
// ==========================================
const bcrypt = require('bcrypt');


// Admin ya Thekedaar dwara password reset karne ka function
const User = require('../models/User'); // Ensure karna ki User model imported ho

const resetPasswordByAuthority = async (req, res) => {
  try {
    const { userId } = req.params; // Jiska password badalna hai uski ID
    const { newPassword } = req.body; // Naya password (jaise '123')

    if (!newPassword) {
      return res.status(400).json({ success: false, message: "New password is required" });
    }

    // 1. Database me user ka password update karo AUR reset flag hata do
    // (Bcrypt hata diya hai taaki Login wale plain text comparison se match ho sake)
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        password: newPassword,         // Naya plain password (e.g. '123')
        resetRequested: false          // ✅ NAYA: Isse Lal Button (Red Badge) gayab ho jayega
      },
      { new: true } // Update hone ke baad naya data wapas de
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