// Location: backend/routes/siteRoutes.js
const express = require('express');
const router = express.Router();
const Site = require('../models/Site');
const Assignment = require('../models/Assignment');

router.post('/create', async (req, res) => {
  try {
    const { name, thekedaarId } = req.body;
    const newSite = new Site({ name, thekedaarId });
    await newSite.save();
    res.status(201).json(newSite);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/thekedaar/:thekedaarId', async (req, res) => {
  try {
    const sites = await Site.find({ thekedaarId: req.params.thekedaarId });
    res.status(200).json(sites);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 🚀 NAYA LOGIC: ONE CONTRACTOR -> MULTIPLE SITES RULE
router.post('/assign', async (req, res) => {
  try {
    const { workerId, siteId, thekedaarId } = req.body;
    
    // Check 1: Kya ye majdoor kisi DUSRE thekedaar ke paas kaam kar raha hai?
    const otherContractorAssignment = await Assignment.findOne({ 
      workerId, 
      thekedaarId: { $ne: thekedaarId } 
    });
    if (otherContractorAssignment) {
      return res.status(400).json({ message: "Blocked: Yeh majdoor pehle se kisi dusre thekedaar ke saath juda hai." });
    }

    // Check 2: Kya ye majdoor IS SITE par pehle se assigned hai?
    const existingAssignment = await Assignment.findOne({ workerId, siteId });
    if (existingAssignment) {
      return res.status(200).json(existingAssignment); 
    }

    // Pass: Agar sab theek hai, toh ek aur Nayi Assignment bana do (Multiple sites allowed)
    const newAssignment = new Assignment({ workerId, siteId, thekedaarId });
    await newAssignment.save();
    res.status(201).json(newAssignment);
  } catch (error) {
    res.status(500).json({ message: "Error assigning worker", error: error.message });
  }
});

router.get('/assignments/:thekedaarId', async (req, res) => {
  try {
    const assignments = await Assignment.find({ thekedaarId: req.params.thekedaarId }).populate('siteId');
    res.status(200).json(assignments);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 🚀 UPDATE: Remove from a SPECIFIC site (not all sites)
router.delete('/assignment/:workerId/:siteId', async (req, res) => {
  try {
    await Assignment.findOneAndDelete({ workerId: req.params.workerId, siteId: req.params.siteId });
    res.status(200).json({ message: "Worker removed from this specific site" });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 🚀 UPDATE: Get ALL assignments for the worker Dropdown
router.get('/worker-sites/:workerId', async (req, res) => {
  try {
    const User = require('../models/User');
    const worker = await User.findById(req.params.workerId);
    if (!worker) return res.status(404).json({ message: "Worker not found" });

    const sites = await Site.find({ thekedaarId: worker.thekedaarId });
    const assignments = await Assignment.find({ workerId: req.params.workerId }); // Find ALL assignments

    res.status(200).json({ sites, assignments });
  } catch (error) { res.status(500).json({ error: error.message }); }
});
// ==========================================
// 7. SET FINAL BILL (Malik ka bill)
// ==========================================
router.put('/:siteId/final-bill', async (req, res) => {
  try {
    const site = await Site.findByIdAndUpdate(req.params.siteId, { finalBill: req.body.finalBill }, { new: true });
    res.status(200).json(site);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ==========================================
// 8. ADD OWNER PAYMENT (Malik se paise mile)
// ==========================================
router.post('/:siteId/owner-payment', async (req, res) => {
  try {
    const site = await Site.findById(req.params.siteId);
    site.ownerPayments.push(req.body);
    await site.save();
    res.status(200).json(site);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ==========================================
// 9. ADD MATERIAL & VENDOR (Samaan aur Kharcha)
// ==========================================
router.post('/:siteId/material', async (req, res) => {
  try {
    const site = await Site.findById(req.params.siteId);
    site.materials.push(req.body);
    await site.save();
    res.status(200).json(site);
  } catch (error) { res.status(500).json({ error: error.message }); }
});
// ==========================================
// 10. DELETE MATERIAL ENTRY
// ==========================================
router.delete('/:siteId/material/:materialId', async (req, res) => {
  try {
    const site = await Site.findById(req.params.siteId);
    // MongoDB array se item hata dega
    site.materials.pull({ _id: req.params.materialId }); 
    await site.save();
    res.status(200).json(site);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ==========================================
// 11. ADD NEW TASK
// ==========================================
router.post('/:siteId/task', async (req, res) => {
  try {
    const site = await Site.findById(req.params.siteId);
    site.tasks.push(req.body);
    await site.save();
    res.status(200).json(site);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ==========================================
// 12. UPDATE TASK STATUS (Move between columns)
// ==========================================
router.put('/:siteId/task/:taskId', async (req, res) => {
  try {
    const site = await Site.findById(req.params.siteId);
    const task = site.tasks.id(req.params.taskId);
    if (task) {
      task.status = req.body.status;
      await site.save();
    }
    res.status(200).json(site);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ==========================================
// 13. DELETE TASK
// ==========================================
router.delete('/:siteId/task/:taskId', async (req, res) => {
  try {
    const site = await Site.findById(req.params.siteId);
    site.tasks.pull({ _id: req.params.taskId });
    await site.save();
    res.status(200).json(site);
  } catch (error) { res.status(500).json({ error: error.message }); }
});
module.exports = router;