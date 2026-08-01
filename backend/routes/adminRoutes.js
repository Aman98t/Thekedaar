// Location: backend/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Advance = require('../models/Advance');
const Site = require('../models/Site'); // 🚀 NAYA: Site model import kiya
const { createThekedaar, resetThekedaarPassword } = require('../controllers/adminController');
const verifyToken = require('../middleware/authMiddleware');
const verifyAdmin = require('../middleware/adminMiddleware');

// PUT /api/admin/reset-password
router.put('/reset-password', verifyToken, verifyAdmin, resetThekedaarPassword);
// POST /api/admin/create-thekedaar (Only Admin can access)
router.post('/create-thekedaar', verifyToken, verifyAdmin, createThekedaar);
// ==========================================
// 1. GET GLOBAL ADMIN DASHBOARD STATS (Top ke 3 bade dabbe)
// ==========================================
router.get('/stats', async (req, res) => {
  try {
    const totalContractors = await User.countDocuments({ role: 'thekedaar' });
    const totalLabours = await User.countDocuments({ role: 'labour' });
    const advanceAggregation = await Advance.aggregate([
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } }
    ]);
    const totalFundsDeployed = advanceAggregation.length > 0 ? advanceAggregation[0].totalAmount : 0;

    res.status(200).json({ totalContractors, totalLabours, totalFundsDeployed });
  } catch (error) {
    res.status(500).json({ message: "Error calculating stats", error: error.message });
  }
});

// ==========================================
// 2. GET DETAILED CONTRACTOR LIST (Table ke liye asli data)
// ==========================================
router.get('/contractors-detailed', async (req, res) => {
  try {
    // Saare thekedaars dhoondho
    const thekedaars = await User.find({ role: 'thekedaar' });

    // Har thekedaar ka hisaab calculate karo
    const detailedData = await Promise.all(thekedaars.map(async (t) => {
      // 1. Iski kitni sites hain?
      const activeSites = await Site.countDocuments({ thekedaarId: t._id });
      
      // 2. Iske under kitne majdoor register hain?
      const workers = await User.countDocuments({ role: 'labour', thekedaarId: t._id });
      
      // 3. Isne apne majdooron ko total kitna advance baanta hai?
      // Uske liye pehle iski saari sites nikalte hain
      const thekedaarSites = await Site.find({ thekedaarId: t._id }).select('_id');
      const siteIds = thekedaarSites.map(s => s._id);
      
      const advanceAgg = await Advance.aggregate([
        { $match: { siteId: { $in: siteIds } } },
        { $group: { _id: null, totalAmount: { $sum: "$amount" } } }
      ]);
      const wagesProcessed = advanceAgg.length > 0 ? advanceAgg[0].totalAmount : 0;

      return {
        id: t._id,
        name: t.name,
        phone: t.phone,
        status: t.status || 'Active',
        activeSites,
        workers,
        wagesProcessed,
        resetRequested: t.resetRequested
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
    // Sabse latest 3 announcements lana (newest first)
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
    
    // System me hamesha sirf 1 banner document rahega (Singleton doc update/create)
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
    
    // Asli MongoDB stats ka command chalao aur execution time napo
    const stats = await mongoose.connection.db.stats();
    const latencyMs = Math.max(Date.now() - startTime, 2); // Minimum 2ms for local fast queries

    // Bytes ko MB me convert karo (2 decimal tak)
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