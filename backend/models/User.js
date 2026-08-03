// Location: backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    // ✅ CHANGED: thekedaar -> contractor, labour -> worker
    enum: ['admin', 'contractor', 'worker'], 
    required: true 
  },
  status: { type: String, default: 'Active' },
  // ✅ CHANGED: thekedaarId aur duplicate fields ko merge karke sirf contractorId rakha
  contractorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    default: null 
  },
  // 👷 WORKER SPECIFIC FIELDS
  dailyWage: { type: Number },
  skill: { type: String },
  assignedSiteId: { type: String },
  resetRequested: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);