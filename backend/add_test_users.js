const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
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

async function addTestUsers() {
  try {
    console.log('👤 Adding test users to database...');

    // Add some test users
    const testUsers = [
      { first_name: 'John', last_name: 'Doe', email: 'john@example.com', password: 'password123' },
      { first_name: 'Jane', last_name: 'Smith', email: 'jane@example.com', password: 'password123' },
      { first_name: 'Bob', last_name: 'Johnson', email: 'bob@example.com', password: 'password123' },
      { first_name: 'Alice', last_name: 'Brown', email: 'alice@example.com', password: 'password123' },
      { first_name: 'Mike', last_name: 'Wilson', email: 'mike@example.com', password: 'password123' },
      { first_name: 'Damulira', last_name: 'Hakim', email: 'damulira.hakim@example.com', password: 'password123' }
    ];

    for (const user of testUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await pool.query(
        'INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING',
        [user.first_name, user.last_name, user.email, hashedPassword]
      );
      console.log('✅ Added user:', user.first_name, user.last_name, '-', user.email);
    }

    console.log('🎉 Test users added successfully!');

    // Show all users
    console.log('\n📊 All users in database:');
    const result = await pool.query('SELECT id, first_name, last_name, email, is_admin, created_at FROM users ORDER BY created_at DESC');

    result.rows.forEach((user, index) => {
      const adminBadge = user.is_admin ? '[ADMIN]' : '';
      console.log(`${index + 1}. ${user.first_name} ${user.last_name} (${user.email}) ${adminBadge}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

addTestUsers();
