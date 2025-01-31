const bcrypt = require('bcryptjs');

async function testPasswordComparison() {
  // Try different variations of the password
  const testCases = [
    {
      email: 'test2@gmail.com',
      plaintextPassword: 'test123',
      hashedPassword: '$2a$12$E51la/cC3QpaBnoNzd9Fi.zYHf4s8Dg9Pq6Ip7Nh5gaa7wG02LxtO'
    },
    {
      email: 'test2@gmail.com',
      plaintextPassword: 'Test123',
      hashedPassword: '$2a$12$E51la/cC3QpaBnoNzd9Fi.zYHf4s8Dg9Pq6Ip7Nh5gaa7wG02LxtO'
    },
    {
      email: 'test2@gmail.com',
      plaintextPassword: 'test123!',
      hashedPassword: '$2a$12$E51la/cC3QpaBnoNzd9Fi.zYHf4s8Dg9Pq6Ip7Nh5gaa7wG02LxtO'
    },
    {
      email: 'test2@gmail.com',
      plaintextPassword: 'Test123!',
      hashedPassword: '$2a$12$E51la/cC3QpaBnoNzd9Fi.zYHf4s8Dg9Pq6Ip7Nh5gaa7wG02LxtO'
    }
  ];

  console.log('🔍 Starting password comparison test...\n');

  for (const testCase of testCases) {
    try {
      console.log(`Testing for email: ${testCase.email}`);
      console.log(`Plaintext password: ${testCase.plaintextPassword}`);
      console.log(`Hashed password from DB: ${testCase.hashedPassword}`);
      
      const isMatch = await bcrypt.compare(
        testCase.plaintextPassword,
        testCase.hashedPassword
      );
      
      console.log(`✅ Password Match: ${isMatch}\n`);
    } catch (error) {
      console.error('🔴 Error comparing passwords:', error);
    }
  }

  // Let's also test creating a new hash with the same settings
  console.log('🔍 Testing password hashing with same settings...');
  const salt = await bcrypt.genSalt(12);
  const testPassword = 'test123';
  const newHash = await bcrypt.hash(testPassword, salt);
  console.log(`Original hash: $2a$12$E51la/cC3QpaBnoNzd9Fi.zYHf4s8Dg9Pq6Ip7Nh5gaa7wG02LxtO`);
  console.log(`New hash    : ${newHash}`);
}

testPasswordComparison(); 