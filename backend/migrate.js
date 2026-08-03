// Location: backend/migrate.js
require('dotenv').config(); // Taaki .env se MongoDB ka URL mil sake
const mongoose = require('mongoose');

// Apne models import kar rahe hain
const User = require('./models/User');
const Assignment = require('./models/Assignment');
const Site = require('./models/Site');

const migrateData = async () => {
  try {
    console.log("⏳ Database se connect ho raha hai...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Database Connected!\n");

    console.log("🚀 Migration Shuru ho rahi hai...\n");

    // ==========================================
    // 1. USERS COLLECTION UPDATES
    // ==========================================
    console.log("🔄 Users update ho rahe hain...");
    
    // Role thekedaar -> contractor
    const thekedaarUpdate = await User.updateMany(
      { role: 'thekedaar' }, 
      { $set: { role: 'contractor' } }
    );
    console.log(`- ${thekedaarUpdate.modifiedCount} Thekedaars ko Contractor banaya.`);

    // Role labour -> worker
    const labourUpdate = await User.updateMany(
      { role: 'labour' }, 
      { $set: { role: 'worker' } }
    );
    console.log(`- ${labourUpdate.modifiedCount} Labours ko Worker banaya.`);

    // Field thekedaarId -> contractorId
    const userFieldUpdate = await User.updateMany(
      { thekedaarId: { $exists: true } }, 
      { $rename: { 'thekedaarId': 'contractorId' } }
    );
    console.log(`- ${userFieldUpdate.modifiedCount} Users me thekedaarId ko contractorId kiya.`);

    // ==========================================
    // 2. ASSIGNMENTS COLLECTION UPDATES
    // ==========================================
    const assignmentUpdate = await Assignment.updateMany(
      { thekedaarId: { $exists: true } },
      { $rename: { 'thekedaarId': 'contractorId' } }
    );
    console.log(`\n- ${assignmentUpdate.modifiedCount} Assignments me thekedaarId ko contractorId kiya.`);

    // ==========================================
    // 3. SITES COLLECTION UPDATES
    // ==========================================
    const siteUpdate = await Site.updateMany(
      { thekedaarId: { $exists: true } },
      { $rename: { 'thekedaarId': 'contractorId' } }
    );
    console.log(`- ${siteUpdate.modifiedCount} Sites me thekedaarId ko contractorId kiya.`);

    console.log("\n🎉 MIGRATION SUCCESSFUL! Saara purana data naye standard par aa gaya.");
    process.exit(0); // Script successfully band kar do

  } catch (error) {
    console.error("❌ Migration fail ho gayi:", error);
    process.exit(1);
  }
};

// Script chalao
migrateData();