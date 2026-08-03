// Location: backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User'); 
const { resetPasswordByAuthority } = require('../controllers/userController'); 

// 1. REGISTER API
router.post('/register', async (req, res) => {
  try {
    const { name, phone, password, role, dailyWage, skill } = req.body;
    const existingUser = await User.findOne({ phone });
    if (existingUser) return res.status(400).json({ message: "Ye phone number pehle se registered hai!" });
    
    const newUser = new User({ name, phone, password, role, dailyWage, skill });
    await newUser.save();
    res.status(201).json({ message: "User successfully create ho gaya!", user: newUser });
  } catch (error) { res.status(500).json({ message: "Server me error aayi", error: error.message }); }
});

// 2. LOGIN API
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ message: "System me ye number nahi mila!" });
    if (password && user.password !== password) return res.status(400).json({ message: "Galat Password PIN!" });
    if (user.status === 'Suspended') return res.status(403).json({ message: "Admin ne ye account block kar diya hai." });
    
    res.status(200).json({ message: "Login Successful!", user });
  } catch (error) { res.status(500).json({ message: "Server me error aayi", error: error.message }); }
});

// 3. GET ALL CONTRACTORS
router.get('/contractors', async (req, res) => {
  try {
    // ✅ CHANGED: role thekedaar -> contractor
    const contractors = await User.find({ role: 'contractor' });
    res.status(200).json(contractors);
  } catch (error) { res.status(500).json({ message: "Server me error aayi", error: error.message }); }
});

// 4. DELETE CONTRACTOR
router.delete('/contractor/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Contractor successfully deleted!" });
  } catch (error) { res.status(500).json({ message: "Delete karne me error aayi", error: error.message }); }
});
  
// 5. UPDATE STATUS 
router.put('/contractor/status/:id', async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { status: req.body.status });
    res.status(200).json({ message: `Status updated to ${req.body.status}` });
  } catch (error) { res.status(500).json({ message: "Status update karne me error aayi", error: error.message }); }
});

// 6. ADD WORKER API
// ✅ CHANGED: /labour/register -> /worker/register
router.post('/worker/register', async (req, res) => {
  try {
    // ✅ CHANGED: thekedaarId -> contractorId
    const { name, phone, password, dailyWage, skill, contractorId } = req.body;
    const existingUser = await User.findOne({ phone });
    if (existingUser) return res.status(400).json({ message: "Ye phone number pehle se registered hai!" });
    
    const newWorker = new User({ 
      name, phone, password, role: 'worker', dailyWage, skill, contractorId 
    });
    await newWorker.save();
    res.status(201).json({ message: "Worker successfully add ho gaya!", user: newWorker });
  } catch (error) { res.status(500).json({ message: "Server me error aayi", error: error.message }); }
});
  
// 7. GET CONTRACTOR'S WORKERS
// ✅ CHANGED: /labours/:thekedaarId -> /workers/:contractorId
router.get('/workers/:contractorId', async (req, res) => {
  try {
    const workers = await User.find({ role: 'worker', contractorId: req.params.contractorId });
    res.status(200).json(workers);
  } catch (error) { res.status(500).json({ message: "Server me error aayi", error: error.message }); }
});

// 8. REQUEST PASSWORD RESET 
router.post('/request-password-reset', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ success: false, message: "Please provide a phone number." });

    const user = await User.findOne({ phone }); 
    if (!user) return res.status(404).json({ success: false, message: "No account found with this number." });

    user.resetRequested = true; 
    await user.save(); 

    res.status(200).json({ success: true, message: "Reset request sent successfully." });
  } catch (error) { res.status(500).json({ success: false, message: "Server error" }); }
});

// 9. AUTHORITY RESET PASSWORD 
router.put('/:userId/reset-password', resetPasswordByAuthority);

module.exports = router;