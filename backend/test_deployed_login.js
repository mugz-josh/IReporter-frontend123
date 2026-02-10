const https = require('https');

async function testDeployedLogin() {
  const loginData = {
    email: "Mollyadmin@ireporter.com", // Use the admin user that should exist
    password: "password"
  };

  console.log('Testing deployed login with data:', loginData);

  const postData = JSON.stringify(loginData);

  const options = {
    hostname: 'ireporter-frontend123.onrender.com',
    port: 443,
    path: '/api/v1/auth/login',
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

testDeployedLogin();
