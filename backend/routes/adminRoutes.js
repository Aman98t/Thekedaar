// Location: backend/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Advance = require('../models/Advance');
const Site = require('../models/Site'); 

// ✅ NAYA: Naye controller function names import kiye 
const { createContractor, resetContractorPassword } = require('../controllers/adminController');
const verifyToken = require('../middleware/authMiddleware');
const verifyAdmin = require('../middleware/adminMiddleware');

// PUT /api/admin/reset-password
router.put('/reset-password', verifyToken, verifyAdmin, resetContractorPassword); // ✅ CHANGED

// POST /api/admin/create-contractor (Only Admin can access)
router.post('/create-contractor', verifyToken, verifyAdmin, createContractor); // ✅ CHANGED

// ==========================================
// 1. GET GLOBAL ADMIN DASHBOARD STATS (Top ke 3 bade dabbe)
// ==========================================
router.get('/stats', async (req, res) => {
  try {
    // ✅ CHANGED: thekedaar -> contractor, labour -> worker
    const totalContractors = await User.countDocuments({ role: 'contractor' });
    const totalWorkers = await User.countDocuments({ role: 'worker' });
    
    const advanceAggregation = await Advance.aggregate([
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } }
    ]);
    const totalFundsDeployed = advanceAggregation.length > 0 ? advanceAggregation[0].totalAmount : 0;

    res.status(200).json({ totalContractors, totalWorkers, totalFundsDeployed });
  } catch (error) {
    res.status(500).json({ message: "Error calculating stats", error: error.message });
  }
});

// ==========================================
// 2. GET DETAILED CONTRACTOR LIST (Table ke liye asli data)
// ==========================================
router.get('/contractors-detailed', async (req, res) => {
  try {
    // ✅ CHANGED: thekedaar -> contractor
    const contractors = await User.find({ role: 'contractor' });

    // Har contractor ka hisaab calculate karo
    const detailedData = await Promise.all(contractors.map(async (c) => {
      // 1. Iski kitni sites hain?
      // ✅ CHANGED: thekedaarId -> contractorId
      const activeSites = await Site.countDocuments({ contractorId: c._id });
      
      // 2. Iske under kitne worker register hain?
      // ✅ CHANGED: role: 'worker', contractorId
      const workers = await User.countDocuments({ role: 'worker', contractorId: c._id });
      
      // 3. Isne apne worker ko total kitna advance baanta hai?
      const contractorSites = await Site.find({ contractorId: c._id }).select('_id');
      const siteIds = contractorSites.map(s => s._id);
      
      const advanceAgg = await Advance.aggregate([
        { $match: { siteId: { $in: siteIds } } },
        { $group: { _id: null, totalAmount: { $sum: "$amount" } } }
      ]);
      const wagesProcessed = advanceAgg.length > 0 ? advanceAgg[0].totalAmount : 0;

      return {
        id: c._id,
        name: c.name,
        phone: c.phone,
        status: c.status || 'Active',
        activeSites,
        workers, // Ab is variable ka naam 'workers' hai
        wagesProcessed,
        resetRequested: c.resetRequested
      };
    }));

    res.status(200).json(detailedData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const Broadcast = require('../models/Broadcast');
const SystemBanner = require('../models/SystemBanner');

// ==========================================
// 3. CREATE PUSH BROADCAST ANNOUNCEMENT
// ==========================================
router.post('/broadcast', async (req, res) => {
  try {
    const { message, targetSegment, language } = req.body;
    const newBroadcast = new Broadcast({ message, targetSegment, language });
    await newBroadcast.save();
    res.status(201).json(newBroadcast);
  } catch (error) {
    res.status(500).json({ message: "Error dispatching broadcast", error: error.message });
  }
});

// ==========================================
// 4. GET ACTIVE BROADCASTS (For Users to Fetch)
// ==========================================
router.get('/broadcasts', async (req, res) => {
  try {
    const broadcasts = await Broadcast.find().sort({ createdAt: -1 }).limit(3);
    res.status(200).json(broadcasts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching broadcasts", error: error.message });
  }
});

// ==========================================
// 5. UPDATE MAINTENANCE BANNER STATE
// ==========================================
router.put('/banner', async (req, res) => {
  try {
    const { maintenanceMode, maintenanceText } = req.body;
    
    let banner = await SystemBanner.findOne();
    if (!banner) {
      banner = new SystemBanner({ maintenanceMode, maintenanceText });
    } else {
      banner.maintenanceMode = maintenanceMode;
      if (maintenanceText !== undefined) banner.maintenanceText = maintenanceText;
    }
    
    await banner.save();
    res.status(200).json(banner);
  } catch (error) {
    res.status(500).json({ message: "Error updating banner", error: error.message });
  }
});

// ==========================================
// 6. GET CURRENT MAINTENANCE BANNER STATE
// ==========================================
router.get('/banner', async (req, res) => {
  try {
    let banner = await SystemBanner.findOne();
    if (!banner) {
      banner = await SystemBanner.create({});
    }
    res.status(200).json(banner);
  } catch (error) {
    res.status(500).json({ message: "Error fetching banner", error: error.message });
  }
});

// ==========================================
// 7. GET REAL MONGODB DATABASE HEALTH & STATS
// ==========================================
router.get('/db-health', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const startTime = Date.now();
    
    const stats = await mongoose.connection.db.stats();
    const latencyMs = Math.max(Date.now() - startTime, 2);

    const indexSizeMB = (stats.indexSize / (1024 * 1024)).toFixed(2);
    const dataSizeMB = (stats.dataSize / (1024 * 1024)).toFixed(2);
    const storageSizeMB = (stats.storageSize / (1024 * 1024)).toFixed(2);
    const collectionsCount = stats.collections || 0;
    const objectsCount = stats.objects || 0;
    const indexesCount = stats.indexes || 0;

    res.status(200).json({
      latencyMs,
      indexSizeMB,
      dataSizeMB,
      storageSizeMB,
      collectionsCount,
      objectsCount,
      indexesCount,
      status: 'Optimal'
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching DB health", error: error.message });
  }
});
module.exports = router;