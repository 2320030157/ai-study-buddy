const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function viewUsers() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected successfully!');

    // Get the users collection
    const users = await mongoose.connection.db.collection('users');
    
    // Find all users
    const allUsers = await users.find({}).toArray();
    
    console.log('\nUsers in database:');
    allUsers.forEach(user => {
      console.log(`\nUser ID: ${user._id}`);
      console.log(`Name: ${user.name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Created At: ${user.createdAt}`);
      console.log('Study Preferences:', user.studyPreferences || 'Not set');
      console.log('-'.repeat(50));
    });

    console.log(`\nTotal users: ${allUsers.length}`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

viewUsers(); 