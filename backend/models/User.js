// Location: backend/models/User.js
const mongoose = require('mongoose');

// User ka blueprint (Schema) banate hain
const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  phone: { 
    type: String, 
    required: true, 
    unique: true // Ek number se ek hi account banega
  },
  password: { 
    type: String,
    required: true// Labour ke liye 4-digit PIN, ya Thekedaar ka password
  },
  role: { 
    type: String, 
    enum: ['admin', 'thekedaar', 'labour'], 
    required: true 
  },
  status: { 
    type: String, 
    default: 'Active' 
  },
  contractorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    default: null // Labour ke liye yeh thekedaar ki ID hogi
  },
  // 👷 LABOUR SPECIFIC FIELDS (Ye sirf labour ke kaam aayenge)
  dailyWage: { 
    type: Number 
  },
  skill: { 
    type: String 
  },
  assignedSiteId: { 
    type: String // Kis site par kaam kar raha hai
  },
  thekedaarId: { // 👈 NAYA: Ye batayega ki labour kis thekedaar ka hai
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { 
  timestamps: true // Ye auto-save karega ki user kab create/update hua (createdAt, updatedAt)
});


module.exports = mongoose.model('User', userSchema);