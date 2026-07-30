// Location: backend/models/Site.js
const mongoose = require('mongoose');

const siteSchema = new mongoose.Schema({
  name: { type: String, required: true },
  thekedaarId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // 🚀 NAYA: Malik Ka Khata
  finalBill: { type: Number, default: 0 },
  ownerPayments: [{
    amount: { type: Number, required: true },
    date: { type: String, required: true }
  }],
  
  // 🚀 NAYA: Material & Vendor Log
  // 🚀 UPDATE: Material & Vendor Log (Updated for precise tracking)
  materials: [{
    vendorName: { type: String, required: true },
    materialType: { type: String, required: true },
    ratePerPiece: { type: Number, required: true },
    quantity: { type: Number, required: true },
    cost: { type: Number, required: true },
    date: { type: String, required: true }
  }]

  
}, { timestamps: true });
// 🚀 NAYA: Task & Milestone Board Logic
tasks: [{
  title: { type: String, required: true },
  status: { type: String, enum: ['todo', 'progress', 'done'], default: 'todo' },
  priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
  date: { type: String, required: true }
}]
module.exports = mongoose.model('Site', siteSchema);