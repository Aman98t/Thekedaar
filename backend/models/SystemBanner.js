// Location: backend/models/SystemBanner.js
const mongoose = require('mongoose');

const systemBannerSchema = new mongoose.Schema({
  maintenanceMode: { type: Boolean, default: false },
  maintenanceText: { 
    type: String, 
    default: 'Scheduled system maintenance tomorrow from 2:00 AM to 4:00 AM IST. Platforms will be offline.' 
  }
}, { timestamps: true });

module.exports = mongoose.model('SystemBanner', systemBannerSchema);