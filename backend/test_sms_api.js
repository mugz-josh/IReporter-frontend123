import SMSService from './services/smsService';

async function testSMSAPI() {
  console.log('Testing Africa...\n');

  // Check if credentials are configured
  const apiKey = process.env.AFRICAS_TALKING_API_KEY;
  const username = process.env.AFRICAS_TALKING_USERNAME;

  console.log('API Credentials Check:');
  console.log(`- API Key configured: ${!!apiKey}`);
  console.log(`- Username configured: ${!!username}`);

  if (!apiKey || !username) {
    console.log('\n❌ API credentials are not configured in environment variables.');
    console.log('Please set AFRICAS_TALKING_API_KEY and AFRICAS_TALKING_USERNAME in your .env file.');
    return;
  }

  console.log('\n✅ API credentials are configured.');

  // Test SMS sending (using a test phone number)
  console.log('\nTesting SMS send...');




  
  try {
    // Note: Replace with a valid test phone number in international format
    const testPhoneNumber = '+256700000000'; // Replace with actual test number
    const result = await SMSService.sendSMS({
      to: testPhoneNumber,
      message: 'Test SMS from iReporter API'
    });

    if (result) {
      console.log('✅ SMS sent successfully!');
      console.log('Check your phone for the test message.');
    } else {
      console.log('❌ SMS sending failed.');
      console.log('Check the console logs for error details.');
    }
  } catch (error) {
    console.log('❌ Error during SMS test:', error.message);
  }
}

// Run the test
testSMSAPI().catch(console.error);
