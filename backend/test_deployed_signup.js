const https = require('https');

async function testDeployedSignup() {
  const signupData = {
    first_name: "Test",
    last_name: "User",
    email: "testuser" + Date.now() + "@example.com", // Unique email
    password: "testpassword123",
    phone: "1234567890"
  };

  console.log('Testing deployed signup with data:', signupData);

  const postData = JSON.stringify(signupData);

  const options = {
    hostname: 'ireporter-frontend123.onrender.com',
    port: 443,
    path: '/api/v1/auth/signup',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = https.request(options, (res) => {
    console.log('Response status:', res.statusCode);
    console.log('Response headers:', res.headers);

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const result = JSON.parse(data);
        console.log('Response body:', result);
      } catch (e) {
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Error:', error.message);
  });

  req.write(postData);
  req.end();
}

testDeployedSignup();
