const https = require('https');

const API_BASE = 'https://ireporter-frontend123.onrender.com/api/v1';

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = {
            status: res.statusCode,
            headers: res.headers,
            body: JSON.parse(body)
          };
          resolve(response);
        } catch (e) {
          reject(new Error(`Failed to parse response: ${body}`));
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testRedFlagCreation() {
  try {
    // First, login to get token
    console.log('Logging in to get token...');
    const loginResponse = await makeRequest({
      hostname: 'ireporter-frontend123.onrender.com',
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }, {
      email: 'Mollyadmin@ireporter.com',
      password: 'password'
    });

    if (loginResponse.status !== 200) {
      throw new Error(`Login failed: ${loginResponse.status} - ${JSON.stringify(loginResponse.body)}`);
    }

    const token = loginResponse.body.data[0].token;
    console.log('Login successful, got token');

    // Now create a red flag
    console.log('Creating red flag...');
    const redFlagData = {
      title: 'Test Red Flag',
      description: 'This is a test red flag created via API',
      latitude: -1.2864,
      longitude: 36.8172
    };

    const createResponse = await makeRequest({
      hostname: 'ireporter-frontend123.onrender.com',
      path: '/api/v1/red-flags',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    }, redFlagData);

    console.log('Response status:', createResponse.status);
    console.log('Response headers:', createResponse.headers);
    console.log('Response body:', JSON.stringify(createResponse.body, null, 2));

    if (createResponse.status === 201) {
      console.log('✅ Red flag creation successful!');
    } else {
      console.log('❌ Red flag creation failed');
    }

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testRedFlagCreation();
