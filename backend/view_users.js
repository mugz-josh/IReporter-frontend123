const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'dpg-d606jnffte5s73d97d10-a.oregon-postgres.render.com',
  user: process.env.DB_USER || 'ireporter_user',
  password: process.env.DB_PASSWORD || 'oRnHxJE58hx8z2xyZVuxRIILi4HOhN7e',
  database: process.env.DB_NAME || 'ireporter_joshua',
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

async function viewUsers() {
  try {
    console.log('👤 Viewing all users in the database...\n');

    const result = await pool.query(
      'SELECT id, first_name, last_name, email, phone, is_admin, created_at FROM users ORDER BY created_at DESC'
    );

    if (result.rows.length === 0) {
      console.log('No users found in the database.');
    } else {
      console.log(`Found ${result.rows.length} user(s):\n`);
      result.rows.forEach((user, index) => {
        const adminBadge = user.is_admin ? '[ADMIN]' : '';
        console.log(`${index + 1}. ${user.first_name} ${user.last_name} (${user.email}) ${adminBadge}`);
        console.log(`   Phone: ${user.phone || 'N/A'}`);
        console.log(`   Created: ${new Date(user.created_at).toLocaleString()}\n`);
      });
    }
  } catch (error) {
    console.error('❌ Error:', error.message || error);
    console.error('Full error:', error);
  } finally {
    await pool.end();
  }
}

viewUsers();
