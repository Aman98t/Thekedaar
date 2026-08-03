// Location: backend/fix-db.js
require('dotenv').config();
const mongoose = require('mongoose');

const fixData = async () => {
  try {
    console.log("⏳ Connecting to Database directly...");
    await mongoose.connect(process.env.MONGO_URI);
    
    // Mongoose schema ko bypass karke direct MongoDB collections access kar rahe hain
    const db = mongoose.connection.db;

    console.log("🔄 Fixing Missing IDs in Collections...");

    // 1. Users Collection
    const users = await db.collection('users').updateMany(
      { thekedaarId: { $exists: true } },
      { $rename: { "thekedaarId": "contractorId" } }
    );
    console.log(`✅ Users fixed: ${users.modifiedCount}`);

    // 2. Sites Collection
    const sites = await db.collection('sites').updateMany(
      { thekedaarId: { $exists: true } },
      { $rename: { "thekedaarId": "contractorId" } }
    );
    console.log(`✅ Sites fixed: ${sites.modifiedCount}`);

    // 3. Assignments Collection
    const assignments = await db.collection('assignments').updateMany(
      { thekedaarId: { $exists: true } },
      { $rename: { "thekedaarId": "contractorId" } }
    );
    console.log(`✅ Assignments fixed: ${assignments.modifiedCount}`);

    console.log("\n🎉 ALL DONE! Thekedaar -> Contractor ID migration is 100% complete.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
};

fixData();