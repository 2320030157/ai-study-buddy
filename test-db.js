const mongoose = require('mongoose');

async function checkUser() {
  try {
    // Connect to MongoDB with proper options
    await mongoose.connect('mongodb+srv://harsha:harsha123@cluster0.aqk3dfy.mongodb.net/study-buddy', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    console.log('Connected to MongoDB');

    // Get the User model
    const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
      email: String,
      password: String,
      name: String
    }));

    // Find the user (try both with and without case sensitivity)
    const userEmail = 'harshareddy3@gmail.com';
    const user = await User.findOne({
      $or: [
        { email: userEmail.toLowerCase() },
        { email: new RegExp('^' + userEmail + '$', 'i') }
      ]
    }).select('+password');
    
    if (user) {
      console.log('User found:', {
        id: user._id,
        email: user.email,
        name: user.name,
        hasPassword: !!user.password,
        passwordLength: user.password?.length,
        passwordHash: user.password
      });
    } else {
      // Try to find any users in the database
      const totalUsers = await User.countDocuments();
      console.log('No user found with this email. Total users in database:', totalUsers);
      
      // List all users (for debugging)
      const allUsers = await User.find({}).select('email name');
      console.log('All users:', allUsers.map(u => ({ email: u.email, name: u.name })));
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkUser(); 