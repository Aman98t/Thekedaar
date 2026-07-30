// ==========================================
// 🔐 AUTH CONTROLLER (Login & JWT Generation)
// Location: backend/controllers/authController.js
// ==========================================
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Secret key for JWT (Production me ise .env me rakhte hain)
const JWT_SECRET = process.env.JWT_SECRET || 'buildhub_super_secret_key_2026';

const loginUser = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ success: false, message: "Phone number and password are required" });
    }

    // 1. Phone number se user ko database me search karo
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid phone number or password" });
    }

    // 2. Password match karo bcrypt.compare se
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid phone number or password" });
    }

    // 3. User active hai ya nahi check karo
    if (user.status && user.status === 'Suspended') {
      return res.status(403).json({ success: false, message: "Account is suspended. Contact Admin." });
    }

    // 4. JWT Token generate karo (expires in 7 days)
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 5. Success response bhejo (password ko chhor kar baaki user data)
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        status: user.status
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error during login" });
  }
};

module.exports = { loginUser };