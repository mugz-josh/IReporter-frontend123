const pool = require('./config/database');

async function testAdminUser() {
  try {
    console.log('🔍 Checking for admin user in database...');

    const result = await pool.query(
      'SELECT id, first_name, last_name, email, is_admin FROM users WHERE email = $1',
      ['Mollyadmin@ireporter.com']
    );

    if (result.rows.length > 0) {
      const user = result.rows[0];
      console.log('✅ Admin user found:');
      console.log(`   Name: ${user.first_name} ${user.last_name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Admin: ${user.is_admin}`);
      console.log(`   ID: ${user.id}`);
    } else {
      console.log('❌ Admin user not found in database');
    }

    // Test login with the password
    console.log('\n🔐 Testing password verification...');
    const bcrypt = require('bcryptjs');
    const testPassword = 'password';
    const hashedPassword = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';

    const isValid = await bcrypt.compare(testPassword, hashedPassword);
    console.log(`Password "${testPassword}" is valid: ${isValid}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

testAdminUser();
