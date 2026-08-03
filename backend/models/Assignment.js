// Location: backend/models/Assignment.js
const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  workerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  siteId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Site', 
    required: true 
  },
  // ✅ CHANGED: thekedaarId -> contractorId
  contractorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);