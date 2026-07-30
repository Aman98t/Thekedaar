// Location: backend/models/Attendance.js
const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  workerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  siteId: { 
    type: String, 
    required: true 
  },
  date: { 
    type: String, 
    required: true // Format: "YYYY-MM-DD"
  },
  status: { 
    type: String, 
    enum: ['present', 'absent', 'halfday'], 
    required: true 
  }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);