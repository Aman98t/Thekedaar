// Location: backend/routes/siteRoutes.js
const express = require('express');
const router = express.Router();
const Site = require('../models/Site');
const Assignment = require('../models/Assignment');

router.post('/create', async (req, res) => {
  try {
    // ✅ CHANGED
    const { name, contractorId } = req.body;
    const newSite = new Site({ name, contractorId });
    await newSite.save();
    res.status(201).json(newSite);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ✅ CHANGED: URL aur params
router.get('/contractor/:contractorId', async (req, res) => {
  try {
    const sites = await Site.find({ contractorId: req.params.contractorId });
    res.status(200).json(sites);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ASSIGN WORKER
router.post('/assign', async (req, res) => {
  try {
    const { workerId, siteId, contractorId } = req.body; // ✅ CHANGED
    
    const otherContractorAssignment = await Assignment.findOne({ 
      workerId, 
      contractorId: { $ne: contractorId } 
    });
    if (otherContractorAssignment) return res.status(400).json({ message: "Blocked: Yeh worker dusre contractor ke paas hai." });

    const existingAssignment = await Assignment.findOne({ workerId, siteId });
    if (existingAssignment) return res.status(200).json(existingAssignment); 

    const newAssignment = new Assignment({ workerId, siteId, contractorId });
    await newAssignment.save();
    res.status(201).json(newAssignment);
  } catch (error) { res.status(500).json({ message: "Error assigning worker", error: error.message }); }
});

// GET ASSIGNMENTS
router.get('/assignments/:contractorId', async (req, res) => {
  try {
    const assignments = await Assignment.find({ contractorId: req.params.contractorId }).populate('siteId');
    res.status(200).json(assignments);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/assignment/:workerId/:siteId', async (req, res) => {
  try {
    await Assignment.findOneAndDelete({ workerId: req.params.workerId, siteId: req.params.siteId });
    res.status(200).json({ message: "Worker removed from this specific site" });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/worker-sites/:workerId', async (req, res) => {
  try {
    const User = require('../models/User');
    const worker = await User.findById(req.params.workerId);
    if (!worker) return res.status(404).json({ message: "Worker not found" });

    // ✅ CHANGED: worker.thekedaarId -> worker.contractorId
    const sites = await Site.find({ contractorId: worker.contractorId });
    const assignments = await Assignment.find({ workerId: req.params.workerId }); 

    res.status(200).json({ sites, assignments });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ... (Baki ke Final Bill, Material, aur Task wale routes me koi 'thekedaar' term nahi tha, unhe waisa hi rehne do)
module.exports = router;