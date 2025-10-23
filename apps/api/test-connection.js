require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
  try {
    console.log('🔌 Testing MongoDB Connection...');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');
    
    // List databases
    const adminDb = mongoose.connection.db.admin();
    const result = await adminDb.listDatabases();
    console.log('📊 Available databases:', result.databases.map(db => db.name));
    
    // Test collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('🗂️ Collections:', collections.map(col => col.name));
    
    await mongoose.connection.close();
    console.log('✅ Connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    process.exit(1);
  }
}

testConnection();