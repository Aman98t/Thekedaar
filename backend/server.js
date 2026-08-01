// ==========================================
// THEKEDAAR ERP - MAIN SERVER ENTRY POINT
// ==========================================
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');

const mongoose = require('mongoose'); // 👈 Naya: Mongoose import kiya


const app = express();

// ✅ STRICT CORS SECURITY SETUP
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);

const User = require('./models/User'); // 👈 Ye line upar imports me add karni hai (schema ke liye)

// 🔌 MongoDB Connection & Auto-Seed Logic
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('🟢 MongoDB Database Connected Successfully!');
    
    // 🌱 Auto-Create Admin & Thekedaar if Database is empty
    const adminExists = await User.findOne({ phone: '9876543210' });
    if (!adminExists) {
      await User.create({ name: 'Aman98t (Master Admin)', phone: '9876543210', password: 'admin', role: 'admin' });
      console.log('🧑‍💻 Default Admin Injected into Database!');
    }

    const thekedaarExists = await User.findOne({ phone: '9988776655' });
    if (!thekedaarExists) {
      await User.create({ name: 'Sikindra Singh', phone: '9988776655', password: 'admin', role: 'thekedaar' });
      console.log('🏗️ Default Thekedaar Injected into Database!');
    }
  })
  .catch((err) => console.log('🔴 MongoDB Connection Error: ', err));
// ... (Baaki ka tumhara route aur listen wala code waisa hi rahega)




/// 🔌 API ROUTES KO SERVER ME LINK KAREIN
const userRoutes = require('./routes/userRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const advanceRoutes = require('./routes/advanceRoutes'); // 👈 NAYI LINE
const adminRoutes = require('./routes/adminRoutes'); // 👈 NAYI LINE
const labourRoutes = require('./routes/labourRoutes');
const siteRoutes = require('./routes/siteRoutes'); // 👈 NAYI LINE
const thekedaarRoutes = require('./routes/thekedaarRoutes');
app.use('/api/labour', labourRoutes);
app.use('/api/thekedaar', thekedaarRoutes);
app.use('/api/users', userRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/advances', advanceRoutes); // 👈 NAYI LINE
app.use('/api/admin', adminRoutes); // 👈 NAYI LINE
app.use('/api/sites', siteRoutes); // 👈 NAYI LINE
// 🚀 Server Listen configuration
// ... (Niche ka server listen wala code)

// 🌐 Default Test Route (API Check)
app.get('/', (req, res) => {
  res.json({ 
    message: "Welcome to Thekedaar ERP API! 🚀", 
    status: "Server is running smoothly." 
  });
});

// 🚀 Server Listen configuration
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n===========================================`);
  console.log(`🚀 Server is LIVE and running on PORT: ${PORT}`);
  console.log(`🔗 Test URL: http://localhost:${PORT}`);
  console.log(`===========================================\n`);
});