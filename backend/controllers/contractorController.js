// ==========================================
// 🏗️ CONTRACTOR CONTROLLER (Worker Management)
// Location: backend/controllers/contractorController.js
// ==========================================
const bcrypt = require('bcrypt');
const User = require('../models/User');

// Contractor dvara naya Worker create karne ka function
const createWorker = async (req, res) => {
  try {
    const { name, phone, password, skill, dailyWage } = req.body;
    const contractorId = req.user.userId; 

    if (!name || !phone || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Name, phone, and password are required for worker" 
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

    // ✅ CHANGED: role labour -> worker
    const newWorker = new User({
      name,
      phone,
      password: hashedPassword,
      role: 'worker', 
      contractorId: contractorId, 
      skill: skill || 'Helper',
      dailyWage: dailyWage || 0
    });

    await newWorker.save();

    res.status(201).json({
      success: true,
      message: `Worker (${name}) successfully added to your roster!`,
      worker: {
        id: newWorker._id,
        name: newWorker.name,
        phone: newWorker.phone,
        skill: newWorker.skill,
        dailyWage: newWorker.dailyWage
      }
    });

  } catch (error) {
    console.error("Error creating worker:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error while adding worker" 
    });
  }
};

// Logged-in contractor ke sabhi workers ki list fetch karne ka function
const getMyWorkers = async (req, res) => {
  try {
    const contractorId = req.user.userId;
    // ✅ CHANGED: role labour -> worker
    const workers = await User.find({ role: 'worker', contractorId }).select('-password');

    res.status(200).json({
      success: true,
      count: workers.length,
      workers
    });
  } catch (error) {
    console.error("Error fetching workers:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==========================================
// 🔑 RESET WORKER PASSWORD (By Contractor)
// ==========================================
const resetWorkerPassword = async (req, res) => {
  try {
    const { workerId, newPassword } = req.body;
    const contractorId = req.user.userId; 

    if (!workerId || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: "Worker ID and New Password are required" 
      });
    }

    // ✅ CHANGED: role labour -> worker
    const worker = await User.findOne({ _id: workerId, contractorId, role: 'worker' });
    if (!worker) {
      return res.status(404).json({ 
        success: false, 
        message: "Worker not found in your roster or unauthorized access" 
      });
    }

    const salt = await bcrypt.genSalt(10);
    worker.password = await bcrypt.hash(newPassword, salt);
    await worker.save();

    res.status(200).json({
      success: true,
      message: `Password for ${worker.name} has been reset successfully!`
    });

  } catch (error) {
    console.error("Error resetting worker password:", error);
    res.status(500).json({ success: false, message: "Server error during password reset" });
  }
};

// ✅ CHANGED: Exports
module.exports = { createWorker, getMyWorkers, resetWorkerPassword };