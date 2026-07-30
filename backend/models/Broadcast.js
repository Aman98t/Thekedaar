// Location: backend/models/Broadcast.js
const mongoose = require('mongoose');

const broadcastSchema = new mongoose.Schema({
  message: { type: String, required: true },
  targetSegment: { 
    type: String, 
    enum: ['all', 'Active', 'Suspended'], 
    default: 'all' 
  },
  language: { 
    type: String, 
    enum: ['en', 'hi'], 
    default: 'en' 
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Broadcast', broadcastSchema);