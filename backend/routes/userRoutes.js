// Location: backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Apna blueprint import kiya

// ==========================================
// 1. REGISTER API (Naya user database me dalne ke liye)
// ==========================================
router.post('/register', async (req, res) => {
  try {
    // Frontend se ye data aayega
    const { name, phone, password, role, dailyWage, skill } = req.body;

    // Check karo ki is phone number se pehle koi user toh nahi hai?
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: "Ye phone number pehle se registered hai!" });
    }

    // Naya user banao aur database me save karo
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

    // Database me number dhoondo
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ message: "System me ye number nahi mila!" });
    }

    // Password match karo (Agar password dala gaya hai toh)
    if (password && user.password !== password) {
      return res.status(400).json({ message: "Galat Password PIN!" });
    }

    // Agar account suspend ho gaya ho
    if (user.status === 'Suspended') {
      return res.status(403).json({ message: "Admin ne ye account block kar diya hai." });
    }

    // Login hit! User ka data frontend ko wapas bhej do
    res.status(200).json({ message: "Login Successful!", user });
  } catch (error) {
    res.status(500).json({ message: "Server me error aayi", error: error.message });
  }
});

module.exports = router;
// ==========================================
// 3. GET ALL CONTRACTORS (Admin Dashboard ke liye)
// ==========================================
router.get('/contractors', async (req, res) => {
    try {
      // Database se sirf wo users nikalo jinka role 'thekedaar' hai
      const contractors = await User.find({ role: 'thekedaar' });
      
      // Data frontend ko bhej do
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
      await User.findByIdAndDelete(id); // Database se thekedaar uda do
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
      
      // Database me thekedaar ko dhundo aur uska status update kar do
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
  
      // Check karo number pehle se toh nahi
      const existingUser = await User.findOne({ phone });
      if (existingUser) {
        return res.status(400).json({ message: "Ye phone number pehle se registered hai!" });
      }
  
      // Naya labour banao aur thekedaar ki ID usme jod do
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
      // Database se sirf wo labour nikalo jinki thekedaarId match ho rahi ho
      const labours = await User.find({ role: 'labour', thekedaarId: req.params.thekedaarId });
      res.status(200).json(labours);
    } catch (error) {
      res.status(500).json({ message: "Server me error aayi", error: error.message });
    }
  });

  const { resetPasswordByAuthority } = require('../controllers/userController');

// Ye route hona chahiye:
router.put('/:userId/reset-password', resetPasswordByAuthority);