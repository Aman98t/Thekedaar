// Location: backend/models/Advance.js
const mongoose = require('mongoose');

const advanceSchema = new mongoose.Schema({
  workerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  workerName: { 
    type: String, 
    required: true // Frontend par naam dikhane ke liye
  },
  siteId: { 
    type: String, 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  date: { 
    type: String, 
    required: true // Format: "DD-MMM-YYYY" jaisa frontend bhejta hai
  }
}, { timestamps: true }); // timestamps se hume pata chalega kab paise diye gaye

module.exports = mongoose.model('Advance', advanceSchema);