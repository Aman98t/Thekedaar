// Location: backend/models/Site.js
const mongoose = require('mongoose');

const siteSchema = new mongoose.Schema({
  name: { type: String, required: true },
  // ✅ CHANGED: thekedaarId -> contractorId
  contractorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  finalBill: { type: Number, default: 0 },
  ownerPayments: [{
    amount: { type: Number, required: true },
    date: { type: String, required: true }
  }],
  
  materials: [{
    vendorName: { type: String, required: true },
    materialType: { type: String, required: true },
    ratePerPiece: { type: Number, required: true },
    quantity: { type: Number, required: true },
    cost: { type: Number, required: true },
    date: { type: String, required: true }
  }],

  // ✅ FIXED: Ye pehle schema brackets ke bahar chala gaya tha, isko andar kar diya.
  tasks: [{
    title: { type: String, required: true },
    status: { type: String, enum: ['todo', 'progress', 'done'], default: 'todo' },
    priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
    date: { type: String, required: true }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Site', siteSchema);