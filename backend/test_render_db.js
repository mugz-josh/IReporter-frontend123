const { Pool } = require('pg');
require('dotenv').config();

const databaseUrl = 'postgresql://ireporter_user:oRnHxJE58hx8z2xyZVuxRIILi4HOhN7e@dpg-d606jnffte5s73d97d10-a.oregon-postgres.render.com:5432/ireporter_joshua';

console.log('Testing Render PostgreSQL connection...');
console.log('Database URL (masked):', databaseUrl.replace(/:([^:@]{4})[^:@]*@/, ':****@'));

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false, // Required for Render Postgres
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Connected to Render PostgreSQL database');

    // Test query
    const result = await client.query('SELECT version()');
    console.log('✅ Database version:', result.rows[0].version);

    // Check if tables exist
    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('📋 Existing tables:', tablesResult.rows.map(row => row.table_name));

    client.release();
    console.log('✅ Connection test successful');
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    if (err.code) {
      console.error('Error code:', err.code);
    }
  } finally {
    await pool.end();
  }
}

testConnection();
