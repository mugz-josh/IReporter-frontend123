const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const databaseUrl = process.env.DATABASE_URL || 'postgresql://ireporter_user:oRnHxJE58hx8z2xyZVuxRIILi4HOhN7e@dpg-d606jnffte5s73d97d10-a.oregon-postgres.render.com:5432/ireporter_joshua';

console.log('🚀 Initializing Render PostgreSQL database...');
console.log('Database URL configured:', databaseUrl ? 'Yes' : 'No');

if (!databaseUrl) {
  console.error('❌ DATABASE_URL environment variable is not set!');
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false, // Required for Render Postgres
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 20000,
});

async function initializeDatabase() {
  try {
    console.log('🔧 Initializing PostgreSQL tables...');

    // Read the SQL file
    const sqlPath = path.join(__dirname, 'config', 'init-postgres.sql');
    if (!fs.existsSync(sqlPath)) {
      console.error(`❌ SQL file not found at: ${sqlPath}`);
      throw new Error(`SQL initialization file not found at ${sqlPath}`);
    }

    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    console.log('📄 SQL content length:', sqlContent.length);

    // Split by semicolon and execute each statement
    const statements = sqlContent.split(';').filter(stmt => stmt.trim().length > 0);
    console.log('📋 Number of SQL statements:', statements.length);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]?.trim();
      if (statement) {
        console.log(`🔄 Executing statement ${i + 1}/${statements.length}`);
        try {
          await pool.query(statement);
          console.log(`✅ Statement ${i + 1} executed successfully`);
        } catch (stmtError) {
          // Don't treat table already exists as an error
          if (stmtError.code === '42P07' || stmtError.message?.includes('already exists')) {
            console.log(`ℹ️  Table already exists (statement ${i + 1}), skipping...`);
          } else {
            console.error(`❌ Error executing statement ${i + 1}:`, stmtError.message || stmtError);
          }
        }
      }
    }

    console.log('✅ PostgreSQL tables initialized successfully');

    // Test the connection
    const result = await pool.query('SELECT 1 as test');
    console.log('✅ Database connection test successful');

  } catch (error) {
    console.error('❌ Error initializing database:', error);
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }
    throw error;
  } finally {
    await pool.end();
  }
}

initializeDatabase().then(() => {
  console.log('🎉 Database initialization complete!');
}).catch((err) => {
  console.error('❌ Database initialization failed:', err);
  process.exit(1);
});
