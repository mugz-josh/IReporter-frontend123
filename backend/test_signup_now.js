const fetch = require('node-fetch');

async function testSignup() {
  const signupData = {
    first_name: "Test",
    last_name: "User",
    email: "testuser@example.com",
    password: "testpassword123",
    phone: "1234567890"
  };

  console.log('Testing signup with data:', signupData);

  try {
    const response = await fetch('http://localhost:3001/api/v1/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(signupData)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('Response body:', responseText);

    if (response.ok) {
      console.log('✅ Signup successful!');
    } else {
      console.log('❌ Signup failed');
    }
  } catch (error) {
    console.error('Error testing signup:', error.message);
  }
}

testSignup();
