const mongoose = require('mongoose');

async function cleanUsers() {
  try {
    // Connect to MongoDB with proper options
    await mongoose.connect('mongodb+srv://harsha:harsha123@cluster0.aqk3dfy.mongodb.net/study-buddy', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      retryWrites: true,
      w: 'majority'
    });
    console.log('Connected to MongoDB');

    // Delete all existing users
    const result = await mongoose.connection.collection('users').deleteMany({});
    console.log('Deleted users:', result.deletedCount);

    console.log('Database cleaned successfully');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

cleanUsers(); 