const { Pool } = require('pg');

async function testLocalConnection() {
  console.log('🔍 Testing local PostgreSQL connection...\n');

  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'ireporter',
    port: parseInt(process.env.DB_PORT || '5432'),
  });

  try {
    const client = await pool.connect();
    console.log('✅ Successfully connected to local PostgreSQL database');

    // Check tables
    const result = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log(`📊 Tables found: ${result.rows.length}`);

    if (result.rows.length === 0) {
      console.log('❌ No tables found - you need to run the setup script');
      console.log('💡 Run: node setupLocalDatabase.js');
    } else {
      console.log('✅ Tables exist:');
      result.rows.forEach(row => {
        console.log(`  - ${row.table_name}`);
      });

      // Check for test users
      const usersResult = await pool.query('SELECT COUNT(*) as count FROM users');
      console.log(`👥 Users in database: ${usersResult.rows[0].count}`);
    }

    client.release();

  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure PostgreSQL is running: pg_ctl start');
    console.log('2. Check your .env file credentials');
    console.log('3. Try creating database manually: createdb ireporter');
  } finally {
    await pool.end();
  }
}

testLocalConnection();
