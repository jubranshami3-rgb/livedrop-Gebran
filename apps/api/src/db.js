const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('Connection string:', process.env.MONGODB_URI ? '✓ Found' : '✗ Missing');
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database Name: ${conn.connection.name}`);
    console.log(`👤 Connected as: ${conn.connection.user}`);
    
    // Test the connection
    const adminDb = conn.connection.db.admin();
    const serverStatus = await adminDb.serverStatus();
    console.log(`🗄️ MongoDB Version: ${serverStatus.version}`);
    
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.error('💡 Troubleshooting tips:');
    console.error('   1. Check your MONGODB_URI in .env file');
    console.error('   2. Verify MongoDB Atlas cluster is running');
    console.error('   3. Check network access in MongoDB Atlas');
    console.error('   4. Verify database username/password');
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

module.exports = connectDB;