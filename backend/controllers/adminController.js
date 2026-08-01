// ==========================================
// 👨‍💼 ADMIN CONTROLLER (Contractor Management)
// Location: backend/controllers/adminController.js
// ==========================================
const bcrypt = require('bcrypt');
const User = require('../models/User');

// Admin द्वारा नया Thekedaar (Contractor) क्रिएट करने का फंक्शन
const createThekedaar = async (req, res) => {
  try {
    const { name, phone, password } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Name, phone, and password are required for contractor" 
      });
    }

    // Check karo ki kya yeh phone number pehle se registered hai
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

    // New Thekedaar user create karo
    const newThekedaar = new User({
      name,
      phone,
      password: hashedPassword,
      role: 'thekedaar',
      contractorId: null // Thekedaar direct admin ke under hai
    });

    await newThekedaar.save();

    res.status(201).json({
      success: true,
      message: `Contractor (${name}) successfully created by Admin!`,
      thekedaar: {
        id: newThekedaar._id,
        name: newThekedaar.name,
        phone: newThekedaar.phone,
        role: newThekedaar.role
      }
    });

  } catch (error) {
    console.error("Error creating thekedaar:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error while creating contractor" 
    });
  }
};
// ==========================================
// 🔑 RESET THEKEDAAR PASSWORD (By Admin)
// Location: backend/controllers/adminController.js
// ==========================================
const resetThekedaarPassword = async (req, res) => {
  try {
    const { thekedaarId, newPassword } = req.body;

    if (!thekedaarId || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: "Thekedaar ID and New Password are required" 
      });
    }

    // Check karo ki target user Thekedaar hi hai
    const thekedaar = await User.findOne({ _id: thekedaarId, role: 'thekedaar' });
    if (!thekedaar) {
      return res.status(404).json({ 
        success: false, 
        message: "Contractor (Thekedaar) not found" 
      });
    }

    // Password hash karke save karo
    const salt = await bcrypt.genSalt(10);
    thekedaar.password = await bcrypt.hash(newPassword, salt);
    
    // ✅ NAYA: Reset request flag ko false kar do taaki UI se red badge hat jaye
    thekedaar.resetRequested = false; 

    await thekedaar.save();

    res.status(200).json({
      success: true,
      message: `Password for Contractor (${thekedaar.name}) reset successfully!`
    });

  } catch (error) {
    console.error("Error resetting contractor password:", error);
    res.status(500).json({ success: false, message: "Server error during password reset" });
  }
};

// Ensure karo ki exports me dono functions included hon:
module.exports = { createThekedaar, resetThekedaarPassword };
