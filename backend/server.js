// ==========================================
// CONTRACTOR ERP - MAIN SERVER ENTRY POINT
// ==========================================
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/authRoutes');
const User = require('./models/User'); 

const app = express();

// ✅ STRICT CORS SECURITY SETUP
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
app.use('/api/auth', authRoutes);

// 🔌 MongoDB Connection & Auto-Seed Logic
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('🟢 MongoDB Database Connected Successfully!');
    
    // Bcrypt setup for default seeds
    const bcrypt = require('bcrypt');
    
    const adminExists = await User.findOne({ phone: '9876543210' });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPass = await bcrypt.hash('admin', salt); // Default password 'admin' ko hash kiya
      await User.create({ name: 'Aman98t (Master Admin)', phone: '9876543210', password: hashedPass, role: 'admin' });
      console.log('🧑‍💻 Default Admin Injected into Database!');
    }

    const contractorExists = await User.findOne({ phone: '9988776655' });
    if (!contractorExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPass = await bcrypt.hash('admin', salt);
      await User.create({ name: 'Sikindra Singh', phone: '9988776655', password: hashedPass, role: 'contractor' });
      console.log('🏗️ Default Contractor Injected into Database!');
    }
  })
  .catch((err) => console.log('🔴 MongoDB Connection Error: ', err));

// 🔌 API ROUTES KO SERVER ME LINK KAREIN
const userRoutes = require('./routes/userRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const advanceRoutes = require('./routes/advanceRoutes');
const adminRoutes = require('./routes/adminRoutes');
const siteRoutes = require('./routes/siteRoutes'); 
// ✅ CHANGED: Route names updated
const workerRoutes = require('./routes/workerRoutes'); 
const contractorRoutes = require('./routes/contractorRoutes'); 

app.use('/api/users', userRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/advances', advanceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/sites', siteRoutes);
// ✅ CHANGED: Endpoints updated
app.use('/api/worker', workerRoutes);
app.use('/api/contractor', contractorRoutes);

// 🌐 Default Test Route (API Check)
app.get('/', (req, res) => {
  res.json({ 
    message: "Welcome to Contractor ERP API! 🚀", 
    status: "Server is running smoothly." 
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n===========================================`);
  console.log(`🚀 Server is LIVE and running on PORT: ${PORT}`);
  console.log(`===========================================\n`);
});