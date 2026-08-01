// Location: backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Apna blueprint import kiya
const { resetPasswordByAuthority } = require('../controllers/userController'); // Controller import upar kar diya

// ==========================================
// 1. REGISTER API (Naya user database me dalne ke liye)
// ==========================================
router.post('/register', async (req, res) => {
  try {
    const { name, phone, password, role, dailyWage, skill } = req.body;
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: "Ye phone number pehle se registered hai!" });
    }
    const newUser = new User({ name, phone, password, role, dailyWage, skill });
    await newUser.save();
    res.status(201).json({ message: "User successfully create ho gaya!", user: newUser });
  } catch (error) {
    res.status(500).json({ message: "Server me error aayi", error: error.message });
  }
});

// ==========================================
// 2. LOGIN API (Phone aur password check karne ke liye)
// ==========================================
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ message: "System me ye number nahi mila!" });
    }
    if (password && user.password !== password) {
      return res.status(400).json({ message: "Galat Password PIN!" });
    }
    if (user.status === 'Suspended') {
      return res.status(403).json({ message: "Admin ne ye account block kar diya hai." });
    }
    res.status(200).json({ message: "Login Successful!", user });
  } catch (error) {
    res.status(500).json({ message: "Server me error aayi", error: error.message });
  }
});

// ==========================================
// 3. GET ALL CONTRACTORS (Admin Dashboard ke liye)
// ==========================================
router.get('/contractors', async (req, res) => {
  try {
    const contractors = await User.find({ role: 'thekedaar' });
    res.status(200).json(contractors);
  } catch (error) {
    res.status(500).json({ message: "Server me error aayi", error: error.message });
  }
});

// ==========================================
// 4. DELETE CONTRACTOR API (Hamesha ke liye hatana)
// ==========================================
router.delete('/contractor/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.status(200).json({ message: "Contractor successfully deleted!" });
  } catch (error) {
    res.status(500).json({ message: "Delete karne me error aayi", error: error.message });
  }
});
  
// ==========================================
// 5. UPDATE STATUS API (Active/Suspended/Deactivated karna)
// ==========================================
router.put('/contractor/status/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await User.findByIdAndUpdate(id, { status: status });
    res.status(200).json({ message: `Status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ message: "Status update karne me error aayi", error: error.message });
  }
});

// ==========================================
// 6. ADD LABOUR API (Thekedaar apne majdoor add karega)
// ==========================================
router.post('/labour/register', async (req, res) => {
  try {
    const { name, phone, password, dailyWage, skill, thekedaarId } = req.body;
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: "Ye phone number pehle se registered hai!" });
    }
    const newLabour = new User({ 
      name, phone, password, role: 'labour', dailyWage, skill, thekedaarId 
    });
    await newLabour.save();
    res.status(201).json({ message: "Labour successfully add ho gaya!", user: newLabour });
  } catch (error) {
    res.status(500).json({ message: "Server me error aayi", error: error.message });
  }
});
  
// ==========================================
// 7. GET THEKEDAAR'S LABOURS (Sirf apne majdoor dekhne ke liye)
// ==========================================
router.get('/labours/:thekedaarId', async (req, res) => {
  try {
    const labours = await User.find({ role: 'labour', thekedaarId: req.params.thekedaarId });
    res.status(200).json(labours);
  } catch (error) {
    res.status(500).json({ message: "Server me error aayi", error: error.message });
  }
});

// ==========================================
// 8. 🔔 REQUEST PASSWORD RESET ROUTE (Frontend se aayegi request)
// ==========================================
router.post('/request-password-reset', async (req, res) => {
  console.log("🚀 userRoutes.js se Password Reset Request Aayi For:", req.body.phone);
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: "Please provide a phone number." });
    }

    const user = await User.findOne({ phone }); 
    if (!user) {
      return res.status(404).json({ success: false, message: "No account found with this number." });
    }

    user.resetRequested = true; 
    await user.save(); 

    res.status(200).json({ success: true, message: "Reset request sent to your superior successfully." });
  } catch (error) {
    console.error("Reset Request Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ==========================================
// 9. AUTHORITY RESET PASSWORD (Controller se linked)
// ==========================================
router.put('/:userId/reset-password', resetPasswordByAuthority);

// YEH LINE HAMESHA SABSE AAKHRI HONI CHAHIYE (Puri file me sirf 1 baar)
module.exports = router;