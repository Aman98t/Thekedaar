// Location: backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // ✅ NAYA: JWT import kiya
const User = require('../models/User'); 
const { resetPasswordByAuthority } = require('../controllers/userController'); 

const JWT_SECRET = process.env.JWT_SECRET || 'buildhub_super_secret_key_2026';

// 1. REGISTER API
router.post('/register', async (req, res) => {
  try {
    const { name, phone, password, role, dailyWage, skill, contractorId } = req.body;
    const existingUser = await User.findOne({ phone });
    if (existingUser) return res.status(400).json({ message: "Ye phone number pehle se registered hai!" });
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ name, phone, password: hashedPassword, role, dailyWage, skill, contractorId });
    await newUser.save();
    res.status(201).json({ message: "User successfully create ho gaya!", user: newUser });
  } catch (error) { res.status(500).json({ message: "Server me error aayi", error: error.message }); }
});

// 2. LOGIN API (With Bcrypt + Secure Cookies)
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone });
    
    if (!user) return res.status(404).json({ message: "System me ye number nahi mila!" });
    if (user.status === 'Suspended') return res.status(403).json({ message: "Admin ne ye account block kar diya hai." });
    
    let isMatch = false;

    if (user.password.startsWith('$2')) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      isMatch = (password === user.password);
      if (isMatch) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();
      }
    }

    if (!isMatch) return res.status(400).json({ message: "Galat Password PIN!" });
    
    // ✅ NAYA: Generate JWT Token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' } // 1 din tak valid
    );

    // ✅ NAYA: Set Token in HttpOnly Cookie (Hacker proof)
    res.cookie('buildhub_token', token, {
      httpOnly: true, // Browser JS isko access nahi kar sakta
      secure: process.env.NODE_ENV === 'production', // Production (HTTPS) me hi true hoga
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 1 day in milliseconds
    });

    res.status(200).json({ success: true, message: "Login Successful!", user });
  } catch (error) { res.status(500).json({ message: "Server error", error: error.message }); }
});

// 2.1 LOGOUT API (Taaki cookie delete ho sake)
router.post('/logout', (req, res) => {
  res.clearCookie('buildhub_token');
  res.status(200).json({ success: true, message: "Logged out successfully" });
});

// ... (Baaaki sab APIs: contractors, delete, status, workers, reset-password waisi ki waisi hain)
router.get('/contractors', async (req, res) => {
  try {
    const contractors = await User.find({ role: 'contractor' });
    res.status(200).json(contractors);
  } catch (error) { res.status(500).json({ message: "Server error", error: error.message }); }
});

router.delete('/contractor/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Contractor deleted!" });
  } catch (error) { res.status(500).json({ message: "Error", error: error.message }); }
});
  
router.put('/contractor/status/:id', async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { status: req.body.status });
    res.status(200).json({ message: `Status updated to ${req.body.status}` });
  } catch (error) { res.status(500).json({ message: "Error", error: error.message }); }
});

router.post('/worker/register', async (req, res) => {
  try {
    const { name, phone, password, dailyWage, skill, contractorId } = req.body;
    const existingUser = await User.findOne({ phone });
    if (existingUser) return res.status(400).json({ message: "Already registered!" });
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newWorker = new User({ name, phone, password: hashedPassword, role: 'worker', dailyWage, skill, contractorId });
    await newWorker.save();
    res.status(201).json({ message: "Worker added!", user: newWorker });
  } catch (error) { res.status(500).json({ message: "Error", error: error.message }); }
});
  
router.get('/workers/:contractorId', async (req, res) => {
  try {
    const workers = await User.find({ role: 'worker', contractorId: req.params.contractorId });
    res.status(200).json(workers);
  } catch (error) { res.status(500).json({ message: "Error", error: error.message }); }
});

router.post('/request-password-reset', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ success: false, message: "Provide a phone number." });
    const user = await User.findOne({ phone }); 
    if (!user) return res.status(404).json({ success: false, message: "Account not found." });
    user.resetRequested = true; 
    await user.save(); 
    res.status(200).json({ success: true, message: "Request sent." });
  } catch (error) { res.status(500).json({ success: false, message: "Error" }); }
});

router.put('/:userId/reset-password', resetPasswordByAuthority);

module.exports = router;