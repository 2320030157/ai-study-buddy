import bcrypt from 'bcryptjs';

async function testPasswordComparison() {
  const testCases = [
    {
      email: 'test2@gmail.com',
      plaintextPassword: 'test123', // Replace this with the actual password you used
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
}

testPasswordComparison(); 