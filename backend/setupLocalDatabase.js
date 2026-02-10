const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function setupLocalDatabase() {
  console.log('🔧 Setting up local PostgreSQL database for iReporter...\n');

  // First, try to connect without specifying a database to create it
  const adminPool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    port: parseInt(process.env.DB_PORT || '5432'),
  });

  try {
    // Create database if it doesn't exist
    console.log('📦 Creating database if it doesn\'t exist...');
    await adminPool.query(`CREATE DATABASE ${process.env.DB_NAME || 'ireporter'}`);
    console.log('✅ Database created or already exists');
  } catch (err) {
    if (err.code === '42P04') {
      console.log('✅ Database already exists');
    } else {
      console.log('⚠️ Could not create database:', err.message);
      console.log('💡 Make sure PostgreSQL is running and you have admin privileges');
    }
  } finally {
    await adminPool.end();
  }

  // Now connect to the specific database
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'ireporter',
    port: parseInt(process.env.DB_PORT || '5432'),
  });

  try {
    console.log('🔌 Connecting to database...');
    const client = await pool.connect();
    console.log('✅ Connected to database');
    client.release();

    // Drop existing tables if they exist
    console.log('🗑️  Dropping existing tables...');
    const tables = ['follows', 'upvotes', 'comments', 'notifications', 'interventions', 'red_flags', 'users'];
    for (const table of tables) {
      try {
        await pool.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
        console.log(`✅ Dropped table "${table}"`);
      } catch (err) {
        console.log(`⚠️ Could not drop table "${table}":`, err.message);
      }
    }

    // Read and execute the init-postgres.sql file
    console.log('📄 Reading SQL schema...');
    const initSqlPath = path.join(__dirname, 'config', 'init-postgres.sql');
    const initSql = fs.readFileSync(initSqlPath, 'utf8');

    console.log('🏗️  Creating tables...');
    try {
      await pool.query(initSql);
      console.log('✅ All tables created successfully');
    } catch (err) {
      console.log('⚠️ Bulk SQL execution failed, trying individual statements...');

      const statements = initSql.split(';').filter(stmt => stmt.trim().length > 0);

      for (const statement of statements) {
        if (statement.trim()) {
          try {
            await pool.query(statement);
          } catch (err) {
            console.log(`⚠️ Statement failed:`, statement.substring(0, 50) + '...');
            console.log(`Error:`, err.message);
          }
        }
      }
    }

    // Verify tables were created
    const tablesResult = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    console.log('📋 Created tables:', tablesResult.rows.map(row => row.table_name));

    // Insert test data
    console.log('🔧 Inserting test data...');

    const bcrypt = require('bcryptjs');

    // Create test user (password: test123)
    const hashedPassword = await bcrypt.hash('test123', 10);
    await pool.query(`
      INSERT INTO users (first_name, last_name, email, password, is_admin)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO NOTHING
    `, ['Test', 'User', 'test@example.com', hashedPassword, false]);

    // Create admin user (password: admin123)
    const adminHashedPassword = await bcrypt.hash('admin123', 10);
    await pool.query(`
      INSERT INTO users (first_name, last_name, email, password, is_admin)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO NOTHING
    `, ['Admin', 'User', 'admin@example.com', adminHashedPassword, true]);

    console.log('✅ Test users created:');
    console.log('   - test@example.com / test123 (regular user)');
    console.log('   - admin@example.com / admin123 (admin user)');

    console.log('🎉 LOCAL DATABASE SETUP COMPLETED SUCCESSFULLY!');
    console.log('🚀 You can now login with the test accounts!');

  } catch (err) {
    console.error('❌ Database setup failed:', err);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure PostgreSQL is running');
    console.log('2. Check your .env file credentials');
    console.log('3. Try running: pg_ctl start (if using PostgreSQL app)');
    throw err;
  } finally {
    await pool.end();
  }
}

setupLocalDatabase().catch(console.error);
