const fetch = require('node-fetch');

async function testSignup() {
  const signupData = {
    first_name: "Davis",
    last_name: "Kwezi",
    email: "daviskwezirahisham5645@gmail.com",
    password: "Kweziramyf",
    phone: "1234567890"
  };

  console.log('Testing signup with data:', signupData);

  const postData = JSON.stringify(signupData);

  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/v1/auth/signup',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
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

testSignup();
