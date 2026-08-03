// ==========================================
// 👨‍💼 ADMIN CONTROLLER (Contractor Management)
// Location: backend/controllers/adminController.js
// ==========================================
const bcrypt = require('bcrypt');
const User = require('../models/User');

// Admin dvara naya Contractor create karne ka function
const createContractor = async (req, res) => {
  try {
    const { name, phone, password } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Name, phone, and password are required for contractor" 
      });
    }

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: "User with this phone number already exists" 
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newContractor = new User({
      name,
      phone,
      password: hashedPassword,
      role: 'contractor', // ✅ CHANGED: thekedaar -> contractor
      contractorId: null
    });

    await newContractor.save();

    res.status(201).json({
      success: true,
      message: `Contractor (${name}) successfully created by Admin!`,
      contractor: {
        id: newContractor._id,
        name: newContractor.name,
        phone: newContractor.phone,
        role: newContractor.role
      }
    });

  } catch (error) {
    console.error("Error creating contractor:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error while creating contractor" 
    });
  }
};

// ==========================================
// 🔑 RESET CONTRACTOR PASSWORD (By Admin)
// ==========================================
const resetContractorPassword = async (req, res) => {
  try {
    // ✅ CHANGED: thekedaarId -> contractorId
    const { contractorId, newPassword } = req.body;

    if (!contractorId || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: "Contractor ID and New Password are required" 
      });
    }

    // ✅ CHANGED: role check
    const contractor = await User.findOne({ _id: contractorId, role: 'contractor' });
    if (!contractor) {
      return res.status(404).json({ 
        success: false, 
        message: "Contractor not found" 
      });
    }

    const salt = await bcrypt.genSalt(10);
    contractor.password = await bcrypt.hash(newPassword, salt);
    
    contractor.resetRequested = false; 
    await contractor.save();

    res.status(200).json({
      success: true,
      message: `Password for Contractor (${contractor.name}) reset successfully!`
    });

  } catch (error) {
    console.error("Error resetting contractor password:", error);
    res.status(500).json({ success: false, message: "Server error during password reset" });
  }
};

// ✅ CHANGED: Exports
module.exports = { createContractor, resetContractorPassword };