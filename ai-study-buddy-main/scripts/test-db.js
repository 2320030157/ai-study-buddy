const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...');
    console.log('MongoDB URI:', process.env.MONGODB_URI);
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Successfully connected to MongoDB!');
    
    // List all collections
    const collections = await mongoose.connection.db.collections();
    console.log('\nCollections in database:');
    for (let collection of collections) {
      const count = await collection.countDocuments();
      console.log(`- ${collection.collectionName}: ${count} documents`);
    }
  } catch (error) {
    console.error('MongoDB connection error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

testConnection(); 