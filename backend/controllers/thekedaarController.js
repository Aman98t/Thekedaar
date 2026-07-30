// ==========================================
// 👷 THEKEDAAR CONTROLLER (Labour Management)
// Location: backend/controllers/thekedaarController.js
// ==========================================
const bcrypt = require('bcrypt');
const User = require('../models/User');

// Thekedaar द्वारा नया Labour क्रिएट करने का फंक्शन
const createLabour = async (req, res) => {
  try {
    const { name, phone, password, skill, dailyWage } = req.body;
    const contractorId = req.user.userId; // Token se aayi logged-in thekedaar ki ID

    if (!name || !phone || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Name, phone, and password are required for labour" 
      });
    }

    // Check karo ki phone number pehle se exist toh nahi karta
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: "User with this phone number already exists" 
      });
    }

    // Password hash karo
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // New Labour user create karo with contractor reference
    const newLabour = new User({
      name,
      phone,
      password: hashedPassword,
      role: 'labour',
      contractorId: contractorId, // Kis thekedaar ke under hai
      skill: skill || 'Helper',
      dailyWage: dailyWage || 0
    });

    await newLabour.save();

    res.status(201).json({
      success: true,
      message: `Labour (${name}) successfully added to your roster!`,
      labour: {
        id: newLabour._id,
        name: newLabour.name,
        phone: newLabour.phone,
        skill: newLabour.skill,
        dailyWage: newLabour.dailyWage
      }
    });

  } catch (error) {
    console.error("Error creating labour:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error while adding labour" 
    });
  }
};

// Logged-in thekedaar ke sabhi labours ki list fetch karne ka function
const getMyLabours = async (req, res) => {
  try {
    const contractorId = req.user.userId;
    const labours = await User.find({ role: 'labour', contractorId }).select('-password');

    res.status(200).json({
      success: true,
      count: labours.length,
      labours
    });
  } catch (error) {
    console.error("Error fetching labours:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/// ==========================================
// 🔑 RESET LABOUR PASSWORD (By Thekedaar)
// Location: backend/controllers/thekedaarController.js
// ==========================================
const resetLabourPassword = async (req, res) => {
  try {
    const { labourId, newPassword } = req.body;
    const contractorId = req.user.userId; // Token se aayi current logged-in Thekedaar ki ID

    if (!labourId || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: "Labour ID and New Password are required" 
      });
    }

    // Security Check: Ensure karo ki ye labour isi thekedaar ke under hai
    const labour = await User.findOne({ _id: labourId, contractorId, role: 'labour' });
    if (!labour) {
      return res.status(404).json({ 
        success: false, 
        message: "Labour not found in your roster or unauthorized access" 
      });
    }

    // Naya password hash karke save karo
    const salt = await bcrypt.genSalt(10);
    labour.password = await bcrypt.hash(newPassword, salt);
    await labour.save();

    res.status(200).json({
      success: true,
      message: `Password for ${labour.name} has been reset successfully!`
    });

  } catch (error) {
    console.error("Error resetting labour password:", error);
    res.status(500).json({ success: false, message: "Server error during password reset" });
  }
};

module.exports = { createLabour, getMyLabours, resetLabourPassword };