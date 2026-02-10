import { Pool } from "pg";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

// Always use PostgreSQL
console.log('🌐 Using PostgreSQL');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/ireporter',
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('render.com') ? {
    rejectUnauthorized: false, // Enable SSL for Render Postgres
  } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Initialize database tables
const initializeTables = async () => {
  try {
    console.log('🔧 Initializing PostgreSQL tables...');
    console.log('📂 SQL file path:', path.join(__dirname, 'init-postgres.sql'));

    // Read and execute the SQL file
    const sqlPath = path.join(__dirname, 'init-postgres.sql');
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
        } catch (stmtError: any) {
          console.error(`❌ Error executing statement ${i + 1}:`, stmtError);
          // Continue with other statements
        }
      }
    }

    console.log('✅ PostgreSQL tables initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing PostgreSQL tables:', error);
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }
  }
};

const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log("✅ Connected to PostgreSQL database via connection pool");
    client.release();

    // Initialize tables after successful connection
    await initializeTables();
  } catch (err) {
    console.error("❌ Error connecting to PostgreSQL database:", err);
  }
};

// Test database connection on startup
testConnection();

export const query = async (sql: string, params: any[] = []) => {
  const result = await pool.query(sql, params);
  return result;
};

export default pool;
