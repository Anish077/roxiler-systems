/**
 * Seed script — creates an initial admin user.
 * Run: node seed.js  (from backend/)
 */
const dns = require('dns');
dns.setServers(['8.8.8.8:53', '1.1.1.1:53']);

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const ADMIN = {
  name: 'Platform Administrator Account',  // must be 20-60 chars
  email: 'admin@roxiler.com',
  password: 'Admin@1234',                  // 8-16 chars, uppercase + special
  address: 'Roxiler Systems HQ, Mumbai, India',
  role: 'admin',
};

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  const existing = await User.findOne({ email: ADMIN.email });
  if (existing) {
    console.log('ℹ️  Admin already exists. Skipping.');
    process.exit(0);
  }

  await User.create(ADMIN);
  console.log('🎉 Admin user created!');
  console.log(`   Email:    ${ADMIN.email}`);
  console.log(`   Password: ${ADMIN.password}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
